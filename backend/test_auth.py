import time
import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from jose import jwt

from main import app
from database import Base, get_db
import models
from config import settings

# Setup isolated SQLite in-memory database with StaticPool so all connections share the same memory instance
AUTH_TEST_DB_URL = "sqlite://"
auth_engine = create_engine(
    AUTH_TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
AuthTestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=auth_engine)

TEST_JWT_SECRET = "super-secret-test-key-32-characters-minimum!!"


@pytest.fixture(scope="module", autouse=True)
def setup_auth_db():
    Base.metadata.create_all(bind=auth_engine)
    orig_jwt = settings.SUPABASE_JWT_SECRET
    orig_secret = settings.ADMIN_PROVISION_SECRET
    settings.SUPABASE_JWT_SECRET = TEST_JWT_SECRET
    settings.ADMIN_PROVISION_SECRET = "test-bootstrap-admin-secret"
    yield
    Base.metadata.drop_all(bind=auth_engine)
    settings.SUPABASE_JWT_SECRET = orig_jwt
    settings.ADMIN_PROVISION_SECRET = orig_secret


@pytest.fixture
def db():
    session = AuthTestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db):
    def override_get_db():
        session = AuthTestingSessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    test_client = TestClient(app)
    yield test_client
    app.dependency_overrides.clear()


def create_test_jwt(sub: str, email: str, expires_in: int = 3600) -> str:
    payload = {
        "sub": sub,
        "email": email,
        "exp": int(time.time()) + expires_in,
        "iat": int(time.time()),
    }
    return jwt.encode(payload, TEST_JWT_SECRET, algorithm="HS256")


# --------------------------------------------------------------------------
# Tests: Missing, Invalid, Expired Tokens
# --------------------------------------------------------------------------

def test_missing_token_returns_401(client):
    res = client.get("/auth/me")
    assert res.status_code == 401
    assert "not provided" in res.json().get("detail", "").lower()


def test_malformed_token_returns_401(client):
    res = client.get("/auth/me", headers={"Authorization": "Bearer invalid.malformed.token"})
    assert res.status_code == 401
    assert "invalid or malformed" in res.json().get("detail", "").lower()


