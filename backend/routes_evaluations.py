"""
Routes for Interview Evaluations, Multi-Round Progression, and Coordinator Results
"""

from typing import List, Optional
import io
import csv
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Response, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db
import models
from auth import require_coordinator, require_interviewer, require_any_authenticated
from schemas import (
    BookingRead,
    EvaluationSubmitRequest,
    EvaluationRead,
    RoundConfigBase,
    RoundConfigCreate,
    RoundConfigRead,
    CandidateProgressRead,
    DriveCandidateResult,
)
from evaluation_service import compute_evaluation_score, process_candidate_progression

router = APIRouter(tags=["Evaluations & Results"])


# -------------------------------------------------------------
# 1. Interviewer Assigned Sessions & Evaluation Submission
# -------------------------------------------------------------

@router.get("/interviewer/my-interviews", response_model=List[BookingRead])
def get_interviewer_assigned_interviews(
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_interviewer),
):
    """
    Returns all interviews assigned to the authenticated interviewer.
    """
    interviewer = db.query(models.Interviewer).filter(models.Interviewer.profile_id == current_user.id).first()
    if not interviewer:
        return []

    bookings = (
        db.query(models.Booking)
        .filter(models.Booking.interviewer_id == interviewer.id)
        .order_by(models.Booking.start_time.asc())
        .all()
    )

    from routes_candidate_booking import _populate_booking_read
    return [_populate_booking_read(b) for b in bookings]


@router.post("/bookings/{booking_id}/evaluations", response_model=EvaluationRead, status_code=status.HTTP_201_CREATED)
def submit_evaluation(
    booking_id: str,
    payload: EvaluationSubmitRequest,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_any_authenticated),
):
    """
    Submit or update evaluation scorecard for an interview booking.
    Interviewers can only evaluate bookings assigned to them.
    Coordinators have administrative override rights.
    """
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking record not found.")

    is_coordinator = current_user.role == models.UserRole.COORDINATOR
    interviewer = db.query(models.Interviewer).filter(models.Interviewer.profile_id == current_user.id).first()

    if not is_coordinator:
        if not interviewer or booking.interviewer_id != interviewer.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to submit an evaluation for this booking.",
            )

    # Fetch round config to validate score bounds & weights
    round_cfg = (
        db.query(models.RoundConfig)
        .filter(
            models.RoundConfig.drive_id == booking.drive_id,
            models.RoundConfig.round_number == booking.round_number,
        )
        .first()
    )

    max_score = round_cfg.max_score if round_cfg else 10
    weights = round_cfg.criteria_weights if round_cfg else None

    # Validate that individual criterion scores are non-negative and <= max_score
    for crit, val in payload.scores.items():
        if val < 0 or val > max_score:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Score for '{crit}' ({val}) is out of permissible range [0, {max_score}].",
            )

    pct_score, _ = compute_evaluation_score(payload.scores, weights, max_score)

    # Check for existing evaluation
    evaluation = db.query(models.Evaluation).filter(models.Evaluation.booking_id == booking.id).first()
    evaluator_id = interviewer.id if interviewer else booking.interviewer_id

    if evaluation:
        if evaluation.status == models.EvaluationStatus.SUBMITTED and not is_coordinator:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Evaluation is already finalized and cannot be edited without coordinator authorization.",
            )
        evaluation.scores = payload.scores
        evaluation.feedback = payload.feedback
        evaluation.recommendation = payload.recommendation
        evaluation.status = payload.status
        evaluation.total_score = pct_score
    else:
        evaluation = models.Evaluation(
            booking_id=booking.id,
            interviewer_id=evaluator_id,
            scores=payload.scores,
            feedback=payload.feedback,
            recommendation=payload.recommendation,
            status=payload.status,
            total_score=pct_score,
        )
        db.add(evaluation)

    db.flush()

    # Process candidate round progression
    process_candidate_progression(
        db=db,
        drive_id=booking.drive_id,
        candidate_id=booking.candidate_id,
        round_number=booking.round_number,
    )

    db.commit()
    db.refresh(evaluation)

    return EvaluationRead(
        id=evaluation.id,
        booking_id=evaluation.booking_id,
        interviewer_id=evaluation.interviewer_id,
        interviewer_name=booking.interviewer.profile.name if booking.interviewer and booking.interviewer.profile else "Interviewer",
        candidate_id=booking.candidate_id,
        candidate_name=booking.candidate.profile.name if booking.candidate and booking.candidate.profile else "Candidate",
        round_number=booking.round_number,
        scores=evaluation.scores,
        feedback=evaluation.feedback,
        recommendation=evaluation.recommendation,
        status=evaluation.status,
        total_score=evaluation.total_score,
        created_at=evaluation.created_at,
        updated_at=evaluation.updated_at,
    )


