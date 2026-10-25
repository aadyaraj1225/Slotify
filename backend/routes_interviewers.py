from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from database import get_db
import models
from schemas import (
    InterviewerCreate,
    InterviewerUpdate,
    InterviewerRead,
)
from auth import require_any_authenticated, require_coordinator

router = APIRouter(prefix="/interviewers", tags=["Interviewers"])


def _to_interviewer_read(interviewer: models.Interviewer) -> InterviewerRead:
    return InterviewerRead(
        id=interviewer.id,
        profile_id=interviewer.profile_id,
        name=interviewer.profile.name if interviewer.profile else None,
        email=interviewer.profile.email if interviewer.profile else None,
        skills=interviewer.skills,
        workload_limit=interviewer.workload_limit,
        department=interviewer.department,
        created_at=interviewer.created_at,
        updated_at=interviewer.updated_at,
    )


@router.get("", response_model=List[InterviewerRead])
def list_interviewers(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_coordinator),
):
    """
    List interviewer records with pagination. Restricted to Coordinators.
    """
    query = db.query(models.Interviewer).join(models.Profile)
    if department:
        query = query.filter(models.Interviewer.department.ilike(f"%{department}%"))
    interviewers = query.order_by(models.Interviewer.created_at.desc()).offset(skip).limit(limit).all()
    return [_to_interviewer_read(i) for i in interviewers]


@router.post("", response_model=InterviewerRead, status_code=status.HTTP_201_CREATED)
def create_interviewer(
    payload: InterviewerCreate,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_coordinator),
):
    """
    Create an interviewer record linked to a profile. Restricted to Coordinators.
    """
    profile = db.query(models.Profile).filter(models.Profile.id == payload.profile_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile with ID '{payload.profile_id}' not found.",
        )

    existing = db.query(models.Interviewer).filter(models.Interviewer.profile_id == payload.profile_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Interviewer record for profile '{payload.profile_id}' already exists.",
        )

    interviewer = models.Interviewer(
        profile_id=payload.profile_id,
        skills=payload.skills,
        workload_limit=payload.workload_limit,
        department=payload.department,
    )
    db.add(interviewer)
    db.commit()
    db.refresh(interviewer)
    return _to_interviewer_read(interviewer)


@router.get("/me", response_model=InterviewerRead)
def get_current_interviewer(
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_any_authenticated),
):
    """
    Get the authenticated interviewer's own interviewer record.
    """
    interviewer = db.query(models.Interviewer).filter(models.Interviewer.profile_id == current_user.id).first()
    if not interviewer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interviewer record not found for current user.",
        )
    return _to_interviewer_read(interviewer)


@router.get("/{interviewer_id}", response_model=InterviewerRead)
def get_interviewer_by_id(
    interviewer_id: str,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_any_authenticated),
):
    """
    Get interviewer details by ID.
    Interviewers can view their own profile. Coordinators can view any profile.
    """
    interviewer = db.query(models.Interviewer).filter(models.Interviewer.id == interviewer_id).first()
    if not interviewer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Interviewer with ID '{interviewer_id}' not found.",
        )

    if current_user.role != models.UserRole.COORDINATOR and interviewer.profile_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view another interviewer's profile.",
        )

    return _to_interviewer_read(interviewer)


@router.patch("/{interviewer_id}", response_model=InterviewerRead)
def update_interviewer(
    interviewer_id: str,
    payload: InterviewerUpdate,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_any_authenticated),
):
    """
    Update permitted interviewer fields.
    Interviewers can update their skills and department.
    Workload limit modifications are restricted to Coordinators.
    """
    interviewer = db.query(models.Interviewer).filter(models.Interviewer.id == interviewer_id).first()
    if not interviewer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Interviewer with ID '{interviewer_id}' not found.",
        )

    is_coordinator = current_user.role == models.UserRole.COORDINATOR
    is_owner = interviewer.profile_id == current_user.id

    if not is_coordinator and not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify another interviewer's profile.",
        )

    update_data = payload.model_dump(exclude_unset=True)

    # Restrict workload limit change to coordinators
    if "workload_limit" in update_data and not is_coordinator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Modifying workload limit requires coordinator privileges.",
        )

    for field, val in update_data.items():
        setattr(interviewer, field, val)

    db.commit()
    db.refresh(interviewer)
    return _to_interviewer_read(interviewer)


@router.delete("/{interviewer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_interviewer(
    interviewer_id: str,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_coordinator),
):
    """
    Delete interviewer record. Restricted to Coordinators.
    """
    interviewer = db.query(models.Interviewer).filter(models.Interviewer.id == interviewer_id).first()
    if not interviewer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Interviewer with ID '{interviewer_id}' not found.",
        )

    db.delete(interviewer)
    db.commit()
    return None
