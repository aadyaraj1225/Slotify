from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field

from config import settings
from database import get_db
import models
from schemas import ProfileRead
from auth import (
    require_any_authenticated,
    require_candidate,
    require_interviewer,
    require_coordinator,
)

router = APIRouter(prefix="/auth", tags=["Authentication & Roles"])


# -------------------------------------------------------------
# Request Schemas for Auth Sync & Provisioning
# -------------------------------------------------------------
class PublicRegisterRequest(BaseModel):
    user_id: str = Field(..., description="Supabase auth.users UUID")
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    # Role requested by user. Public registration enforces candidate by default
    # and explicitly rejects attempts to register as coordinator.
    requested_role: Optional[models.UserRole] = models.UserRole.CANDIDATE


class ProvisionCoordinatorRequest(BaseModel):
    user_id: str = Field(..., description="Target user UUID")
    admin_secret: str = Field(..., description="Secure bootstrap secret")


class RoleAssignmentResponse(BaseModel):
    success: bool
    user_id: str
    role: str
    message: str


# -------------------------------------------------------------
# Endpoints
# -------------------------------------------------------------

@router.post("/sync-profile", response_model=ProfileRead)
def sync_public_profile(
    payload: PublicRegisterRequest,
    db: Session = Depends(get_db),
):
    """
    Public registration profile sync.
    Enforces security rule: Public signups are assigned the candidate role by default.
    Public users are strictly prevented from registering themselves as coordinators.
    """
    if payload.requested_role == models.UserRole.COORDINATOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Public self-registration as a coordinator is not permitted.",
        )

    # Check if profile already exists
    existing = db.query(models.Profile).filter(
        (models.Profile.id == payload.user_id) | (models.Profile.email == payload.email.lower())
    ).first()

    assigned_role = payload.requested_role or models.UserRole.CANDIDATE

    if existing:
        # Existing user cannot change their own role via public registration
        return existing

    # Create new profile
    profile = models.Profile(
        id=payload.user_id,
        name=payload.name,
        email=payload.email.lower(),
        role=assigned_role,
    )
    db.add(profile)

    # Also create child entity based on role
    if assigned_role == models.UserRole.CANDIDATE:
        cand = models.Candidate(profile_id=profile.id)
        db.add(cand)
    elif assigned_role == models.UserRole.INTERVIEWER:
        interviewer = models.Interviewer(profile_id=profile.id)
        db.add(interviewer)

    db.commit()
    db.refresh(profile)
    return profile


@router.post("/admin/provision-coordinator", response_model=RoleAssignmentResponse)
def provision_coordinator(
    payload: ProvisionCoordinatorRequest,
    db: Session = Depends(get_db),
):
    """
    Secure administrative endpoint for provisioning coordinator privileges.
    Guarded by ADMIN_PROVISION_SECRET.
    """
    if not settings.ADMIN_PROVISION_SECRET or payload.admin_secret != settings.ADMIN_PROVISION_SECRET:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid administrative provisioning secret.",
        )

    profile = db.query(models.Profile).filter(models.Profile.id == payload.user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target user profile not found.",
        )

    profile.role = models.UserRole.COORDINATOR
    db.commit()

    return RoleAssignmentResponse(
        success=True,
        user_id=profile.id,
        role=profile.role.value,
        message=f"User {profile.name} successfully promoted to coordinator.",
    )


@router.get("/me", response_model=ProfileRead)
def get_current_user_me(
    current_user: models.Profile = Depends(require_any_authenticated),
):
    """
    Returns the authenticated user's verified profile and role from the database.
    """
    return current_user


@router.get("/candidate")
def candidate_only_endpoint(
    current_user: models.Profile = Depends(require_candidate),
):
    """
    Candidate-only test endpoint. Returns 403 for non-candidates.
    """
    return {
        "message": f"Welcome candidate {current_user.name}",
        "role": current_user.role.value,
        "access": "granted",
    }


@router.get("/interviewer")
def interviewer_only_endpoint(
    current_user: models.Profile = Depends(require_interviewer),
):
    """
    Interviewer-only test endpoint. Returns 403 for non-interviewers.
    """
    return {
        "message": f"Welcome interviewer {current_user.name}",
        "role": current_user.role.value,
        "access": "granted",
    }


@router.get("/coordinator")
def coordinator_only_endpoint(
    current_user: models.Profile = Depends(require_coordinator),
):
    """
    Coordinator-only test endpoint. Returns 403 for non-coordinators.
    """
    return {
        "message": f"Welcome coordinator {current_user.name}",
        "role": current_user.role.value,
        "access": "granted",
    }