# -------------------------------------------------------------
# 2. Drive Round Configuration (Coordinator)
# -------------------------------------------------------------

@router.get("/drives/{drive_id}/rounds", response_model=List[RoundConfigRead])
def get_drive_rounds(
    drive_id: str,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_any_authenticated),
):
    """
    List configured interview rounds for a recruitment drive.
    """
    drive = db.query(models.RecruitmentDrive).filter(models.RecruitmentDrive.id == drive_id).first()
    if not drive:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recruitment drive not found.")

    rounds = (
        db.query(models.RoundConfig)
        .filter(models.RoundConfig.drive_id == drive_id)
        .order_by(models.RoundConfig.round_number.asc())
        .all()
    )
    return rounds


@router.post("/drives/{drive_id}/rounds", response_model=RoundConfigRead, status_code=status.HTTP_201_CREATED)
def configure_drive_round(
    drive_id: str,
    payload: RoundConfigCreate,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_coordinator),
):
    """
    Add or update a round configuration for a recruitment drive.
    Restricted to Coordinators.
    """
    drive = db.query(models.RecruitmentDrive).filter(models.RecruitmentDrive.id == drive_id).first()
    if not drive:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recruitment drive not found.")

    existing = (
        db.query(models.RoundConfig)
        .filter(
            models.RoundConfig.drive_id == drive_id,
            models.RoundConfig.round_number == payload.round_number,
        )
        .first()
    )

    if existing:
        existing.name = payload.name
        existing.round_type = payload.round_type
        existing.duration_minutes = payload.duration_minutes
        existing.min_passing_score = payload.min_passing_score
        existing.criteria_weights = payload.criteria_weights
        existing.max_score = payload.max_score
        db.commit()
        db.refresh(existing)
        return existing

    round_cfg = models.RoundConfig(
        drive_id=drive_id,
        round_number=payload.round_number,
        name=payload.name,
        round_type=payload.round_type,
        duration_minutes=payload.duration_minutes,
        min_passing_score=payload.min_passing_score,
        criteria_weights=payload.criteria_weights,
        max_score=payload.max_score,
    )
    db.add(round_cfg)
    db.commit()
    db.refresh(round_cfg)
    return round_cfg


# -------------------------------------------------------------
# 3. Candidate Progression Tracking & Dashboards
# -------------------------------------------------------------

@router.get("/drives/{drive_id}/candidates/progress", response_model=List[CandidateProgressRead])
def get_drive_candidates_progress(
    drive_id: str,
    round_number: Optional[int] = None,
    status_filter: Optional[models.CandidateProgressionStatus] = None,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_coordinator),
):
    """
    View candidate progression records for a recruitment drive.
    Restricted to Coordinators.
    """
    query = db.query(models.CandidateRoundProgress).filter(models.CandidateRoundProgress.drive_id == drive_id)

    if round_number is not None:
        query = query.filter(models.CandidateRoundProgress.round_number == round_number)
    if status_filter is not None:
        query = query.filter(models.CandidateRoundProgress.status == status_filter)

    progressions = query.order_by(models.CandidateRoundProgress.round_number.asc()).all()

    # Preload round names
    round_cfgs = db.query(models.RoundConfig).filter(models.RoundConfig.drive_id == drive_id).all()
    round_name_map = {r.round_number: r.name for r in round_cfgs}

    results = []
    for p in progressions:
        cand = p.candidate
        c_name = cand.profile.name if cand and cand.profile else f"Candidate {p.candidate_id[:8]}"
        c_roll = cand.student_id if cand else None

        results.append(
            CandidateProgressRead(
                id=p.id,
                drive_id=p.drive_id,
                candidate_id=p.candidate_id,
                candidate_name=c_name,
                candidate_roll_no=c_roll,
                round_number=p.round_number,
                round_name=round_name_map.get(p.round_number, f"Round {p.round_number}"),
                status=p.status,
                aggregate_score=p.aggregate_score,
                notes=p.notes,
                updated_at=p.updated_at,
            )
        )
    return results


