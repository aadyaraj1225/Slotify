import time
import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from jose import jwt

from main import app
from database import Base, get_db
import models
from config import settings

TEST_DB_URL = "sqlite://"
engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

TEST_JWT_SECRET = "crud-testing-jwt-secret-minimum-32-chars-long!"


@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    orig_secret = settings.SUPABASE_JWT_SECRET
    settings.SUPABASE_JWT_SECRET = TEST_JWT_SECRET
    yield
    Base.metadata.drop_all(bind=engine)
    settings.SUPABASE_JWT_SECRET = orig_secret


@pytest.fixture
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db):
    def override_get_db():
        session = TestingSessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    test_client = TestClient(app)
    yield test_client
    app.dependency_overrides.clear()


def make_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": int(time.time()) + 3600,
        "iat": int(time.time()),
    }
    return jwt.encode(payload, TEST_JWT_SECRET, algorithm="HS256")


@pytest.fixture
def test_users(db):
    """
    Creates and returns standard users: coordinator, candidate, interviewer, candidate_2.
    """
    users_data = [
        ("u-coord-1", "coord1@campus.edu", models.UserRole.COORDINATOR, "Lead Ananya"),
        ("u-cand-1", "cand1@campus.edu", models.UserRole.CANDIDATE, "Student Aarav"),
        ("u-cand-2", "cand2@campus.edu", models.UserRole.CANDIDATE, "Student Priya"),
        ("u-int-1", "int1@campus.edu", models.UserRole.INTERVIEWER, "Faculty Vikram"),
        ("u-int-2", "int2@campus.edu", models.UserRole.INTERVIEWER, "Faculty Rohan"),
    ]
    tokens = {}
    for uid, email, role, name in users_data:
        prof = db.query(models.Profile).filter(models.Profile.id == uid).first()
        if not prof:
            prof = models.Profile(id=uid, name=name, email=email, role=role)
            db.add(prof)
            db.commit()
            if role == models.UserRole.CANDIDATE:
                c = models.Candidate(profile_id=uid, student_id=f"STU-{uid[-1]}", department="CSE")
                db.add(c)
            elif role == models.UserRole.INTERVIEWER:
                i = models.Interviewer(profile_id=uid, department="CS", workload_limit=4, skills=["Algorithms"])
                db.add(i)
            db.commit()
        tokens[uid] = make_token(uid, email)
    return tokens


