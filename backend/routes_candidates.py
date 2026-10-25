from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import get_db
import models
from schemas import (
    CandidateCreate,
    CandidateUpdate,
    CandidateRead,
)
from auth import require_any_authenticated, require_coordinator

router = APIRouter(prefix="/candidates", tags=["Candidates"])


def _to_candidate_read(cand: models.Candidate) -> CandidateRead:
    return CandidateRead(
        id=cand.id,
        profile_id=cand.profile_id,
        name=cand.profile.name if cand.profile else None,
        email=cand.profile.email if cand.profile else None,
        student_id=cand.student_id,
        department=cand.department,
        graduation_year=cand.graduation_year,
        resume_url=cand.resume_url,
        extra_details=cand.extra_details,
        created_at=cand.created_at,
        updated_at=cand.updated_at,
    )


@router.get("", response_model=List[CandidateRead])
def list_candidates(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_coordinator),
):
    """
    List all candidate records with pagination. Restricted to Coordinators.
    """
    query = db.query(models.Candidate).join(models.Profile)
    if department:
        query = query.filter(models.Candidate.department.ilike(f"%{department}%"))
    candidates = query.order_by(models.Candidate.created_at.desc()).offset(skip).limit(limit).all()
    return [_to_candidate_read(c) for c in candidates]


@router.post("", response_model=CandidateRead, status_code=status.HTTP_201_CREATED)
def create_candidate(
    payload: CandidateCreate,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_coordinator),
):
    """
    Create a candidate record linked to a profile. Restricted to Coordinators.
    """
    profile = db.query(models.Profile).filter(models.Profile.id == payload.profile_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile with ID '{payload.profile_id}' not found.",
        )

    existing = db.query(models.Candidate).filter(models.Candidate.profile_id == payload.profile_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Candidate record for profile '{payload.profile_id}' already exists.",
        )

    cand = models.Candidate(
        profile_id=payload.profile_id,
        student_id=payload.student_id,
        department=payload.department,
        graduation_year=payload.graduation_year,
        resume_url=payload.resume_url,
        extra_details=payload.extra_details,
    )
    db.add(cand)
    db.commit()
    db.refresh(cand)
    return _to_candidate_read(cand)


@router.get("/me", response_model=CandidateRead)
def get_current_candidate(
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_any_authenticated),
):
    """
    Get the authenticated candidate's own candidate profile.
    """
    cand = db.query(models.Candidate).filter(models.Candidate.profile_id == current_user.id).first()
    if not cand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile record not found for the current user.",
        )
    return _to_candidate_read(cand)


@router.get("/{candidate_id}", response_model=CandidateRead)
def get_candidate_by_id(
    candidate_id: str,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_any_authenticated),
):
    """
    Get candidate details by candidate ID.
    Candidates can only view their own record. Coordinators can view any record.
    """
    cand = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not cand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID '{candidate_id}' not found.",
        )

    # Authorization check
    if current_user.role != models.UserRole.COORDINATOR and cand.profile_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access another candidate's private profile.",
        )

    return _to_candidate_read(cand)


@router.patch("/{candidate_id}", response_model=CandidateRead)
def update_candidate(
    candidate_id: str,
    payload: CandidateUpdate,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_any_authenticated),
):
    """
    Update permitted candidate fields.
    Candidates can update their own permitted fields. Coordinators can update any candidate.
    """
    cand = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not cand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID '{candidate_id}' not found.",
        )

    # Authorization check
    if current_user.role != models.UserRole.COORDINATOR and cand.profile_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify another candidate's profile.",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(cand, field, val)

    db.commit()
    db.refresh(cand)
    return _to_candidate_read(cand)


@router.delete("/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_candidate(
    candidate_id: str,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_coordinator),
):
    """
    Delete candidate record. Restricted to Coordinators.
    """
    cand = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not cand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID '{candidate_id}' not found.",
        )

    db.delete(cand)
    db.commit()
    return None
