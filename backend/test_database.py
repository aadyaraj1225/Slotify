import os
import pytest
from datetime import datetime, timezone, timedelta
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
from alembic.config import Config
from alembic import command

from database import Base, get_database_url, get_engine, get_session_factory, get_db_context
from config import settings, Settings
import models
from schemas import (
    ProfileCreate,
    ProfileRead,
    RecruitmentDriveCreate,
    CandidateCreate,
    InterviewerCreate,
    RoomCreate,
    AvailabilityCreate,
    BookingCreate,
    EvaluationCreate,
)


@pytest.fixture(scope="session")
def test_engine():
    """
    Isolated in-memory SQLite engine with foreign keys enabled for testing.
    Ensures no live databases or Supabase data are altered.
    """
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
    )
    # Enable SQLite foreign key enforcement
    from sqlalchemy import event
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session(test_engine):
    """
    Provides a transactional database session for each test that rolls back.
    """
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


def test_database_url_validation_and_configuration():
    # Test fallback error when DATABASE_URL is not set
    orig = settings.DATABASE_URL
    try:
        settings.DATABASE_URL = None
        with pytest.raises(ValueError, match="DATABASE_URL is not set"):
            get_database_url()

        # Test postgres:// normalization to postgresql://
        settings.DATABASE_URL = "postgres://user:pass@localhost:5432/db"
        normalized = get_database_url()
        assert normalized.startswith("postgresql://")
    finally:
        settings.DATABASE_URL = orig


def test_schema_entities_created(test_engine):
    inspector = inspect(test_engine)
    tables = inspector.get_table_names()
    expected_tables = {
        "profiles",
        "recruitment_drives",
        "candidates",
        "interviewers",
        "rooms",
        "availabilities",
        "bookings",
        "evaluations",
    }
    assert expected_tables.issubset(set(tables)), f"Missing tables: {expected_tables - set(tables)}"


def test_profile_creation_and_constraints(db_session):
    profile = models.Profile(
        name="Aarav Patel",
        email="aarav@example.com",
        role=models.UserRole.CANDIDATE,
    )
    db_session.add(profile)
    db_session.commit()
    db_session.refresh(profile)

    assert profile.id is not None
    assert profile.name == "Aarav Patel"
    assert profile.role == models.UserRole.CANDIDATE

    # Unique email constraint test
    duplicate_profile = models.Profile(
        name="Aarav Clone",
        email="aarav@example.com",
        role=models.UserRole.CANDIDATE,
    )
    db_session.add(duplicate_profile)
    with pytest.raises(Exception):
        db_session.commit()
    db_session.rollback()


def test_models_and_relationships(db_session):
    now = datetime.now(timezone.utc)
    one_hour_later = now + timedelta(hours=1)

    # 1. Create Profiles
    cand_profile = models.Profile(name="Candidate User", email="cand@example.com", role=models.UserRole.CANDIDATE)
    int_profile = models.Profile(name="Interviewer User", email="interviewer@example.com", role=models.UserRole.INTERVIEWER)
    coord_profile = models.Profile(name="Coordinator User", email="coord@example.com", role=models.UserRole.COORDINATOR)
    db_session.add_all([cand_profile, int_profile, coord_profile])
    db_session.commit()

    # 2. Candidate and Interviewer Entities
    candidate = models.Candidate(
        profile_id=cand_profile.id,
        student_id="CS2026-001",
        department="Computer Science",
        graduation_year=2026,
    )
    interviewer = models.Interviewer(
        profile_id=int_profile.id,
        skills=["Python", "Algorithms", "System Design"],
        workload_limit=4,
    )
    db_session.add_all([candidate, interviewer])
    db_session.commit()

    # Verify bidirectional relationships
    assert cand_profile.candidate.student_id == "CS2026-001"
    assert int_profile.interviewer.workload_limit == 4

    # 3. Recruitment Drive & Room
    drive = models.RecruitmentDrive(title="Campus Drive 2026", description="Annual placements")
    room = models.Room(name="Lab-101", location="Engineering Block", capacity=3)
    db_session.add_all([drive, room])
    db_session.commit()

    # 4. Availability
    avail = models.Availability(
        profile_id=int_profile.id,
        start_time=now,
        end_time=one_hour_later,
        status=models.AvailabilityStatus.AVAILABLE,
    )
    db_session.add(avail)
    db_session.commit()
    assert len(int_profile.availabilities) == 1

    # 5. Booking
    booking = models.Booking(
        drive_id=drive.id,
        candidate_id=candidate.id,
        interviewer_id=interviewer.id,
        room_id=room.id,
        round_number=1,
        start_time=now,
        end_time=one_hour_later,
        status=models.BookingStatus.CONFIRMED,
    )
    db_session.add(booking)
    db_session.commit()

    assert booking.id is not None
    assert booking.candidate.profile.email == "cand@example.com"
    assert booking.interviewer.profile.name == "Interviewer User"
    assert booking.room.name == "Lab-101"

    # 6. Evaluation
    evaluation = models.Evaluation(
        booking_id=booking.id,
        interviewer_id=interviewer.id,
        scores={"problem_solving": 9, "communication": 8},
        feedback="Demonstrated exceptional problem-solving depth.",
        recommendation="strong_hire",
    )
    db_session.add(evaluation)
    db_session.commit()

    assert booking.evaluation is not None
    assert booking.evaluation.recommendation == "strong_hire"
    assert len(interviewer.evaluations) == 1


def test_pydantic_schemas_validation():
    # Valid profile schema
    valid_p = ProfileCreate(name="Priya Sharma", email="priya@example.com", role=models.UserRole.CANDIDATE)
    assert valid_p.name == "Priya Sharma"

    # Invalid email validation
    with pytest.raises(Exception):
        ProfileCreate(name="Invalid", email="not-an-email", role=models.UserRole.CANDIDATE)

    # Valid evaluation schema
    eval_data = EvaluationCreate(
        booking_id="b-123",
        interviewer_id="i-456",
        scores={"score": 10},
        feedback="Great performance",
        recommendation="hire",
    )
    assert eval_data.recommendation == "hire"


def test_alembic_migrations_upgrade_and_downgrade(tmp_path):
    """
    Verifies that Alembic can apply all migrations from scratch to a fresh SQLite database
    and successfully downgrade them.
    """
    test_db_path = tmp_path / "test_migration.db"
    db_url = f"sqlite:///{test_db_path.as_posix()}"

    backend_dir = os.path.dirname(os.path.abspath(__file__))
    alembic_cfg = Config(os.path.join(backend_dir, "alembic.ini"))
    alembic_cfg.set_main_option("script_location", os.path.join(backend_dir, "alembic"))
    alembic_cfg.set_main_option("sqlalchemy.url", db_url)

    # 1. Apply upgrade to head
    command.upgrade(alembic_cfg, "head")

    # Inspect created schema in the migrated test database
    engine = create_engine(db_url)
    inspector = inspect(engine)
    migrated_tables = inspector.get_table_names()
    assert "profiles" in migrated_tables
    assert "bookings" in migrated_tables
    assert "evaluations" in migrated_tables
    assert "recruitment_drives" in migrated_tables

    # 2. Test downgrade to base
    command.downgrade(alembic_cfg, "base")
    inspector_after_downgrade = inspect(engine)
    remaining_tables = inspector_after_downgrade.get_table_names()
    # Profiles and bookings should have been dropped
    assert "profiles" not in remaining_tables
    assert "bookings" not in remaining_tables
