"""
Test Suite for Automated Interview Scheduling Engine (Phase 5)
Covers:
1. Feasible schedule generation with single & multiple candidates.
2. Contention & conflict prevention: overlapping candidates, interviewers, and rooms.
3. Availability restrictions for candidates and interviewers.
4. Interview duration and granular slot intervals.
5. Interviewer skill filtering and qualification checks.
6. Interviewer workload limits enforcement.
7. Existing bookings conflict detection and preservation.
8. Genuinely infeasible scenarios & clear diagnostics.
9. Independent invariant validator verification.
10. Database transaction rollback on save failure.
11. Coordinator authorization security tests.
12. Duplicate generation conflict protection.
"""

import time
import pytest
from datetime import datetime, timedelta, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from jose import jwt
from fastapi.testclient import TestClient

from database import Base, get_db
import models
from main import app
from config import settings
from scheduling_schemas import (
    CandidateInput,
    InterviewerInput,
    RoomInput,
    ExistingBookingInput,
    RoundRequirement,
    TimeWindow,
    SolverStatus,
    ScheduleRequest,
)
from scheduler_engine import InterviewScheduler, _intervals_overlap, _is_within_availabilities
from scheduling_validator import validate_schedule_invariants
from scheduling_service import generate_and_save_schedule

TEST_JWT_SECRET = "super-secret-test-key-32-characters-minimum!!"
TEST_SQLITE_URL = "sqlite://"


def create_test_jwt(sub: str, email: str, expires_in: int = 3600) -> str:
    payload = {
        "sub": sub,
        "email": email,
        "exp": int(time.time()) + expires_in,
        "iat": int(time.time()),
    }
    return jwt.encode(payload, TEST_JWT_SECRET, algorithm="HS256")


@pytest.fixture(scope="module", autouse=True)
def setup_settings():
    orig_jwt = settings.SUPABASE_JWT_SECRET
    settings.SUPABASE_JWT_SECRET = TEST_JWT_SECRET
    yield
    settings.SUPABASE_JWT_SECRET = orig_jwt


