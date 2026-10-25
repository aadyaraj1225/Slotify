"""
API Routes for Schedule Recovery (Phase 8)
Endpoints for:
- Previewing automated disruption recovery plans
- Approving and applying recovery plans
- Retrieving specific recovery plans
- Inspecting recovery audit history
"""

from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from database import get_db
import models
from auth import require_coordinator
from schemas import (
    DisruptionInput,
    RecoveryPreviewResponse,
    RecoveryApplyResponse,
    ProposedAssignmentChange,
)
from recovery_service import generate_recovery_preview, apply_schedule_recovery

router = APIRouter(prefix="/drives", tags=["Schedule Recovery & Resilience"])


@router.post("/{drive_id}/schedule/recovery/preview", response_model=RecoveryPreviewResponse)
def preview_schedule_recovery(
    drive_id: str,
    payload: DisruptionInput,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_coordinator),
):
    """
    Simulates replacement schedule options for a disruption without altering the live schedule.
    Restricted to Coordinators.
    """
    try:
        recovery, changes = generate_recovery_preview(
            db=db,
            drive_id=drive_id,
            disruption=payload,
            initiated_by_profile_id=current_user.id,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    total = len(recovery.affected_booking_ids or [])
    rec_count = len(changes)

    return RecoveryPreviewResponse(
        recovery_id=recovery.id,
        drive_id=recovery.drive_id,
        status=recovery.status,
        disruption_type=recovery.disruption_type,
        total_affected=total,
        recoverable_count=rec_count,
        unrecoverable_count=total - rec_count,
        proposed_changes=changes,
        diagnostics=recovery.diagnostics or [],
        created_at=recovery.created_at,
    )


@router.post("/{drive_id}/schedule/recovery/{recovery_id}/apply", response_model=RecoveryApplyResponse)
def apply_schedule_recovery_endpoint(
    drive_id: str,
    recovery_id: str,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_coordinator),
):
    """
    Applies an approved recovery plan atomically to the database.
    Restricted to Coordinators.
    """
    success, message, count = apply_schedule_recovery(
        db=db,
        recovery_id=recovery_id,
        approver_profile_id=current_user.id,
    )

    if not success:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=message)

    return RecoveryApplyResponse(
        recovery_id=recovery_id,
        status=models.RecoveryStatus.APPLIED,
        applied_count=count,
        message=message,
        applied_at=datetime.utcnow(),
    )


@router.get("/{drive_id}/schedule/recovery/history", response_model=List[RecoveryPreviewResponse])
def get_recovery_history(
    drive_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_coordinator),
):
    """
    Audit history of disruptions and recovery outcomes for a recruitment drive.
    Restricted to Coordinators.
    """
    recoveries = (
        db.query(models.ScheduleRecovery)
        .filter(models.ScheduleRecovery.drive_id == drive_id)
        .order_by(models.ScheduleRecovery.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    results = []
    for rec in recoveries:
        changes = [ProposedAssignmentChange(**c) for c in (rec.proposed_assignments or [])]
        total = len(rec.affected_booking_ids or [])
        rec_count = len(changes)
        results.append(
            RecoveryPreviewResponse(
                recovery_id=rec.id,
                drive_id=rec.drive_id,
                status=rec.status,
                disruption_type=rec.disruption_type,
                total_affected=total,
                recoverable_count=rec_count,
                unrecoverable_count=total - rec_count,
                proposed_changes=changes,
                diagnostics=rec.diagnostics or [],
                created_at=rec.created_at,
            )
        )
    return results


@router.get("/{drive_id}/schedule/recovery/{recovery_id}", response_model=RecoveryPreviewResponse)
def get_recovery_plan(
    drive_id: str,
    recovery_id: str,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_coordinator),
):
    """
    Get details of a specific schedule recovery plan.
    Restricted to Coordinators.
    """
    rec = (
        db.query(models.ScheduleRecovery)
        .filter(models.ScheduleRecovery.id == recovery_id, models.ScheduleRecovery.drive_id == drive_id)
        .first()
    )
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recovery record not found.")

    changes = [ProposedAssignmentChange(**c) for c in (rec.proposed_assignments or [])]
    total = len(rec.affected_booking_ids or [])
    rec_count = len(changes)

    return RecoveryPreviewResponse(
        recovery_id=rec.id,
        drive_id=rec.drive_id,
        status=rec.status,
        disruption_type=rec.disruption_type,
        total_affected=total,
        recoverable_count=rec_count,
        unrecoverable_count=total - rec_count,
        proposed_changes=changes,
        diagnostics=rec.diagnostics or [],
        created_at=rec.created_at,
    )