# -------------------------------------------------------------
# 1. Recruitment Drives CRUD & Security Tests
# -------------------------------------------------------------
def test_drives_crud_and_permissions(client, test_users):
    coord_token = test_users["u-coord-1"]
    cand_token = test_users["u-cand-1"]

    coord_headers = {"Authorization": f"Bearer {coord_token}"}
    cand_headers = {"Authorization": f"Bearer {cand_token}"}

    # 1. Candidate tries to create drive -> 403 Forbidden
    cand_create_res = client.post(
        "/drives",
        json={"title": "Unauthorized Drive", "status": "draft"},
        headers=cand_headers,
    )
    assert cand_create_res.status_code == 403

    # 2. Coordinator creates drive -> 201 Created
    create_res = client.post(
        "/drives",
        json={"title": "Campus Recruitment Drive 2026", "description": "Fall Drive", "status": "active"},
        headers=coord_headers,
    )
    assert create_res.status_code == 201
    drive_data = create_res.json()
    drive_id = drive_data["id"]
    assert drive_data["title"] == "Campus Recruitment Drive 2026"

    # 3. List drives (accessible to candidate)
    list_res = client.get("/drives", headers=cand_headers)
    assert list_res.status_code == 200
    assert any(d["id"] == drive_id for d in list_res.json())

    # 4. View drive details
    get_res = client.get(f"/drives/{drive_id}", headers=cand_headers)
    assert get_res.status_code == 200
    assert get_res.json()["title"] == "Campus Recruitment Drive 2026"

    # 5. Candidate tries to update drive -> 403 Forbidden
    cand_update_res = client.patch(
        f"/drives/{drive_id}",
        json={"title": "Hacked Title"},
        headers=cand_headers,
    )
    assert cand_update_res.status_code == 403

    # 6. Coordinator updates drive -> 200 OK
    update_res = client.patch(
        f"/drives/{drive_id}",
        json={"description": "Updated Fall Drive", "status": "completed"},
        headers=coord_headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "completed"

    # 7. Delete drive
    del_res = client.delete(f"/drives/{drive_id}", headers=coord_headers)
    assert del_res.status_code == 204
    assert client.get(f"/drives/{drive_id}", headers=coord_headers).status_code == 404


# -------------------------------------------------------------
# 2. Candidates CRUD, Isolation & Cross-User Security Tests
# -------------------------------------------------------------
def test_candidates_crud_and_cross_user_isolation(client, test_users, db):
    coord_token = test_users["u-coord-1"]
    cand1_token = test_users["u-cand-1"]
    cand2_token = test_users["u-cand-2"]

    cand1 = db.query(models.Candidate).filter(models.Candidate.profile_id == "u-cand-1").first()
    cand2 = db.query(models.Candidate).filter(models.Candidate.profile_id == "u-cand-2").first()

    # 1. Candidate 1 accesses own candidate record via /candidates/me -> 200
    me_res = client.get("/candidates/me", headers={"Authorization": f"Bearer {cand1_token}"})
    assert me_res.status_code == 200
    assert me_res.json()["profile_id"] == "u-cand-1"

    # 2. Candidate 1 tries to access Candidate 2's private record -> 403 Forbidden
    cross_res = client.get(f"/candidates/{cand2.id}", headers={"Authorization": f"Bearer {cand1_token}"})
    assert cross_res.status_code == 403
    assert "permission" in cross_res.json().get("detail", "").lower()

    # 3. Candidate 1 tries to modify Candidate 2's record -> 403 Forbidden
    cross_patch = client.patch(
        f"/candidates/{cand2.id}",
        json={"department": "Security Breach"},
        headers={"Authorization": f"Bearer {cand1_token}"},
    )
    assert cross_patch.status_code == 403

    # 4. Candidate 1 updates own permitted fields -> 200
    self_patch = client.patch(
        f"/candidates/{cand1.id}",
        json={"department": "Software Engineering", "graduation_year": 2026},
        headers={"Authorization": f"Bearer {cand1_token}"},
    )
    assert self_patch.status_code == 200
    assert self_patch.json()["department"] == "Software Engineering"

    # 5. Coordinator can list and view all candidates -> 200
    coord_list = client.get("/candidates", headers={"Authorization": f"Bearer {coord_token}"})
    assert coord_list.status_code == 200
    assert len(coord_list.json()) >= 2

    # 6. Candidate tries to list all candidates -> 403 Forbidden
    assert client.get("/candidates", headers={"Authorization": f"Bearer {cand1_token}"}).status_code == 403


# -------------------------------------------------------------
# 3. Interviewers CRUD & Workload Restriction Tests
# -------------------------------------------------------------
def test_interviewers_crud_and_permissions(client, test_users, db):
    coord_token = test_users["u-coord-1"]
    int1_token = test_users["u-int-1"]
    int2_token = test_users["u-int-2"]

    int1 = db.query(models.Interviewer).filter(models.Interviewer.profile_id == "u-int-1").first()
    int2 = db.query(models.Interviewer).filter(models.Interviewer.profile_id == "u-int-2").first()

    # 1. Interviewer gets own profile via /interviewers/me -> 200
    me_res = client.get("/interviewers/me", headers={"Authorization": f"Bearer {int1_token}"})
    assert me_res.status_code == 200
    assert me_res.json()["profile_id"] == "u-int-1"

    # 2. Interviewer 1 tries to view Interviewer 2 -> 403
    assert client.get(f"/interviewers/{int2.id}", headers={"Authorization": f"Bearer {int1_token}"}).status_code == 403

    # 3. Interviewer updates own skills -> 200
    patch_skills = client.patch(
        f"/interviewers/{int1.id}",
        json={"skills": ["Python", "Cloud Architecture", "Distributed Systems"]},
        headers={"Authorization": f"Bearer {int1_token}"},
    )
    assert patch_skills.status_code == 200
    assert len(patch_skills.json()["skills"]) == 3

    # 4. Interviewer tries to change own workload limit -> 403 Forbidden
    workload_tamper = client.patch(
        f"/interviewers/{int1.id}",
        json={"workload_limit": 10},
        headers={"Authorization": f"Bearer {int1_token}"},
    )
    assert workload_tamper.status_code == 403
    assert "workload limit" in workload_tamper.json().get("detail", "").lower()

    # 5. Coordinator updates interviewer's workload limit -> 200 OK
    coord_patch = client.patch(
        f"/interviewers/{int1.id}",
        json={"workload_limit": 8},
        headers={"Authorization": f"Bearer {coord_token}"},
    )
    assert coord_patch.status_code == 200
    assert coord_patch.json()["workload_limit"] == 8


# -------------------------------------------------------------
# 4. Rooms CRUD & Validation Tests
# -------------------------------------------------------------
def test_rooms_crud_and_validation(client, test_users):
    coord_token = test_users["u-coord-1"]
    cand_token = test_users["u-cand-1"]

    # 1. Create Room by Coordinator -> 201
    room_payload = {"name": "Lab-204", "location": "Academic Block B", "capacity": 3}
    create_res = client.post(
        "/rooms",
        json=room_payload,
        headers={"Authorization": f"Bearer {coord_token}"},
    )
    assert create_res.status_code == 201
    room_id = create_res.json()["id"]

    # 2. Duplicate room name rejected -> 409 Conflict
    dup_res = client.post(
        "/rooms",
        json=room_payload,
        headers={"Authorization": f"Bearer {coord_token}"},
    )
    assert dup_res.status_code == 409

    # 3. List rooms (accessible to candidates)
    list_res = client.get("/rooms", headers={"Authorization": f"Bearer {cand_token}"})
    assert list_res.status_code == 200
    assert any(r["name"] == "Lab-204" for r in list_res.json())

    # 4. Update room details
    update_res = client.patch(
        f"/rooms/{room_id}",
        json={"capacity": 5, "location": "Academic Block B, 2nd Floor"},
        headers={"Authorization": f"Bearer {coord_token}"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["capacity"] == 5

    # 5. Delete room
    del_res = client.delete(f"/rooms/{room_id}", headers={"Authorization": f"Bearer {coord_token}"})
    assert del_res.status_code == 204


# -------------------------------------------------------------
# 5. Availability CRUD, Time Validation & Cross-User Security Tests
# -------------------------------------------------------------
def test_availability_crud_validation_and_permissions(client, test_users):
    coord_token = test_users["u-coord-1"]
    int1_token = test_users["u-int-1"]
    int2_token = test_users["u-int-2"]

    now = datetime.now(timezone.utc)
    t1 = (now + timedelta(days=1, hours=2)).isoformat()
    t2 = (now + timedelta(days=1, hours=4)).isoformat()
    invalid_t2 = (now + timedelta(days=1, hours=1)).isoformat()

    # 1. Invalid time range (end <= start) -> 422 Unprocessable Entity
    invalid_res = client.post(
        "/availability",
        json={"start_time": t1, "end_time": invalid_t2, "status": "available"},
        headers={"Authorization": f"Bearer {int1_token}"},
    )
    assert invalid_res.status_code == 422

    # 2. Valid creation for self -> 201 Created
    create_res = client.post(
        "/availability",
        json={"start_time": t1, "end_time": t2, "status": "available"},
        headers={"Authorization": f"Bearer {int1_token}"},
    )
    assert create_res.status_code == 201
    avail_id = create_res.json()["id"]
    assert create_res.json()["profile_id"] == "u-int-1"

    # 3. User tries to create availability for another user -> 403 Forbidden
    cross_create = client.post(
        "/availability",
        json={"profile_id": "u-int-2", "start_time": t1, "end_time": t2},
        headers={"Authorization": f"Bearer {int1_token}"},
    )
    assert cross_create.status_code == 403

    # 4. User 2 cannot access User 1's availability -> 403 Forbidden
    assert client.get(f"/availability/{avail_id}", headers={"Authorization": f"Bearer {int2_token}"}).status_code == 403

    # 5. User 1 updates own window -> 200 OK
    t3 = (now + timedelta(days=1, hours=5)).isoformat()
    update_res = client.patch(
        f"/availability/{avail_id}",
        json={"end_time": t3, "status": "busy"},
        headers={"Authorization": f"Bearer {int1_token}"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "busy"

    # 6. User 1 deletes own availability -> 204
    del_res = client.delete(f"/availability/{avail_id}", headers={"Authorization": f"Bearer {int1_token}"})
    assert del_res.status_code == 204
