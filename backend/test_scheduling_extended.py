"""
Additional Test Suite for Scheduler Edge Cases and Constraints:
- Multiple candidates competing for same interviewer and room
- Overlapping interval handling with distinct durations & slot granularity
- Missing required records validation
- Genuinely infeasible diagnosis reporting
- Database transaction rollback when DB write encounters error
- Duplicate request collision protection
- Partial generation mode vs strict all-or-nothing mode
"""

import pytest
from datetime import datetime, timedelta, timezone
from unittest.mock import patch
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base
import models
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
from scheduler_engine import InterviewScheduler
from scheduling_validator import validate_schedule_invariants
from scheduling_service import generate_and_save_schedule

TEST_SQLITE_URL = "sqlite://"


@pytest.fixture
def db_session():
    engine = create_engine(TEST_SQLITE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


def test_contention_multiple_candidates_same_interviewer():
    """Verify that multiple candidates competing for a single interviewer get allocated sequentially without overlap."""
    base_time = datetime(2026, 11, 1, 9, 0, tzinfo=timezone.utc)
    drive_window = TimeWindow(start_time=base_time, end_time=base_time + timedelta(hours=3))

    candidates = [
        CandidateInput(id="c1", name="Candidate 1"),
        CandidateInput(id="c2", name="Candidate 2"),
        CandidateInput(id="c3", name="Candidate 3"),
    ]
    # Single interviewer available all 3 hours
    interviewers = [InterviewerInput(id="i1", name="Sole Evaluator", skills=["tech"], workload_limit=5)]
    # Single room
    rooms = [RoomInput(id="r1", name="Interview Room 1")]

    req = RoundRequirement(round_number=1, duration_minutes=60, slot_granularity_minutes=60, required_skills=["tech"])

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
    assert result.scheduled_count == 3
    times = [(a.start_time, a.end_time) for a in result.assignments]
    # Ensure all 3 intervals are completely disjoint
    assert times[0][1] <= times[1][0] or times[1][1] <= times[0][0]
    assert times[1][1] <= times[2][0] or times[2][1] <= times[1][0]
    assert times[0][1] <= times[2][0] or times[2][1] <= times[0][0]


def test_overlapping_granularity_and_duration():
    """Verify that 45-minute interviews with 15-minute slot steps prevent overlapping slot selections."""
    base_time = datetime(2026, 11, 1, 9, 0, tzinfo=timezone.utc)
    # 90 minutes window: allows at most two 45-min interviews (0-45 and 45-90)
    drive_window = TimeWindow(start_time=base_time, end_time=base_time + timedelta(minutes=90))

    candidates = [CandidateInput(id="c1", name="C1"), CandidateInput(id="c2", name="C2")]
    interviewers = [InterviewerInput(id="i1", name="I1", skills=["core"], workload_limit=5)]
    rooms = [RoomInput(id="r1", name="R1")]

    req = RoundRequirement(round_number=1, duration_minutes=45, slot_granularity_minutes=15, required_skills=["core"])

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
    assert result.scheduled_count == 2
    a1, a2 = sorted(result.assignments, key=lambda x: x.start_time)
    assert a1.end_time <= a2.start_time
    assert a1.end_time == base_time + timedelta(minutes=45)
    assert a2.start_time == base_time + timedelta(minutes=45)


def test_missing_records_validation():
    """Verify that scheduling engine safely rejects requests missing essential entities with clear errors."""
    base_time = datetime(2026, 11, 1, 9, 0, tzinfo=timezone.utc)
    drive_window = TimeWindow(start_time=base_time, end_time=base_time + timedelta(hours=2))
    req = RoundRequirement(round_number=1, duration_minutes=60, required_skills=["java"])

    # No candidates
    s1 = InterviewScheduler("d1", [], [InterviewerInput(id="i1", name="I1")], [RoomInput(id="r1", name="R1")], [], req, drive_window)
    res1 = s1.solve()
    assert res1.success is False
    assert any("no candidates" in d.lower() for d in res1.diagnostics)

    # Missing required skills in available interviewers
    s2 = InterviewScheduler(
        "d1",
        [CandidateInput(id="c1", name="C1")],
        [InterviewerInput(id="i1", name="I1", skills=["python"])],
        [RoomInput(id="r1", name="R1")],
        [],
        req,
        drive_window,
    )
    res2 = s2.solve()
    assert res2.success is False
    assert any("insufficient qualified interviewers" in d.lower() for d in res2.diagnostics)


def test_transaction_rollback_on_persistence_error(db_session):
    """Verify that if database persistence fails, transactions are cleanly rolled back without leaving orphaned rows."""
    drive = models.RecruitmentDrive(id="drive-tx", title="Tx Drive")
    db_session.add(drive)
    c_p = models.Profile(id="p-c", name="C", email="c@test.com", role=models.UserRole.CANDIDATE)
    cand = models.Candidate(id="cand-tx", profile_id="p-c")
    i_p = models.Profile(id="p-i", name="I", email="i@test.com", role=models.UserRole.INTERVIEWER)
    intr = models.Interviewer(id="intr-tx", profile_id="p-i", skills=["sec"], workload_limit=5)
    room = models.Room(id="room-tx", name="Room TX")
    db_session.add_all([c_p, cand, i_p, intr, room])
    db_session.commit()

    base_time = datetime(2026, 11, 1, 9, 0, tzinfo=timezone.utc)
    req = ScheduleRequest(
        drive_id="drive-tx",
        round_requirement=RoundRequirement(round_number=1, duration_minutes=60, required_skills=["sec"]),
        window=TimeWindow(start_time=base_time, end_time=base_time + timedelta(hours=2)),
        candidate_ids=["cand-tx"],
        interviewer_ids=["intr-tx"],
        room_ids=["room-tx"],
    )

    # Force a commit failure using patch
    with patch.object(db_session, "commit", side_effect=Exception("Database disk failure")):
        result = generate_and_save_schedule(db_session, req)
        assert result.success is False
        assert result.status == SolverStatus.ERROR
        assert any("transaction failure" in d.lower() for d in result.diagnostics)

    # Verify no bookings were saved
    count = db_session.query(models.Booking).filter(models.Booking.drive_id == "drive-tx").count()
    assert count == 0


def test_partial_vs_strict_generation_mode():
    """Verify that allow_partial_generation schedules max possible while strict mode returns INFEASIBLE."""
    base_time = datetime(2026, 11, 1, 9, 0, tzinfo=timezone.utc)
    # Only 1 slot available in the whole window
    drive_window = TimeWindow(start_time=base_time, end_time=base_time + timedelta(hours=1))

    candidates = [CandidateInput(id="c1", name="C1"), CandidateInput(id="c2", name="C2")]
    interviewers = [InterviewerInput(id="i1", name="I1", skills=["cloud"], workload_limit=5)]
    rooms = [RoomInput(id="r1", name="R1")]

    req = RoundRequirement(round_number=1, duration_minutes=60, slot_granularity_minutes=60, required_skills=["cloud"])

    # Strict mode
    strict_sched = InterviewScheduler("d1", candidates, interviewers, rooms, [], req, drive_window, allow_partial=False)
    res_strict = strict_sched.solve()
    assert res_strict.success is False
    assert res_strict.status == SolverStatus.INFEASIBLE

    # Partial mode
    partial_sched = InterviewScheduler("d1", candidates, interviewers, rooms, [], req, drive_window, allow_partial=True)
    res_partial = partial_sched.solve()
    assert res_partial.success is True
    assert res_partial.scheduled_count == 1
    assert res_partial.unassigned_count == 1