# -------------------------------------------------------------
# 4. Drive Overall Results, Ranking & CSV Export
# -------------------------------------------------------------

@router.get("/drives/{drive_id}/results", response_model=List[DriveCandidateResult])
def get_drive_results(
    drive_id: str,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_coordinator),
):
    """
    Computes overall candidate rankings and round-by-round score breakdowns.
    Tie-breaking: Overall score descending, then evaluations completed descending.
    """
    drive = db.query(models.RecruitmentDrive).filter(models.RecruitmentDrive.id == drive_id).first()
    if not drive:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recruitment drive not found.")

    candidates = db.query(models.Candidate).all()
    progressions = db.query(models.CandidateRoundProgress).filter(models.CandidateRoundProgress.drive_id == drive_id).all()

    # Map candidate progressions
    cand_prog_map = {}
    for p in progressions:
        cand_prog_map.setdefault(p.candidate_id, []).append(p)

    results: List[DriveCandidateResult] = []

    for c in candidates:
        c_progs = cand_prog_map.get(c.id, [])
        if not c_progs:
            continue

        round_scores = {}
        for cp in c_progs:
            if cp.aggregate_score is not None:
                round_scores[cp.round_number] = float(cp.aggregate_score)

        latest_round = max(p.round_number for p in c_progs)
        latest_prog = next(p for p in c_progs if p.round_number == latest_round)

        overall = sum(round_scores.values()) / len(round_scores) if round_scores else 0.0

        # Provisional if any round is still pending
        is_provisional = any(p.status == models.CandidateProgressionStatus.PENDING for p in c_progs)

        results.append(
            DriveCandidateResult(
                rank=0,
                candidate_id=c.id,
                candidate_name=c.profile.name if c.profile else "Candidate",
                candidate_email=c.profile.email if c.profile else None,
                student_id=c.student_id,
                current_round=latest_round,
                status=latest_prog.status,
                overall_score=round(overall, 1),
                round_scores=round_scores,
                evaluations_completed=len(round_scores),
                is_provisional=is_provisional,
            )
        )

    # Sort candidates by overall_score DESC, then evaluations_completed DESC
    results.sort(key=lambda x: (x.overall_score, x.evaluations_completed), reverse=True)

    for idx, item in enumerate(results, start=1):
        item.rank = idx

    return results


@router.get("/drives/{drive_id}/results/export", response_class=Response)
def export_drive_results_csv(
    drive_id: str,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_coordinator),
):
    """
    Exports official candidate results and round performance to CSV.
    Restricted strictly to Coordinators.
    """
    results = get_drive_results(drive_id=drive_id, db=db, current_user=current_user)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Rank",
        "Candidate ID",
        "Candidate Name",
        "Roll No",
        "Email",
        "Current Round",
        "Outcome Status",
        "Overall Score (%)",
        "Evaluations Completed",
        "Provisional Status",
    ])

    for r in results:
        writer.writerow([
            r.rank,
            r.candidate_id,
            r.candidate_name,
            r.student_id or "N/A",
            r.candidate_email or "N/A",
            r.current_round,
            r.status.value.upper(),
            f"{r.overall_score:.1f}",
            r.evaluations_completed,
            "YES" if r.is_provisional else "FINAL",
        ])

    csv_data = output.getvalue()
    filename = f"drive-results-{drive_id[:8]}.csv"

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
