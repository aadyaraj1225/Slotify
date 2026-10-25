"""
Scheduling Engine Schemas for Slotify
Defines strongly typed payloads for solver inputs, outputs, assignments, and diagnostics.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field, model_validator


class SolverStatus(str, Enum):
    OPTIMAL = "optimal"
    FEASIBLE = "feasible"
    INFEASIBLE = "infeasible"
    TIMEOUT = "timeout"
    ERROR = "error"


class TimeWindow(BaseModel):
    start_time: datetime
    end_time: datetime

    @model_validator(mode="after")
    def validate_times(self) -> "TimeWindow":
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be strictly greater than start_time")
        return self


class CandidateInput(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    availabilities: List[TimeWindow] = Field(default_factory=list)


class InterviewerInput(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    workload_limit: int = Field(default=5, ge=1)
    availabilities: List[TimeWindow] = Field(default_factory=list)


class RoomInput(BaseModel):
    id: str
    name: str
    capacity: int = Field(default=2, ge=1)
    availabilities: List[TimeWindow] = Field(default_factory=list)


class ExistingBookingInput(BaseModel):
    id: Optional[str] = None
    candidate_id: str
    interviewer_id: str
    room_id: Optional[str] = None
    start_time: datetime
    end_time: datetime


class RoundRequirement(BaseModel):
    round_number: int = Field(default=1, ge=1)
    name: Optional[str] = None
    duration_minutes: int = Field(default=60, ge=15, le=480)
    slot_granularity_minutes: int = Field(default=15, ge=5, le=60)
    required_skills: List[str] = Field(default_factory=list)
    panel_size: int = Field(default=1, ge=1, le=5)  # Number of interviewers required per interview


class ScheduleRequest(BaseModel):
    drive_id: str
    round_requirement: RoundRequirement
    window: TimeWindow
    candidate_ids: Optional[List[str]] = None
    interviewer_ids: Optional[List[str]] = None
    room_ids: Optional[List[str]] = None
    max_solver_time_seconds: float = Field(default=10.0, ge=0.5, le=120.0)
    allow_partial_generation: bool = False  # If True, schedule as many as possible; If False, all or nothing


class ScheduledAssignment(BaseModel):
    candidate_id: str
    candidate_name: str
    interviewer_id: str
    interviewer_name: str
    room_id: Optional[str] = None
    room_name: Optional[str] = None
    round_number: int
    start_time: datetime
    end_time: datetime
    skills_matched: List[str] = Field(default_factory=list)


class ScheduleResult(BaseModel):
    status: SolverStatus
    success: bool
    drive_id: str
    round_number: int
    total_requested: int
    scheduled_count: int
    unassigned_count: int
    assignments: List[ScheduledAssignment] = Field(default_factory=list)
    conflicts: List[Dict[str, Any]] = Field(default_factory=list)
    diagnostics: List[str] = Field(default_factory=list)
    solver_time_ms: float = 0.0
