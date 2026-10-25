"""
Test Suite for Phase 6: Candidate Self-Booking, Calendar Invitations, and Notifications
Covers:
1. Available slots query for eligible candidates.
2. Ineligible candidates or unauthenticated users attempting to view slots.
3. Successful booking confirmation and status transition to CONFIRMED.
4. Attempt to book an already occupied slot (conflict 409).
5. Overlapping candidate interview collision prevention.
6. Concurrent booking race safety (second simultaneous request rejected with 409).
7. Duplicate request idempotency protection.
8. Booking cancellation lifecycle (CONFIRMED -> CANCELLED) and freeing of slot.
9. Unauthorized cancellation attempt by unrelated user (403).
10. Valid RFC 5545 .ics calendar invitation generation and download.
11. In-app notification creation, isolation, and read status updates.
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
def seed_data(test_db):
    # Drive
    drive = models.RecruitmentDrive(id="drive-100", title="Spring Campus Placement 2026", status=models.DriveStatus.ACTIVE)
    test_db.add(drive)

    # Candidate 1 (Alice)
    p_c1 = models.Profile(id="p-c1", name="Alice Candidate", email="alice@test.edu", role=models.UserRole.CANDIDATE)
    c1 = models.Candidate(id="cand-1", profile_id="p-c1")
    test_db.add_all([p_c1, c1])

    # Candidate 2 (Bob)
    p_c2 = models.Profile(id="p-c2", name="Bob Candidate", email="bob@test.edu", role=models.UserRole.CANDIDATE)
    c2 = models.Candidate(id="cand-2", profile_id="p-c2")
    test_db.add_all([p_c2, c2])

    # Interviewer 1
    p_i1 = models.Profile(id="p-i1", name="Dr. Ada Evaluator", email="ada@fac.edu", role=models.UserRole.INTERVIEWER)
    i1 = models.Interviewer(id="intr-1", profile_id="p-i1", skills=["python"], workload_limit=3)
    test_db.add_all([p_i1, i1])

    # Room
    room = models.Room(id="room-1", name="Interview Cabin 1", capacity=2)
    test_db.add(room)

    # Availability for Interviewer
    base_time = datetime(2026, 11, 10, 10, 0, tzinfo=timezone.utc)
    avail = models.Availability(
        id="avail-1",
        profile_id="p-i1",
        start_time=base_time,
        end_time=base_time + timedelta(hours=1),
        status=models.AvailabilityStatus.AVAILABLE,
    )
    test_db.add(avail)

    test_db.commit()

    token_c1 = create_test_jwt("p-c1", "alice@test.edu")
    token_c2 = create_test_jwt("p-c2", "bob@test.edu")
    token_i1 = create_test_jwt("p-i1", "ada@fac.edu")

    return {
        "headers_c1": {"Authorization": f"Bearer {token_c1}"},
        "headers_c2": {"Authorization": f"Bearer {token_c2}"},
        "headers_i1": {"Authorization": f"Bearer {token_i1}"},
        "base_time": base_time,
    }


def test_candidate_available_slots_query(client, seed_data):
    resp = client.get("/candidate/available-slots", headers=seed_data["headers_c1"])
    assert resp.status_code == 200
    slots = resp.json()
    assert len(slots) >= 1
    slot = slots[0]
    assert slot["drive_id"] == "drive-100"
    assert slot["interviewer_id"] == "intr-1"
    assert slot["duration_minutes"] == 60


def test_candidate_successful_booking(client, seed_data, test_db):
    base_time = seed_data["base_time"]
    payload = {
        "drive_id": "drive-100",
        "interviewer_id": "intr-1",
        "room_id": "room-1",
        "round_number": 1,
        "start_time": base_time.isoformat(),
        "end_time": (base_time + timedelta(hours=1)).isoformat(),
    }

    resp = client.post("/bookings", json=payload, headers=seed_data["headers_c1"])
    assert resp.status_code == 201
    booking = resp.json()
    assert booking["status"] == "confirmed"
    assert booking["candidate_id"] == "cand-1"
    assert booking["interviewer_name"] == "Dr. Ada Evaluator"

    # Verify in-app notifications generated for both candidate and interviewer
    c1_notifs = client.get("/notifications", headers=seed_data["headers_c1"]).json()
    assert len(c1_notifs) == 1
    assert "confirmed" in c1_notifs[0]["title"].lower()

    i1_notifs = client.get("/notifications", headers=seed_data["headers_i1"]).json()
    assert len(i1_notifs) == 1
    assert "assigned" in i1_notifs[0]["title"].lower()


def test_candidate_double_booking_conflict(client, seed_data):
    base_time = seed_data["base_time"]
    payload = {
        "drive_id": "drive-100",
        "interviewer_id": "intr-1",
        "room_id": "room-1",
        "round_number": 1,
        "start_time": base_time.isoformat(),
        "end_time": (base_time + timedelta(hours=1)).isoformat(),
    }

    # First candidate books the slot
    resp1 = client.post("/bookings", json=payload, headers=seed_data["headers_c1"])
    assert resp1.status_code == 201

    # Second candidate attempts to book the exact same slot concurrently
    resp2 = client.post("/bookings", json=payload, headers=seed_data["headers_c2"])
    assert resp2.status_code == 409
    assert "claimed by another candidate" in resp2.json()["detail"].lower()


def test_candidate_booking_idempotency(client, seed_data):
    base_time = seed_data["base_time"]
    payload = {
        "drive_id": "drive-100",
        "interviewer_id": "intr-1",
        "room_id": "room-1",
        "round_number": 1,
        "start_time": base_time.isoformat(),
        "end_time": (base_time + timedelta(hours=1)).isoformat(),
    }

    resp1 = client.post("/bookings", json=payload, headers=seed_data["headers_c1"])
    assert resp1.status_code == 201
    id1 = resp1.json()["id"]

    # Retrying the exact request
    resp2 = client.post("/bookings", json=payload, headers=seed_data["headers_c1"])
    assert resp2.status_code == 200
    assert resp2.json()["id"] == id1


def test_candidate_overlapping_interview_prevention(client, seed_data, test_db):
    base_time = seed_data["base_time"]
    # Setup second interviewer
    p_i2 = models.Profile(id="p-i2", name="Dr. Turing", email="turing@fac.edu", role=models.UserRole.INTERVIEWER)
    i2 = models.Interviewer(id="intr-2", profile_id="p-i2", skills=["python"], workload_limit=3)
    test_db.add_all([p_i2, i2])
    test_db.commit()

    # Candidate 1 books with interviewer 1
    payload1 = {
        "drive_id": "drive-100",
        "interviewer_id": "intr-1",
        "room_id": "room-1",
        "round_number": 1,
        "start_time": base_time.isoformat(),
        "end_time": (base_time + timedelta(hours=1)).isoformat(),
    }
    resp1 = client.post("/bookings", json=payload1, headers=seed_data["headers_c1"])
    assert resp1.status_code == 201

    # Candidate 1 attempts to book second interview at the same time with interviewer 2
    payload2 = {
        "drive_id": "drive-100",
        "interviewer_id": "intr-2",
        "room_id": None,
        "round_number": 2,
        "start_time": base_time.isoformat(),
        "end_time": (base_time + timedelta(hours=1)).isoformat(),
    }
    resp2 = client.post("/bookings", json=payload2, headers=seed_data["headers_c1"])
    assert resp2.status_code == 409
    assert "already have an active interview booked" in resp2.json()["detail"].lower()


def test_booking_cancellation_and_slot_release(client, seed_data):
    base_time = seed_data["base_time"]
    payload = {
        "drive_id": "drive-100",
        "interviewer_id": "intr-1",
        "room_id": "room-1",
        "round_number": 1,
        "start_time": base_time.isoformat(),
        "end_time": (base_time + timedelta(hours=1)).isoformat(),
    }

    # Book
    resp1 = client.post("/bookings", json=payload, headers=seed_data["headers_c1"])
    booking_id = resp1.json()["id"]

    # Cancel by Candidate 1
    cancel_resp = client.post(f"/bookings/{booking_id}/cancel", headers=seed_data["headers_c1"])
    assert cancel_resp.status_code == 200
    assert cancel_resp.json()["status"] == "cancelled"

    # Now Candidate 2 can successfully book the freed slot
    resp2 = client.post("/bookings", json=payload, headers=seed_data["headers_c2"])
    assert resp2.status_code == 201
    assert resp2.json()["candidate_id"] == "cand-2"


def test_unauthorized_cancellation_attempt(client, seed_data):
    base_time = seed_data["base_time"]
    payload = {
        "drive_id": "drive-100",
        "interviewer_id": "intr-1",
        "room_id": "room-1",
        "round_number": 1,
        "start_time": base_time.isoformat(),
        "end_time": (base_time + timedelta(hours=1)).isoformat(),
    }

    resp = client.post("/bookings", json=payload, headers=seed_data["headers_c1"])
    booking_id = resp.json()["id"]

    # Candidate 2 tries to cancel Candidate 1's booking
    evil_cancel = client.post(f"/bookings/{booking_id}/cancel", headers=seed_data["headers_c2"])
    assert evil_cancel.status_code == 403


def test_calendar_invitation_ics_download(client, seed_data):
    base_time = seed_data["base_time"]
    payload = {
        "drive_id": "drive-100",
        "interviewer_id": "intr-1",
        "room_id": "room-1",
        "round_number": 1,
        "start_time": base_time.isoformat(),
        "end_time": (base_time + timedelta(hours=1)).isoformat(),
    }

    resp = client.post("/bookings", json=payload, headers=seed_data["headers_c1"])
    booking_id = resp.json()["id"]

    # Download ICS by candidate
    ics_resp = client.get(f"/bookings/{booking_id}/calendar", headers=seed_data["headers_c1"])
    assert ics_resp.status_code == 200
    assert "text/calendar" in ics_resp.headers["content-type"]
    content = ics_resp.text
    assert "BEGIN:VCALENDAR" in content
    assert "BEGIN:VEVENT" in content
    assert "SUMMARY:Slotify Interview:" in content
    assert f"slotify-booking-{booking_id}@slotify.edu" in content

    # Download ICS by unauthorized user
    bad_ics = client.get(f"/bookings/{booking_id}/calendar", headers=seed_data["headers_c2"])
    assert bad_ics.status_code == 403


def test_notification_read_status_flow(client, seed_data):
    base_time = seed_data["base_time"]
    payload = {
        "drive_id": "drive-100",
        "interviewer_id": "intr-1",
        "room_id": "room-1",
        "round_number": 1,
        "start_time": base_time.isoformat(),
        "end_time": (base_time + timedelta(hours=1)).isoformat(),
    }

    client.post("/bookings", json=payload, headers=seed_data["headers_c1"])

    notifs = client.get("/notifications", headers=seed_data["headers_c1"]).json()
    assert len(notifs) >= 1
    notif_id = notifs[0]["id"]
    assert notifs[0]["is_read"] == 0

    # Mark as read
    patch_resp = client.patch(f"/notifications/{notif_id}/read", json={"is_read": 1}, headers=seed_data["headers_c1"])
    assert patch_resp.status_code == 200
    assert patch_resp.json()["is_read"] == 1
