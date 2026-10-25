import uuid
from datetime import datetime, timezone
import enum
from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    DateTime,
    ForeignKey,
    Enum,
    CheckConstraint,
    JSON,
)
from sqlalchemy.orm import relationship
from database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class UserRole(str, enum.Enum):
    CANDIDATE = "candidate"
    INTERVIEWER = "interviewer"
    COORDINATOR = "coordinator"


class DriveStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class AvailabilityStatus(str, enum.Enum):
    AVAILABLE = "available"
    UNAVAILABLE = "unavailable"
    BUSY = "busy"


class BookingStatus(str, enum.Enum):
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    RESCHEDULED = "rescheduled"


class Profile(Base):
    """
    User profile entity mapping users, coordinators, interviewers, and candidates.
    Can be tied directly to Supabase auth.users via id.
    """
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    role = Column(Enum(UserRole, name="user_role", native_enum=False), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    candidate = relationship("Candidate", back_populates="profile", uselist=False, cascade="all, delete-orphan")
    interviewer = relationship("Interviewer", back_populates="profile", uselist=False, cascade="all, delete-orphan")
    availabilities = relationship("Availability", back_populates="profile", cascade="all, delete-orphan")


class RecruitmentDrive(Base):
    """
    Recruitment drive entity representing a campus placement or recruitment cycle.
    """
    __tablename__ = "recruitment_drives"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(DriveStatus, name="drive_status", native_enum=False), default=DriveStatus.DRAFT, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    bookings = relationship("Booking", back_populates="drive", cascade="all, delete-orphan")


class Candidate(Base):
    """
    Candidate entity linked to a user profile, holding academic or candidate-specific details.
    """
    __tablename__ = "candidates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    profile_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    resume_url = Column(String(1024), nullable=True)
    student_id = Column(String(100), nullable=True, index=True)
    department = Column(String(100), nullable=True)
    graduation_year = Column(Integer, nullable=True)
    extra_details = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    profile = relationship("Profile", back_populates="candidate")
    bookings = relationship("Booking", back_populates="candidate", cascade="all, delete-orphan")


class Interviewer(Base):
    """
    Interviewer entity representing faculty or company evaluators with skill tags and max load limits.
    """
    __tablename__ = "interviewers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    profile_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    skills = Column(JSON, nullable=True)  # List or dictionary of technical skills / domains
    workload_limit = Column(Integer, default=5, nullable=False)  # Maximum interviews per day / period
    department = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    profile = relationship("Profile", back_populates="interviewer")
    bookings = relationship("Booking", back_populates="interviewer", cascade="all, delete-orphan")
    evaluations = relationship("Evaluation", back_populates="interviewer", cascade="all, delete-orphan")


class Room(Base):
    """
    Physical or virtual room inventory with capacity and location specs.
    """
    __tablename__ = "rooms"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False, index=True)
    location = Column(String(255), nullable=True)
    capacity = Column(Integer, default=2, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    bookings = relationship("Booking", back_populates="room")


class Availability(Base):
    """
    Availability windows for evaluators or users with start/end time stamps and status.
    """
    __tablename__ = "availabilities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    profile_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True), nullable=False, index=True)
    status = Column(Enum(AvailabilityStatus, name="availability_status", native_enum=False), default=AvailabilityStatus.AVAILABLE, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    profile = relationship("Profile", back_populates="availabilities")

    __table_args__ = (
        CheckConstraint("end_time > start_time", name="check_availability_times"),
    )


class Booking(Base):
    """
    Interview booking entity connecting drive, candidate, interviewer, room, and timeslot.
    Supports multi-round workflows via round_number and flexible metadata.
    """
    __tablename__ = "bookings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    drive_id = Column(String(36), ForeignKey("recruitment_drives.id", ondelete="CASCADE"), nullable=False, index=True)
    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    interviewer_id = Column(String(36), ForeignKey("interviewers.id", ondelete="CASCADE"), nullable=False, index=True)
    room_id = Column(String(36), ForeignKey("rooms.id", ondelete="SET NULL"), nullable=True, index=True)
    round_number = Column(Integer, default=1, nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True), nullable=False, index=True)
    status = Column(Enum(BookingStatus, name="booking_status", native_enum=False), default=BookingStatus.CONFIRMED, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    drive = relationship("RecruitmentDrive", back_populates="bookings")
    candidate = relationship("Candidate", back_populates="bookings")
    interviewer = relationship("Interviewer", back_populates="bookings")
    room = relationship("Room", back_populates="bookings")
    evaluation = relationship("Evaluation", back_populates="booking", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("end_time > start_time", name="check_booking_times"),
    )


class NotificationType(str, enum.Enum):
    BOOKING_CONFIRMED = "booking_confirmed"
    BOOKING_CANCELLED = "booking_cancelled"
    INFO = "info"
    WARNING = "warning"


class Notification(Base):
    """
    In-app notification entity tracking messages, booking links, read status, and recipients.
    """
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    recipient_profile_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(
        Enum(NotificationType, name="notification_type", native_enum=False),
        default=NotificationType.INFO,
        nullable=False,
    )
    is_read = Column(Integer, default=0, nullable=False)  # 0 for unread, 1 for read (SQLite & PG portable)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    recipient = relationship("Profile", backref="notifications")
    booking = relationship("Booking", backref="notifications")


class Evaluation(Base):
    """
    Rubric evaluation and feedback scorecard filled by an interviewer for a booking.
    """
    __tablename__ = "evaluations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    interviewer_id = Column(String(36), ForeignKey("interviewers.id", ondelete="CASCADE"), nullable=False, index=True)
    scores = Column(JSON, nullable=True)  # Dictionary of criteria scores, e.g. {"technical": 9, "communication": 8}
    feedback = Column(Text, nullable=True)
    recommendation = Column(String(50), nullable=True)  # e.g., "hire", "strong_hire", "reject", "hold"
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    booking = relationship("Booking", back_populates="evaluation")
    interviewer = relationship("Interviewer", back_populates="evaluations")


