from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from database import get_db
import models
from schemas import (
    AvailabilityCreate,
    AvailabilityUpdate,
    AvailabilityRead,
)
from auth import require_any_authenticated, require_coordinator

router = APIRouter(prefix="/availability", tags=["Availability"])


@router.get("", response_model=List[AvailabilityRead])
def list_availabilities(
    profile_id: Optional[str] = Query(None, description="Filter by user profile UUID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_any_authenticated),
):
    """
    List availability windows.
    Users can list their own availability windows. Coordinators can list windows for any user.
    """
    query = db.query(models.Availability)

    if current_user.role == models.UserRole.COORDINATOR:
        if profile_id:
            query = query.filter(models.Availability.profile_id == profile_id)
    else:
        # Non-coordinators can only see their own availability
        query = query.filter(models.Availability.profile_id == current_user.id)

    return query.order_by(models.Availability.start_time.asc()).offset(skip).limit(limit).all()


@router.post("", response_model=AvailabilityRead, status_code=status.HTTP_201_CREATED)
def create_availability(
    payload: AvailabilityCreate,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_any_authenticated),
):
    """
    Create a new availability window.
    Start and end times are validated. Users create for themselves; coordinators may specify profile_id.
    """
    target_profile_id = current_user.id
    if payload.profile_id and payload.profile_id != current_user.id:
        if current_user.role != models.UserRole.COORDINATOR:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot create availability records for other users without coordinator permissions.",
            )
        target_profile_id = payload.profile_id

    # Verify target profile exists
    target_profile = db.query(models.Profile).filter(models.Profile.id == target_profile_id).first()
    if not target_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target profile with ID '{target_profile_id}' not found.",
        )

    avail = models.Availability(
        profile_id=target_profile_id,
        start_time=payload.start_time,
        end_time=payload.end_time,
        status=payload.status,
    )
    db.add(avail)
    db.commit()
    db.refresh(avail)
    return avail


@router.get("/{availability_id}", response_model=AvailabilityRead)
def get_availability_by_id(
    availability_id: str,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_any_authenticated),
):
    """
    Get availability window by ID.
    Users can view their own; coordinators can view any.
    """
    avail = db.query(models.Availability).filter(models.Availability.id == availability_id).first()
    if not avail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Availability record '{availability_id}' not found.",
        )

    if current_user.role != models.UserRole.COORDINATOR and avail.profile_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access another user's availability window.",
        )

    return avail


@router.patch("/{availability_id}", response_model=AvailabilityRead)
def update_availability(
    availability_id: str,
    payload: AvailabilityUpdate,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_any_authenticated),
):
    """
    Update availability window. End time must be strictly greater than start time.
    """
    avail = db.query(models.Availability).filter(models.Availability.id == availability_id).first()
    if not avail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Availability record '{availability_id}' not found.",
        )

    if current_user.role != models.UserRole.COORDINATOR and avail.profile_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify another user's availability window.",
        )

    update_data = payload.model_dump(exclude_unset=True)

    # Validate resulting interval
    new_start = update_data.get("start_time", avail.start_time)
    new_end = update_data.get("end_time", avail.end_time)
    cmp_start = new_start.replace(tzinfo=None) if hasattr(new_start, "replace") else new_start
    cmp_end = new_end.replace(tzinfo=None) if hasattr(new_end, "replace") else new_end
    if cmp_end <= cmp_start:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="end_time must be strictly greater than start_time.",
        )

    for field, val in update_data.items():
        setattr(avail, field, val)

    db.commit()
    db.refresh(avail)
    return avail


@router.delete("/{availability_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_availability(
    availability_id: str,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_any_authenticated),
):
    """
    Delete availability window.
    """
    avail = db.query(models.Availability).filter(models.Availability.id == availability_id).first()
    if not avail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Availability record '{availability_id}' not found.",
        )

    if current_user.role != models.UserRole.COORDINATOR and avail.profile_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete another user's availability record.",
        )

    db.delete(avail)
    db.commit()
    return None
