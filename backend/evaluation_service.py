"""
Evaluation & Progression Scoring Service
Handles:
1. Validating evaluation scores against round config rubrics.
2. Computing aggregate scores using weighted or unweighted formulas.
3. Automatically advancing or rejecting candidates according to round progression rules.
4. Calculating rank and tie-breaking for coordinator dashboards and CSV exports.
"""

from typing import Dict, List, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

import models
from scheduler_engine import _ensure_utc


def compute_evaluation_score(
    scores: Dict[str, float],
    criteria_weights: Optional[Dict[str, float]],
    max_score: int = 10,
) -> Tuple[int, float]:
    """
    Computes percentage score (0-100) and unweighted raw average.
    Supports weighted rubrics if configured, otherwise simple arithmetic mean.
    """
    if not scores:
        return 0, 0.0

    if criteria_weights:
        # Normalize weights if they sum > 0
        total_weight = sum(criteria_weights.get(crit, 0.0) for crit in scores.keys())
        if total_weight > 0:
            weighted_sum = sum(
                (scores[crit] / max_score) * criteria_weights.get(crit, 0.0)
                for crit in scores.keys()
            )
            pct = int((weighted_sum / total_weight) * 100)
            avg_raw = sum(scores.values()) / len(scores)
            return min(100, max(0, pct)), avg_raw

    # Unweighted fallback
    avg_raw = sum(scores.values()) / len(scores)
    pct = int((avg_raw / max_score) * 100)
    return min(100, max(0, pct)), avg_raw


def process_candidate_progression(
    db: Session,
    drive_id: str,
    candidate_id: str,
    round_number: int,
) -> models.CandidateRoundProgress:
    """
    Evaluates candidate's performance in the given round across all completed evaluations.
    Determines if candidate passes min_passing_score threshold.
    """
    # 1. Fetch round config for this round
    round_cfg = (
        db.query(models.RoundConfig)
        .filter(
            models.RoundConfig.drive_id == drive_id,
            models.RoundConfig.round_number == round_number,
        )
        .first()
    )
    min_passing = round_cfg.min_passing_score if round_cfg else 70

    # 2. Fetch all bookings for this candidate and round in this drive
    bookings = (
        db.query(models.Booking)
        .filter(
            models.Booking.drive_id == drive_id,
            models.Booking.candidate_id == candidate_id,
            models.Booking.round_number == round_number,
            models.Booking.status == models.BookingStatus.CONFIRMED,
        )
        .all()
    )

    if not bookings:
        # No bookings found
        prog = (
            db.query(models.CandidateRoundProgress)
            .filter(
                models.CandidateRoundProgress.drive_id == drive_id,
                models.CandidateRoundProgress.candidate_id == candidate_id,
                models.CandidateRoundProgress.round_number == round_number,
            )
            .first()
        )
        if not prog:
            prog = models.CandidateRoundProgress(
                drive_id=drive_id,
                candidate_id=candidate_id,
                round_number=round_number,
                status=models.CandidateProgressionStatus.ABSENT,
            )
            db.add(prog)
            db.flush()
        return prog

    # 3. Gather evaluations
    booking_ids = [b.id for b in bookings]
    evals = (
        db.query(models.Evaluation)
        .filter(
            models.Evaluation.booking_id.in_(booking_ids),
            models.Evaluation.status == models.EvaluationStatus.SUBMITTED,
        )
        .all()
    )

    prog = (
        db.query(models.CandidateRoundProgress)
        .filter(
            models.CandidateRoundProgress.drive_id == drive_id,
            models.CandidateRoundProgress.candidate_id == candidate_id,
            models.CandidateRoundProgress.round_number == round_number,
        )
        .first()
    )
    if not prog:
        prog = models.CandidateRoundProgress(
            drive_id=drive_id,
            candidate_id=candidate_id,
            round_number=round_number,
        )
        db.add(prog)

    if not evals:
        prog.status = models.CandidateProgressionStatus.PENDING
        prog.aggregate_score = None
        prog.notes = "Awaiting interviewer evaluation."
        db.flush()
        return prog

    # 4. Compute aggregate score across panelists
    total_pct = sum(e.total_score or 0 for e in evals)
    agg_score = int(total_pct / len(evals))
    prog.aggregate_score = agg_score

    # Check recommendations
    recommendations = [e.recommendation.lower() for e in evals if e.recommendation]
    has_hard_reject = any("reject" in r for r in recommendations)

    if agg_score >= min_passing and not has_hard_reject:
        prog.status = models.CandidateProgressionStatus.QUALIFIED
        prog.notes = f"Qualified Round {round_number} with aggregate score {agg_score}% (threshold: {min_passing}%)."
    else:
        prog.status = models.CandidateProgressionStatus.REJECTED
        prog.notes = f"Failed to qualify Round {round_number}: score {agg_score}% (threshold: {min_passing}%) or reject recommendation."

    db.flush()
    return prog