def test_expired_token_returns_401(client):
    expired_token = create_test_jwt("user-expired", "expired@campus.edu", expires_in=-3600)
    res = client.get("/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert res.status_code == 401
    assert "expired" in res.json().get("detail", "").lower()


# --------------------------------------------------------------------------
# Tests: Registration Security & Role Restrictions
# --------------------------------------------------------------------------

def test_public_user_cannot_register_as_coordinator(client):
    """
    Public registration must reject coordinator role requests.
    """
    payload = {
        "user_id": "malicious-user-id",
        "name": "Intruder",
        "email": "intruder@campus.edu",
        "requested_role": "coordinator",
    }
    res = client.post("/auth/sync-profile", json=payload)
    assert res.status_code == 403
    assert "not permitted" in res.json().get("detail", "").lower()


def test_public_registration_defaults_to_candidate(client, db):
    """
    Public users get candidate profile and child candidate record created.
    """
    payload = {
        "user_id": "candidate-user-1",
        "name": "Priya Sharma",
        "email": "priya.sharma@campus.edu",
        "requested_role": "candidate",
    }
    res = client.post("/auth/sync-profile", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "candidate"
    assert data["name"] == "Priya Sharma"

    # Verify candidate entity created
    cand_record = db.query(models.Candidate).filter(models.Candidate.profile_id == "candidate-user-1").first()
    assert cand_record is not None


def test_user_cannot_change_their_own_role(client, db):
    """
    Resubmitting registration with changed role does not elevate permissions.
    """
    # Attempt to re-register candidate-user-1 as interviewer
    payload = {
        "user_id": "candidate-user-1",
        "name": "Priya Sharma",
        "email": "priya.sharma@campus.edu",
        "requested_role": "interviewer",
    }
    res = client.post("/auth/sync-profile", json=payload)
    assert res.status_code == 200
    # Role remains candidate
    assert res.json()["role"] == "candidate"


def test_secure_coordinator_provisioning(client, db):
    """
    Coordinator privileges can only be granted via administrative provision secret.
    """
    # 1. Attempt with invalid secret -> 403
    fail_res = client.post(
        "/auth/admin/provision-coordinator",
        json={"user_id": "candidate-user-1", "admin_secret": "wrong-secret"},
    )
    assert fail_res.status_code == 403

    # 2. Grant with correct secret -> 200
    success_res = client.post(
        "/auth/admin/provision-coordinator",
        json={"user_id": "candidate-user-1", "admin_secret": "test-bootstrap-admin-secret"},
    )
    assert success_res.status_code == 200
    assert success_res.json()["role"] == "coordinator"

    # Verify profile in DB is now coordinator
    prof = db.query(models.Profile).filter(models.Profile.id == "candidate-user-1").first()
    assert prof.role == models.UserRole.COORDINATOR


# --------------------------------------------------------------------------
# Tests: Role-Based Endpoint Access Control
# --------------------------------------------------------------------------

def test_role_based_access_controls(client, db):
    # Setup 3 users: candidate, interviewer, coordinator
    users = [
        ("u-cand", "cand@campus.edu", models.UserRole.CANDIDATE, "Student Aarav"),
        ("u-int", "int@campus.edu", models.UserRole.INTERVIEWER, "Faculty Vikram"),
        ("u-coord", "coord@campus.edu", models.UserRole.COORDINATOR, "Lead Ananya"),
    ]
    for uid, email, role, name in users:
        existing = db.query(models.Profile).filter(models.Profile.id == uid).first()
        if not existing:
            prof = models.Profile(id=uid, name=name, email=email, role=role)
            db.add(prof)
    db.commit()

    cand_token = create_test_jwt("u-cand", "cand@campus.edu")
    int_token = create_test_jwt("u-int", "int@campus.edu")
    coord_token = create_test_jwt("u-coord", "coord@campus.edu")

    # 1. GET /auth/me for all 3 users
    for token, expected_role in [
        (cand_token, "candidate"),
        (int_token, "interviewer"),
        (coord_token, "coordinator"),
    ]:
        res = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200
        assert res.json()["role"] == expected_role

    # 2. Candidate endpoint (/auth/candidate)
    # Candidate -> 200
    assert client.get("/auth/candidate", headers={"Authorization": f"Bearer {cand_token}"}).status_code == 200
    # Interviewer -> 403 Forbidden
    assert client.get("/auth/candidate", headers={"Authorization": f"Bearer {int_token}"}).status_code == 403
    # Coordinator -> 403 Forbidden
    assert client.get("/auth/candidate", headers={"Authorization": f"Bearer {coord_token}"}).status_code == 403

    # 3. Interviewer endpoint (/auth/interviewer)
    # Interviewer -> 200
    assert client.get("/auth/interviewer", headers={"Authorization": f"Bearer {int_token}"}).status_code == 200
    # Candidate -> 403 Forbidden
    assert client.get("/auth/interviewer", headers={"Authorization": f"Bearer {cand_token}"}).status_code == 403
    # Coordinator -> 403 Forbidden
    assert client.get("/auth/interviewer", headers={"Authorization": f"Bearer {coord_token}"}).status_code == 403

    # 4. Coordinator endpoint (/auth/coordinator)
    # Coordinator -> 200
    assert client.get("/auth/coordinator", headers={"Authorization": f"Bearer {coord_token}"}).status_code == 200
    # Candidate -> 403 Forbidden
    assert client.get("/auth/coordinator", headers={"Authorization": f"Bearer {cand_token}"}).status_code == 403
    # Interviewer -> 403 Forbidden
    assert client.get("/auth/coordinator", headers={"Authorization": f"Bearer {int_token}"}).status_code == 403