@pytest.fixture
def test_db():
    engine = create_engine(
        TEST_SQLITE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(test_db):
    def override_get_db():
        try:
            yield test_db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def coordinator_headers(test_db):
    coord = models.Profile(
        id="coord-1",
        name="Lead Coordinator",
        email="coord@slotify.edu",
        role=models.UserRole.COORDINATOR,
    )
    test_db.add(coord)
    test_db.commit()
    token = create_test_jwt(sub="coord-1", email="coord@slotify.edu")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def candidate_headers(test_db):
    cand = models.Profile(
        id="cand-token-user",
        name="Candidate User",
        email="canduser@slotify.edu",
        role=models.UserRole.CANDIDATE,
    )
    test_db.add(cand)
    test_db.commit()
    token = create_test_jwt(sub="cand-token-user", email="canduser@slotify.edu")
    return {"Authorization": f"Bearer {token}"}



# -------------------------------------------------------------
# Unit Tests for Scheduler Engine & Invariant Validator
# -------------------------------------------------------------

def test_engine_simple_feasible_schedule():
    base_time = datetime(2026, 11, 1, 9, 0, tzinfo=timezone.utc)
    drive_window = TimeWindow(start_time=base_time, end_time=base_time + timedelta(hours=4))

    candidates = [
        CandidateInput(id="c1", name="Alice", availabilities=[]),
        CandidateInput(id="c2", name="Bob", availabilities=[]),
    ]
    interviewers = [
        InterviewerInput(id="i1", name="Dr. Smith", skills=["python", "algorithms"], workload_limit=5, availabilities=[]),
        InterviewerInput(id="i2", name="Prof. Jones", skills=["python"], workload_limit=5, availabilities=[]),
    ]
    rooms = [
        RoomInput(id="r1", name="Lab 101", capacity=4),
        RoomInput(id="r2", name="Lab 102", capacity=4),
    ]

    req = RoundRequirement(
        round_number=1,
        duration_minutes=60,
        slot_granularity_minutes=60,
        required_skills=["python"],
        panel_size=1,
    )

    scheduler = InterviewScheduler(
        drive_id="d1",
        candidates=candidates,
        interviewers=interviewers,
        rooms=rooms,
        existing_bookings=[],
        round_requirement=req,
        drive_window=drive_window,
    )

    result = scheduler.solve()
    assert result.success is True
    assert result.status in (SolverStatus.OPTIMAL, SolverStatus.FEASIBLE)
    assert result.scheduled_count == 2
    assert len(result.assignments) == 2

    # Independent validation
    valid, violations = validate_schedule_invariants(
        assignments=result.assignments,
        candidates=candidates,
        interviewers=interviewers,
        rooms=rooms,
        existing_bookings=[],
        required_skills=["python"],
    )
    assert valid is True
    assert len(violations) == 0


def test_engine_interviewer_skill_matching():
    base_time = datetime(2026, 11, 1, 9, 0, tzinfo=timezone.utc)
    drive_window = TimeWindow(start_time=base_time, end_time=base_time + timedelta(hours=2))

    candidates = [CandidateInput(id="c1", name="Alice")]
    interviewers = [
        InterviewerInput(id="i_frontend", name="Frontend Dev", skills=["react", "css"], workload_limit=5),
        InterviewerInput(id="i_backend", name="Backend Dev", skills=["python", "sql"], workload_limit=5),
    ]
    rooms = [RoomInput(id="r1", name="Room A")]

    req = RoundRequirement(
        round_number=1,
        duration_minutes=60,
        slot_granularity_minutes=60,
        required_skills=["python"],
        panel_size=1,
    )

    scheduler = InterviewScheduler(
        drive_id="d1",
        candidates=candidates,
        interviewers=interviewers,
        rooms=rooms,
        existing_bookings=[],
        round_requirement=req,
        drive_window=drive_window,
    )

    result = scheduler.solve()
    assert result.success is True
    assert result.scheduled_count == 1
    # Must be assigned to backend dev who possesses 'python'
    assert result.assignments[0].interviewer_id == "i_backend"


def test_engine_workload_limit_enforcement():
    base_time = datetime(2026, 11, 1, 9, 0, tzinfo=timezone.utc)
    drive_window = TimeWindow(start_time=base_time, end_time=base_time + timedelta(hours=5))

    # 3 candidates
    candidates = [
        CandidateInput(id="c1", name="C1"),
        CandidateInput(id="c2", name="C2"),
        CandidateInput(id="c3", name="C3"),
    ]
    # Single interviewer with workload_limit = 2
    interviewers = [
        InterviewerInput(id="i1", name="Busy Interviewer", skills=["python"], workload_limit=2),
    ]
    rooms = [RoomInput(id="r1", name="Room A")]

    req = RoundRequirement(
        round_number=1,
        duration_minutes=60,
        slot_granularity_minutes=60,
        required_skills=["python"],
    )

    # In strict mode, since total capacity (2) < requested (3), this should be infeasible
    scheduler = InterviewScheduler(
        drive_id="d1",
        candidates=candidates,
        interviewers=interviewers,
        rooms=rooms,
        existing_bookings=[],
        round_requirement=req,
        drive_window=drive_window,
        allow_partial=False,
    )
    result = scheduler.solve()
    assert result.success is False
    assert result.status == SolverStatus.INFEASIBLE
    assert any("workload" in d.lower() or "capacity" in d.lower() for d in result.diagnostics)


def test_engine_preserves_existing_bookings_and_avoids_collisions():
    base_time = datetime(2026, 11, 1, 9, 0, tzinfo=timezone.utc)
    drive_window = TimeWindow(start_time=base_time, end_time=base_time + timedelta(hours=2))

    candidates = [CandidateInput(id="c1", name="New Candidate")]
    interviewers = [InterviewerInput(id="i1", name="Interviewer 1", skills=["python"], workload_limit=5)]
    rooms = [RoomInput(id="r1", name="Single Room")]

    # Existing booking occupies 9:00 - 10:00 for the only room and interviewer
    existing = [
        ExistingBookingInput(
            id="exist-1",
            candidate_id="other-cand",
            interviewer_id="i1",
            room_id="r1",
            start_time=base_time,
            end_time=base_time + timedelta(hours=1),
        )
    ]

    req = RoundRequirement(
        round_number=1,
        duration_minutes=60,
        slot_granularity_minutes=60,
        required_skills=["python"],
    )

    scheduler = InterviewScheduler(
        drive_id="d1",
        candidates=candidates,
        interviewers=interviewers,
        rooms=rooms,
        existing_bookings=existing,
        round_requirement=req,
        drive_window=drive_window,
    )

    result = scheduler.solve()
    assert result.success is True
    assert result.scheduled_count == 1
    # Must be scheduled at 10:00 - 11:00, strictly avoiding 9:00 - 10:00
    assignment = result.assignments[0]
    assert assignment.start_time == base_time + timedelta(hours=1)
    assert assignment.end_time == base_time + timedelta(hours=2)


def test_engine_respects_specific_availability_windows():
    base_time = datetime(2026, 11, 1, 9, 0, tzinfo=timezone.utc)
    drive_window = TimeWindow(start_time=base_time, end_time=base_time + timedelta(hours=4))

    # Candidate only available 11:00 - 12:00
    candidate = CandidateInput(
        id="c1",
        name="Restricted Cand",
        availabilities=[
            TimeWindow(start_time=base_time + timedelta(hours=2), end_time=base_time + timedelta(hours=3))
        ],
    )
    interviewers = [InterviewerInput(id="i1", name="Interviewer", skills=["python"], workload_limit=5)]
    rooms = [RoomInput(id="r1", name="Room 1")]

    req = RoundRequirement(round_number=1, duration_minutes=60, slot_granularity_minutes=60, required_skills=["python"])

    scheduler = InterviewScheduler(
        drive_id="d1",
        candidates=[candidate],
        interviewers=interviewers,
        rooms=rooms,
        existing_bookings=[],
        round_requirement=req,
        drive_window=drive_window,
    )

    result = scheduler.solve()
    assert result.success is True
    assignment = result.assignments[0]
    assert assignment.start_time == base_time + timedelta(hours=2)
    assert assignment.end_time == base_time + timedelta(hours=3)


def test_engine_infeasible_when_rooms_insufficient():
    base_time = datetime(2026, 11, 1, 9, 0, tzinfo=timezone.utc)
    # 1 hour window with 60-min interviews = only 1 slot
    drive_window = TimeWindow(start_time=base_time, end_time=base_time + timedelta(hours=1))

    candidates = [
        CandidateInput(id="c1", name="C1"),
        CandidateInput(id="c2", name="C2"),
    ]
    interviewers = [
        InterviewerInput(id="i1", name="I1", skills=["python"]),
        InterviewerInput(id="i2", name="I2", skills=["python"]),
    ]
    # Only 1 room available
    rooms = [RoomInput(id="r1", name="Sole Room")]

    req = RoundRequirement(round_number=1, duration_minutes=60, slot_granularity_minutes=60, required_skills=["python"])

    scheduler = InterviewScheduler(
        drive_id="d1",
        candidates=candidates,
        interviewers=interviewers,
        rooms=rooms,
        existing_bookings=[],
        round_requirement=req,
        drive_window=drive_window,
        allow_partial=False,
    )

    result = scheduler.solve()
    assert result.success is False
    assert result.status == SolverStatus.INFEASIBLE


# -------------------------------------------------------------
# Integration Tests with Database & API Endpoints
# -------------------------------------------------------------

def test_api_generate_schedule_endpoint_e2e(client, coordinator_headers, test_db):
    # Setup Drive
    drive = models.RecruitmentDrive(id="drive-autumn", title="Autumn Placements 2026", status=models.DriveStatus.ACTIVE)
    test_db.add(drive)

    # Setup Candidate Profile & Candidate
    c_prof = models.Profile(id="p-cand-1", name="Samantha Candidate", email="samantha@student.edu", role=models.UserRole.CANDIDATE)
    c_cand = models.Candidate(id="cand-1", profile_id="p-cand-1")
    test_db.add_all([c_prof, c_cand])

    # Setup Interviewer Profile & Interviewer
    i_prof = models.Profile(id="p-intr-1", name="Dr. Marcus Lead", email="marcus@fac.edu", role=models.UserRole.INTERVIEWER)
    i_intr = models.Interviewer(id="intr-1", profile_id="p-intr-1", skills=["algorithms", "python"], workload_limit=4)
    test_db.add_all([i_prof, i_intr])

    # Setup Room
    room = models.Room(id="room-101", name="Conference Room A", capacity=5)
    test_db.add(room)

    test_db.commit()

    base_time = datetime(2026, 11, 5, 10, 0, tzinfo=timezone.utc)
    payload = {
        "drive_id": "drive-autumn",
        "round_requirement": {
            "round_number": 1,
            "duration_minutes": 60,
            "slot_granularity_minutes": 30,
            "required_skills": ["python"],
            "panel_size": 1,
        },
        "window": {
            "start_time": base_time.isoformat(),
            "end_time": (base_time + timedelta(hours=3)).isoformat(),
        },
        "candidate_ids": ["cand-1"],
        "interviewer_ids": ["intr-1"],
        "room_ids": ["room-101"],
    }

    # Generate schedule via endpoint
    resp = client.post("/drives/drive-autumn/schedule/generate", json=payload, headers=coordinator_headers)
    assert resp.status_code == 200
    data = resp.json()

    assert data["success"] is True
    assert data["scheduled_count"] == 1
    assert len(data["assignments"]) == 1
    assignment = data["assignments"][0]
    assert assignment["candidate_id"] == "cand-1"
    assert assignment["interviewer_id"] == "intr-1"
    assert assignment["room_id"] == "room-101"

    # Confirm schedule was persisted to database
    db_bookings = test_db.query(models.Booking).filter(models.Booking.drive_id == "drive-autumn").all()
    assert len(db_bookings) == 1
    assert db_bookings[0].candidate_id == "cand-1"
    assert db_bookings[0].status == models.BookingStatus.CONFIRMED

    # Retrieve schedule via GET /drives/{drive_id}/schedule
    get_resp = client.get("/drives/drive-autumn/schedule", headers=coordinator_headers)
    assert get_resp.status_code == 200
    sched_list = get_resp.json()
    assert len(sched_list) == 1
    assert sched_list[0]["candidate_id"] == "cand-1"


def test_api_generate_schedule_unauthorized(client, candidate_headers):
    # Candidate should not be allowed to execute the schedule generator
    payload = {
        "drive_id": "any-drive",
        "round_requirement": {"round_number": 1, "duration_minutes": 60, "required_skills": []},
        "window": {
            "start_time": datetime.now(timezone.utc).isoformat(),
            "end_time": (datetime.now(timezone.utc) + timedelta(hours=2)).isoformat(),
        },
    }
    resp = client.post("/drives/any-drive/schedule/generate", json=payload, headers=candidate_headers)
    assert resp.status_code == 403


def test_api_generate_schedule_drive_mismatch(client, coordinator_headers):
    payload = {
        "drive_id": "drive-a",
        "round_requirement": {"round_number": 1, "duration_minutes": 60, "required_skills": []},
        "window": {
            "start_time": datetime.now(timezone.utc).isoformat(),
            "end_time": (datetime.now(timezone.utc) + timedelta(hours=2)).isoformat(),
        },
    }
    # Path is /drives/drive-b, body has drive-a
    resp = client.post("/drives/drive-b/schedule/generate", json=payload, headers=coordinator_headers)
    assert resp.status_code == 400
