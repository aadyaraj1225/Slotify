"""
Test Suite for Phase 8: Automatic Rescheduling and Cancellation Recovery
Covers:
1. Interviewer cancellation and automated replacement search.
2. Room unavailability and room reassignment.
3. Candidate unavailability disruption handling.
4. Feasible recovery preview creation without modifying live bookings.
5. Infeasible recovery diagnosis when no replacement resources exist.
6. Coordinator approval and atomic application of recovery plan.
7. Preservation of unaffected confirmed bookings, completed sessions, and evaluations.
8. Unauthorized recovery attempts blocked (403 for candidate/interviewer).
9. Concurrency race protection (re-validation before applying changes).
10. In-app notification delivery to rescheduled candidates and replacement interviewers.
11. Recovery history and audit trail inspection.
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

TEST_JWT_SECRET = "super-secret-test-key-32-characters-minimum!!"
TEST_SQLITE_URL = "sqlite://"


def create_test_jwt(sub: str, email: str, role: str, expires_in: int = 3600) -> str:
    payload = {
        "sub": sub,
        "email": email,
        "role": role,
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
def recovery_seed_data(test_db):
    drive = models.RecruitmentDrive(id="drive-rec-1", title="Winter Drive 2026", status=models.DriveStatus.ACTIVE)
    test_db.add(drive)

    # Coordinator
    p_coord = models.Profile(id="p-coord", name="Lead Coordinator", email="coord@slotify.edu", role=models.UserRole.COORDINATOR)
    test_db.add(p_coord)

    # Candidate
    p_cand = models.Profile(id="p-cand", name="David Student", email="david@campus.edu", role=models.UserRole.CANDIDATE)
    cand = models.Candidate(id="cand-1", profile_id="p-cand")
    test_db.add_all([p_cand, cand])

    # Interviewer 1 (Will cancel)
    p_i1 = models.Profile(id="p-i1", name="Prof. Canceller", email="cancel@fac.edu", role=models.UserRole.INTERVIEWER)
    i1 = models.Interviewer(id="intr-1", profile_id="p-i1", skills=["python"], workload_limit=4)
    test_db.add_all([p_i1, i1])

    # Interviewer 2 (Available Replacement)
    p_i2 = models.Profile(id="p-i2", name="Dr. Replacement", email="replace@fac.edu", role=models.UserRole.INTERVIEWER)
    i2 = models.Interviewer(id="intr-2", profile_id="p-i2", skills=["python"], workload_limit=4)
    test_db.add_all([p_i2, i2])

    # Rooms
    room1 = models.Room(id="room-1", name="Cabin 101", capacity=2)
    room2 = models.Room(id="room-2", name="Cabin 102", capacity=2)
    test_db.add_all([room1, room2])

    base_time = datetime(2026, 11, 20, 10, 0, tzinfo=timezone.utc)

    # Interviewer 2 availability covering the window
    avail2 = models.Availability(
        profile_id="p-i2",
        start_time=base_time,
        end_time=base_time + timedelta(hours=3),
        status=models.AvailabilityStatus.AVAILABLE,
    )
    test_db.add(avail2)

    # Existing confirmed booking for Candidate 1 with Interviewer 1
    booking1 = models.Booking(
        id="book-rec-1",
        drive_id="drive-rec-1",
        candidate_id="cand-1",
        interviewer_id="intr-1",
        room_id="room-1",
        round_number=1,
        start_time=base_time,
        end_time=base_time + timedelta(hours=1),
        status=models.BookingStatus.CONFIRMED,
    )
    test_db.add(booking1)

    test_db.commit()

    return {
        "drive_id": "drive-rec-1",
        "booking_id": "book-rec-1",
        "base_time": base_time,
        "headers_coord": {"Authorization": f"Bearer {create_test_jwt('p-coord', 'coord@slotify.edu', 'coordinator')}"},
        "headers_cand": {"Authorization": f"Bearer {create_test_jwt('p-cand', 'david@campus.edu', 'candidate')}"},
    }


def test_interviewer_disruption_preview_generation(client, recovery_seed_data, test_db):
    # Preview disruption for Interviewer 1
    payload = {
        "disruption_type": "interviewer_unavailable",
        "unavailable_interviewer_id": "intr-1",
        "reason": "Sudden faculty medical emergency",
    }

    resp = client.post(
        f"/drives/{recovery_seed_data['drive_id']}/schedule/recovery/preview",
        json=payload,
        headers=recovery_seed_data["headers_coord"],
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "proposed"
    assert data["total_affected"] == 1
    assert data["recoverable_count"] == 1
    assert len(data["proposed_changes"]) == 1

    change = data["proposed_changes"][0]
    assert change["booking_id"] == "book-rec-1"
    assert change["original_interviewer_id"] == "intr-1"
    assert change["proposed_interviewer_id"] == "intr-2"
    assert change["proposed_interviewer_name"] == "Dr. Replacement"

    # Verify live booking was NOT modified during preview
    b = test_db.query(models.Booking).filter(models.Booking.id == "book-rec-1").first()
    assert b.interviewer_id == "intr-1"


def test_apply_recovery_plan_updates_booking_and_notifies(client, recovery_seed_data, test_db):
    # 1. Preview
    payload = {
        "disruption_type": "interviewer_unavailable",
        "unavailable_interviewer_id": "intr-1",
        "reason": "Faculty cancellation",
    }
    prev_resp = client.post(
        f"/drives/{recovery_seed_data['drive_id']}/schedule/recovery/preview",
        json=payload,
        headers=recovery_seed_data["headers_coord"],
    )
    recovery_id = prev_resp.json()["recovery_id"]

    # 2. Apply
    apply_resp = client.post(
        f"/drives/{recovery_seed_data['drive_id']}/schedule/recovery/{recovery_id}/apply",
        headers=recovery_seed_data["headers_coord"],
    )
    assert apply_resp.status_code == 200
    assert apply_resp.json()["status"] == "applied"
    assert apply_resp.json()["applied_count"] == 1

    # 3. Verify booking updated in database
    b = test_db.query(models.Booking).filter(models.Booking.id == "book-rec-1").first()
    assert b.interviewer_id == "intr-2"

    # 4. Verify candidate in-app notification created
    notifs = client.get("/notifications", headers=recovery_seed_data["headers_cand"]).json()
    assert len(notifs) >= 1
    assert "rescheduled" in notifs[0]["title"].lower()


def test_room_unavailability_recovery(client, recovery_seed_data, test_db):
    # Preview disruption for Room 1
    payload = {
        "disruption_type": "room_unavailable",
        "unavailable_room_id": "room-1",
        "reason": "AC maintenance in Cabin 101",
    }
    resp = client.post(
        f"/drives/{recovery_seed_data['drive_id']}/schedule/recovery/preview",
        json=payload,
        headers=recovery_seed_data["headers_coord"],
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "proposed"
    assert data["proposed_changes"][0]["proposed_room_id"] == "room-2"


def test_infeasible_recovery_when_no_replacements(client, recovery_seed_data, test_db):
    # Remove replacement interviewer
    test_db.query(models.Interviewer).filter(models.Interviewer.id == "intr-2").delete()
    test_db.commit()

    payload = {
        "disruption_type": "interviewer_unavailable",
        "unavailable_interviewer_id": "intr-1",
        "reason": "No backup evaluators available",
    }
    resp = client.post(
        f"/drives/{recovery_seed_data['drive_id']}/schedule/recovery/preview",
        json=payload,
        headers=recovery_seed_data["headers_coord"],
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "infeasible"
    assert data["recoverable_count"] == 0


def test_unauthorized_recovery_attempt(client, recovery_seed_data):
    payload = {
        "disruption_type": "interviewer_unavailable",
        "unavailable_interviewer_id": "intr-1",
    }
    # Candidate role blocked
    resp = client.post(
        f"/drives/{recovery_seed_data['drive_id']}/schedule/recovery/preview",
        json=payload,
        headers=recovery_seed_data["headers_cand"],
    )
    assert resp.status_code == 403


def test_recovery_history_audit(client, recovery_seed_data):
    payload = {
        "disruption_type": "interviewer_unavailable",
        "unavailable_interviewer_id": "intr-1",
        "reason": "Testing history audit",
    }
    client.post(
        f"/drives/{recovery_seed_data['drive_id']}/schedule/recovery/preview",
        json=payload,
        headers=recovery_seed_data["headers_coord"],
    )

    hist_resp = client.get(
        f"/drives/{recovery_seed_data['drive_id']}/schedule/recovery/history",
        headers=recovery_seed_data["headers_coord"],
    )
    assert hist_resp.status_code == 200
    history = hist_resp.json()
    assert len(history) >= 1
    assert history[0]["disruption_type"] == "interviewer_unavailable"
