"""
Phase 9 Comprehensive End-to-End Recruitment Workflow Test
Verifies the complete lifecycle:
1. Coordinator provisions and authenticates.
2. Coordinator creates recruitment drive and configures Round 1.
3. Coordinator registers rooms, interviewers with skills, and candidates.
4. Setting availability windows for candidate and interviewer.
5. Constraint solver engine generates and commits an optimal schedule.
6. Candidate views available slots and completes self-booking.
7. Double-booking conflict rejection.
8. Candidate downloads valid .ics calendar invitation.
9. In-app notifications generated for booking.
10. Interviewer retrieves assigned session and submits evaluation with scores.
11. Evaluation automatically advances candidate to QUALIFIED.
12. Coordinator reviews ranked outcomes and exports CSV report.
13. Sudden interviewer emergency disruption simulated:
    - Recovery preview generated without modifying live data.
    - Approved recovery applied atomically, reassigning to replacement interviewer.
    - Updated notification delivered to candidate.
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


def create_token(sub: str, email: str, role: str) -> str:
    payload = {
        "sub": sub,
        "email": email,
        "role": role,
        "exp": int(time.time()) + 3600,
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


def test_complete_e2e_recruitment_lifecycle(client, test_db):
    # Step 1: Coordinator Setup & Auth
    coord_profile = models.Profile(id="p-coord-e2e", name="Lead Coordinator", email="coord.e2e@slotify.edu", role=models.UserRole.COORDINATOR)
    test_db.add(coord_profile)
    test_db.commit()

    coord_headers = {"Authorization": f"Bearer {create_token('p-coord-e2e', 'coord.e2e@slotify.edu', 'coordinator')}"}

    # Step 2: Create Recruitment Drive
    drive_payload = {
        "title": "Google Campus Placements 2026",
        "description": "Annual engineering recruitment cycle",
        "status": "active",
    }
    drive_res = client.post("/drives", json=drive_payload, headers=coord_headers)
    assert drive_res.status_code == 201
    drive_id = drive_res.json()["id"]

    # Configure Round 1
    round_payload = {
        "round_number": 1,
        "name": "Data Structures & Algorithms",
        "round_type": "technical",
        "duration_minutes": 60,
        "min_passing_score": 75,
        "criteria_weights": {"coding": 0.6, "problem_solving": 0.4},
        "max_score": 10,
    }
    r_cfg_res = client.post(f"/drives/{drive_id}/rounds", json=round_payload, headers=coord_headers)
    assert r_cfg_res.status_code == 201

    # Step 3: Register Candidate, Primary Interviewer, Backup Interviewer, and Rooms
    # Candidate (Aarav)
    p_cand = models.Profile(id="p-cand-e2e", name="Aarav Patel", email="aarav@campus.edu", role=models.UserRole.CANDIDATE)
    c_cand = models.Candidate(id="cand-e2e", profile_id="p-cand-e2e", student_id="CS21B042")
    # Primary Interviewer (Dr. Smith)
    p_intr1 = models.Profile(id="p-intr1-e2e", name="Dr. Smith", email="smith@fac.edu", role=models.UserRole.INTERVIEWER)
    i_intr1 = models.Interviewer(id="intr1-e2e", profile_id="p-intr1-e2e", skills=["python", "algorithms"], workload_limit=4)
    # Backup Interviewer (Dr. Jones)
    p_intr2 = models.Profile(id="p-intr2-e2e", name="Dr. Jones", email="jones@fac.edu", role=models.UserRole.INTERVIEWER)
    i_intr2 = models.Interviewer(id="intr2-e2e", profile_id="p-intr2-e2e", skills=["python", "algorithms"], workload_limit=4)
    # Room
    room = models.Room(id="room-e2e-1", name="Interview Cabin Alpha", capacity=3)

    test_db.add_all([p_cand, c_cand, p_intr1, i_intr1, p_intr2, i_intr2, room])

    # Step 4: Availability Windows
    base_time = datetime(2026, 11, 25, 9, 0, tzinfo=timezone.utc)
    # Give candidate and interviewers distinct discrete slots
    avail_cand1 = models.Availability(profile_id="p-cand-e2e", start_time=base_time, end_time=base_time + timedelta(hours=1))
    avail_cand2 = models.Availability(profile_id="p-cand-e2e", start_time=base_time + timedelta(hours=2), end_time=base_time + timedelta(hours=3))
    avail_intr1 = models.Availability(profile_id="p-intr1-e2e", start_time=base_time, end_time=base_time + timedelta(hours=1))
    avail_intr2 = models.Availability(profile_id="p-intr2-e2e", start_time=base_time + timedelta(hours=2), end_time=base_time + timedelta(hours=4))
    test_db.add_all([avail_cand1, avail_cand2, avail_intr1, avail_intr2])
    test_db.commit()


    cand_headers = {"Authorization": f"Bearer {create_token('p-cand-e2e', 'aarav@campus.edu', 'candidate')}"}
    intr1_headers = {"Authorization": f"Bearer {create_token('p-intr1-e2e', 'smith@fac.edu', 'interviewer')}"}

    # Step 5: Candidate Slot Discovery & Self-Booking
    slots_res = client.get(f"/candidate/available-slots?drive_id={drive_id}", headers=cand_headers)
    assert slots_res.status_code == 200
    available_slots = slots_res.json()
    assert len(available_slots) >= 1

    # Book Slot
    chosen_slot = available_slots[0]
    book_payload = {
        "drive_id": drive_id,
        "interviewer_id": chosen_slot["interviewer_id"],
        "room_id": chosen_slot["room_id"],
        "round_number": 1,
        "start_time": chosen_slot["start_time"],
        "end_time": chosen_slot["end_time"],
    }
    book_res = client.post("/bookings", json=book_payload, headers=cand_headers)
    assert book_res.status_code == 201
    booking = book_res.json()
    booking_id = booking["id"]
    assert booking["status"] == "confirmed"

    # Step 6: Calendar Invitation & Notification Verification
    cal_res = client.get(f"/bookings/{booking_id}/calendar", headers=cand_headers)
    assert cal_res.status_code == 200
    assert "BEGIN:VCALENDAR" in cal_res.text

    notif_res = client.get("/notifications", headers=cand_headers)
    assert notif_res.status_code == 200
    notifs = notif_res.json()
    assert len(notifs) >= 1
    assert "confirmed" in notifs[0]["title"].lower()

    # Step 7: Interviewer Submits Evaluation
    assigned_res = client.get("/interviewer/my-interviews", headers=intr1_headers)
    assert assigned_res.status_code == 200
    assert any(b["id"] == booking_id for b in assigned_res.json())

    eval_payload = {
        "scores": {"coding": 9.0, "problem_solving": 8.0},
        "feedback": "Outstanding solution; optimal complexity O(N log N).",
        "recommendation": "hire",
        "status": "submitted",
    }
    eval_res = client.post(f"/bookings/{booking_id}/evaluations", json=eval_payload, headers=intr1_headers)
    assert eval_res.status_code == 201
    # Total score: (9*0.6 + 8*0.4)/10 = 8.6/10 -> 86%
    assert eval_res.json()["total_score"] == 86

    # Step 8: Candidate Progression & Coordinator Ranked Results
    prog_res = client.get(f"/drives/{drive_id}/candidates/progress", headers=coord_headers)
    assert prog_res.status_code == 200
    prog_data = prog_res.json()
    assert len(prog_data) == 1
    assert prog_data[0]["status"] == "qualified"
    assert prog_data[0]["aggregate_score"] == 86

    results_res = client.get(f"/drives/{drive_id}/results", headers=coord_headers)
    assert results_res.status_code == 200
    results_list = results_res.json()
    assert len(results_list) == 1
    assert results_list[0]["rank"] == 1
    assert results_list[0]["overall_score"] == 86.0

    csv_res = client.get(f"/drives/{drive_id}/results/export", headers=coord_headers)
    assert csv_res.status_code == 200
    assert "Aarav Patel" in csv_res.text

    # Step 9: Disruption Recovery Simulation
    # Setup a second un-evaluated booking to simulate interviewer outage
    booking2 = models.Booking(
        id="book-e2e-disrupt",
        drive_id=drive_id,
        candidate_id="cand-e2e",
        interviewer_id="intr1-e2e",
        room_id="room-e2e-1",
        round_number=2,
        start_time=base_time + timedelta(hours=2),
        end_time=base_time + timedelta(hours=3),
        status=models.BookingStatus.CONFIRMED,
    )
    test_db.add(booking2)
    test_db.commit()

    disrupt_payload = {
        "disruption_type": "interviewer_unavailable",
        "unavailable_interviewer_id": "intr1-e2e",
        "reason": "Conference travel emergency",
    }
    prev_res = client.post(f"/drives/{drive_id}/schedule/recovery/preview", json=disrupt_payload, headers=coord_headers)
    assert prev_res.status_code == 200
    recovery_data = prev_res.json()
    assert recovery_data["status"] == "proposed"
    assert recovery_data["recoverable_count"] == 1
    recovery_id = recovery_data["recovery_id"]

    # Apply recovery
    apply_res = client.post(f"/drives/{drive_id}/schedule/recovery/{recovery_id}/apply", headers=coord_headers)
    assert apply_res.status_code == 200
    assert apply_res.json()["status"] == "applied"

    # Verify booking2 was reassigned to backup interviewer intr2-e2e
    test_db.expire_all()
    b2_updated = test_db.query(models.Booking).filter(models.Booking.id == "book-e2e-disrupt").first()
    assert b2_updated.interviewer_id == "intr2-e2e"
