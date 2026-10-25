from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import get_db
import models
from schemas import (
    RecruitmentDriveCreate,
    RecruitmentDriveUpdate,
    RecruitmentDriveRead,
)
from auth import require_any_authenticated, require_coordinator

router = APIRouter(prefix="/drives", tags=["Recruitment Drives"])


@router.get("", response_model=List[RecruitmentDriveRead])
def list_drives(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[models.DriveStatus] = None,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_any_authenticated),
):
    """
    List recruitment drives with optional status filter and pagination.
    Accessible to all authenticated users (candidates, interviewers, coordinators).
    """
    query = db.query(models.RecruitmentDrive)
    if status is not None:
        query = query.filter(models.RecruitmentDrive.status == status)
    return query.order_by(models.RecruitmentDrive.created_at.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=RecruitmentDriveRead, status_code=status.HTTP_201_CREATED)
def create_drive(
    payload: RecruitmentDriveCreate,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_coordinator),
):
    """
    Create a recruitment drive. Restricted to Coordinators.
    """
    drive = models.RecruitmentDrive(
        title=payload.title,
        description=payload.description,
        status=payload.status,
    )
    db.add(drive)
    db.commit()
    db.refresh(drive)
    return drive


@router.get("/{drive_id}", response_model=RecruitmentDriveRead)
def get_drive(
    drive_id: str,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_any_authenticated),
):
    """
    Get recruitment drive details by ID. Accessible to authenticated users.
    """
    drive = db.query(models.RecruitmentDrive).filter(models.RecruitmentDrive.id == drive_id).first()
    if not drive:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recruitment drive with ID '{drive_id}' was not found.",
        )
    return drive


@router.patch("/{drive_id}", response_model=RecruitmentDriveRead)
def update_drive(
    drive_id: str,
    payload: RecruitmentDriveUpdate,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_coordinator),
):
    """
    Update recruitment drive details and status. Restricted to Coordinators.
    """
    drive = db.query(models.RecruitmentDrive).filter(models.RecruitmentDrive.id == drive_id).first()
    if not drive:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recruitment drive with ID '{drive_id}' was not found.",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(drive, field, val)

    db.commit()
    db.refresh(drive)
    return drive


@router.delete("/{drive_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_drive(
    drive_id: str,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_coordinator),
):
    """
    Delete recruitment drive by ID. Restricted to Coordinators.
    """
    drive = db.query(models.RecruitmentDrive).filter(models.RecruitmentDrive.id == drive_id).first()
    if not drive:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recruitment drive with ID '{drive_id}' was not found.",
        )

    db.delete(drive)
    db.commit()
    return None
