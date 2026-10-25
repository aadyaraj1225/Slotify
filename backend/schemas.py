from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator
from models import UserRole, DriveStatus, AvailabilityStatus, BookingStatus, NotificationType


# ---------------------------------------------------------
# Profile Schemas
# ---------------------------------------------------------
class ProfileBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    role: UserRole


class ProfileCreate(ProfileBase):
    id: Optional[str] = None


class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)


class ProfileRead(ProfileBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------
# Recruitment Drive Schemas
# ---------------------------------------------------------
class RecruitmentDriveBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: DriveStatus = DriveStatus.DRAFT


class RecruitmentDriveCreate(RecruitmentDriveBase):
    pass


class RecruitmentDriveUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[DriveStatus] = None


class RecruitmentDriveRead(RecruitmentDriveBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------
# Candidate Schemas
# ---------------------------------------------------------
class CandidateBase(BaseModel):
    student_id: Optional[str] = None
    department: Optional[str] = None
    graduation_year: Optional[int] = None
    resume_url: Optional[str] = None
    extra_details: Optional[Dict[str, Any]] = None


class CandidateCreate(CandidateBase):
    profile_id: str


class CandidateUpdate(BaseModel):
    student_id: Optional[str] = None
    department: Optional[str] = None
    graduation_year: Optional[int] = None
    resume_url: Optional[str] = None
    extra_details: Optional[Dict[str, Any]] = None


class CandidateRead(CandidateBase):
    id: str
    profile_id: str
    name: Optional[str] = None
    email: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------
# Interviewer Schemas
# ---------------------------------------------------------
class InterviewerBase(BaseModel):
    skills: Optional[List[str]] = None
    workload_limit: int = Field(default=5, ge=1)
    department: Optional[str] = None


class InterviewerCreate(InterviewerBase):
    profile_id: str


class InterviewerUpdate(BaseModel):
    skills: Optional[List[str]] = None
    workload_limit: Optional[int] = Field(None, ge=1)
    department: Optional[str] = None


class InterviewerRead(InterviewerBase):
    id: str
    profile_id: str
    name: Optional[str] = None
    email: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------
# Room Schemas
# ---------------------------------------------------------
class RoomBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    location: Optional[str] = None
    capacity: int = Field(default=2, ge=1)


class RoomCreate(RoomBase):
    pass


class RoomUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    location: Optional[str] = None
    capacity: Optional[int] = Field(None, ge=1)


class RoomRead(RoomBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------
# Availability Schemas
# ---------------------------------------------------------
class AvailabilityBase(BaseModel):
    start_time: datetime
    end_time: datetime
    status: AvailabilityStatus = AvailabilityStatus.AVAILABLE

    @model_validator(mode="after")
    def validate_times(self) -> "AvailabilityBase":
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be strictly greater than start_time")
        return self


class AvailabilityCreate(AvailabilityBase):
    profile_id: Optional[str] = None  # Coordinator may specify, otherwise defaults to current user


class AvailabilityUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[AvailabilityStatus] = None

    @model_validator(mode="after")
    def validate_update_times(self) -> "AvailabilityUpdate":
        if self.start_time and self.end_time and self.end_time <= self.start_time:
            raise ValueError("end_time must be strictly greater than start_time")
        return self


class AvailabilityRead(AvailabilityBase):
    id: str
    profile_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------
# Booking Schemas
# ---------------------------------------------------------
class BookingBase(BaseModel):
    drive_id: str
    candidate_id: str
    interviewer_id: str
    room_id: Optional[str] = None
    round_number: int = Field(default=1, ge=1)
    start_time: datetime
    end_time: datetime
    status: BookingStatus = BookingStatus.CONFIRMED

    @model_validator(mode="after")
    def validate_booking_times(self) -> "BookingBase":
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be strictly greater than start_time")
        return self


class BookingCreate(BookingBase):
    pass


class BookingRead(BookingBase):
    id: str
    created_at: datetime
    updated_at: datetime
    candidate_name: Optional[str] = None
    interviewer_name: Optional[str] = None
    room_name: Optional[str] = None
    drive_title: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------
# Notification Schemas
# ---------------------------------------------------------
class NotificationRead(BaseModel):
    id: str
    recipient_profile_id: str
    booking_id: Optional[str] = None
    title: str
    message: str
    notification_type: NotificationType
    is_read: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationUpdate(BaseModel):
    is_read: int = Field(1, ge=0, le=1)


# ---------------------------------------------------------
# Candidate Slot Schemas
# ---------------------------------------------------------
class AvailableSlotRead(BaseModel):
    id: str
    drive_id: str
    drive_title: str
    round_number: int
    round_name: str
    interviewer_id: str
    interviewer_name: str
    room_id: Optional[str] = None
    room_name: Optional[str] = None
    start_time: datetime
    end_time: datetime
    duration_minutes: int


class CandidateBookingRequest(BaseModel):
    drive_id: str
    interviewer_id: str
    room_id: Optional[str] = None
    round_number: int = Field(default=1, ge=1)
    start_time: datetime
    end_time: datetime
    idempotency_key: Optional[str] = None

    @model_validator(mode="after")
    def validate_slot_times(self) -> "CandidateBookingRequest":
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be strictly greater than start_time")
        return self



# ---------------------------------------------------------
# Evaluation Schemas
# ---------------------------------------------------------
class EvaluationBase(BaseModel):
    scores: Optional[Dict[str, Any]] = None
    feedback: Optional[str] = None
    recommendation: Optional[str] = None


class EvaluationCreate(EvaluationBase):
    booking_id: str
    interviewer_id: str


class EvaluationRead(EvaluationBase):
    id: str
    booking_id: str
    interviewer_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
