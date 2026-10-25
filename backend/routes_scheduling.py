"""
API Router for Drive Schedules & Constraint-Based Optimization
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
import models
from auth import require_coordinator, require_any_authenticated
from schemas import BookingRead
from scheduling_schemas import ScheduleRequest, ScheduleResult, SolverStatus
from scheduling_service import generate_and_save_schedule

router = APIRouter(prefix="/drives", tags=["Drive Scheduling Engine"])


@router.post("/{drive_id}/schedule/generate", response_model=ScheduleResult)
def generate_drive_schedule(
    drive_id: str,
    payload: ScheduleRequest,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_coordinator),
):
    """
    Generate and persist a feasible, conflict-free interview schedule using OR-Tools CP-SAT.
    Strictly restricted to Coordinators.
    """
    if payload.drive_id != drive_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Route drive_id '{drive_id}' does not match payload drive_id '{payload.drive_id}'.",
        )

    result = generate_and_save_schedule(db, payload)

    if result.status == SolverStatus.ERROR and not result.success:
        # Return structured response or 422 if invalid setup
        return result

    return result


@router.get("/{drive_id}/schedule", response_model=List[BookingRead])
def get_drive_schedule(
    drive_id: str,
    round_number: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_any_authenticated),
):
    """
    Retrieve confirmed schedule bookings for a specific drive.
    Accessible to all authenticated users.
    """
    drive = db.query(models.RecruitmentDrive).filter(models.RecruitmentDrive.id == drive_id).first()
    if not drive:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recruitment drive not found")

    query = (
        db.query(models.Booking)
        .filter(
            models.Booking.drive_id == drive_id,
            models.Booking.status == models.BookingStatus.CONFIRMED,
        )
    )

    if round_number is not None:
        query = query.filter(models.Booking.round_number == round_number)

    return query.order_by(models.Booking.start_time.asc()).all()
