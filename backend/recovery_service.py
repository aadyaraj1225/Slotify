"""
Schedule Recovery Service (Phase 8)
Detects affected bookings for disruptions (interviewer/room/candidate unavailability, conflicts).
Invokes OR-Tools constraint solver to find minimal replacement changes while preserving
unaffected confirmed bookings and never altering completed/evaluated sessions.
Provides preview generation and atomic, concurrency-safe application with notifications.
"""

from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

import models
from scheduler_engine import InterviewScheduler, _ensure_utc, _intervals_overlap, _is_within_availabilities
from scheduling_schemas import (
    CandidateInput,
    InterviewerInput,
    RoomInput,
    ExistingBookingInput,
    RoundRequirement,
    TimeWindow,
    SolverStatus,
)
from scheduling_validator import validate_schedule_invariants
from notification_service import create_in_app_notification
from schemas import DisruptionInput, ProposedAssignmentChange


def generate_recovery_preview(
    db: Session,
    drive_id: str,
    disruption: DisruptionInput,
    initiated_by_profile_id: Optional[str] = None,
) -> Tuple[models.ScheduleRecovery, List[ProposedAssignmentChange]]:
    """
    Identifies affected bookings and solves for replacement assignments.
    Does NOT modify the live schedule; records a PROPOSED recovery audit record.
    """
    drive = db.query(models.RecruitmentDrive).filter(models.RecruitmentDrive.id == drive_id).first()
    if not drive:
        raise ValueError(f"Recruitment drive '{drive_id}' not found.")

    # 1. Identify affected confirmed bookings (exclude completed or already evaluated)
    query = (
        db.query(models.Booking)
        .filter(
            models.Booking.drive_id == drive_id,
            models.Booking.status == models.BookingStatus.CONFIRMED,
        )
    )

    if disruption.disruption_type == models.DisruptionType.INTERVIEWER_UNAVAILABLE:
        if not disruption.unavailable_interviewer_id:
            raise ValueError("unavailable_interviewer_id is required for interviewer_unavailable disruption.")
        query = query.filter(models.Booking.interviewer_id == disruption.unavailable_interviewer_id)

    elif disruption.disruption_type == models.DisruptionType.ROOM_UNAVAILABLE:
        if not disruption.unavailable_room_id:
            raise ValueError("unavailable_room_id is required for room_unavailable disruption.")
        query = query.filter(models.Booking.room_id == disruption.unavailable_room_id)

    elif disruption.disruption_type == models.DisruptionType.CANDIDATE_UNAVAILABLE:
        if not disruption.unavailable_candidate_id:
            raise ValueError("unavailable_candidate_id is required for candidate_unavailable disruption.")
        query = query.filter(models.Booking.candidate_id == disruption.unavailable_candidate_id)

    if disruption.start_time and disruption.end_time:
        s_utc = _ensure_utc(disruption.start_time)
        e_utc = _ensure_utc(disruption.end_time)
        query = query.filter(models.Booking.end_time > s_utc, models.Booking.start_time < e_utc)

    candidate_affected = query.all()

    # Filter out completed interviews or finalized evaluations
    affected_bookings: List[models.Booking] = []
    for b in candidate_affected:
        if b.evaluation and b.evaluation.status == models.EvaluationStatus.SUBMITTED:
            continue  # Finalized evaluation cannot be disrupted
        affected_bookings.append(b)

    if not affected_bookings:
        # No bookings disrupted
        recovery = models.ScheduleRecovery(
            drive_id=drive_id,
            initiated_by_profile_id=initiated_by_profile_id,
            disruption_type=disruption.disruption_type,
            status=models.RecoveryStatus.PROPOSED,
            affected_booking_ids=[],
            original_assignments=[],
            proposed_assignments=[],
            diagnostics=["No active confirmed bookings were impacted by the reported disruption."],
        )
        db.add(recovery)
        db.commit()
        db.refresh(recovery)
        return recovery, []

    # 2. Collect unaffected confirmed bookings that must be preserved
    affected_ids = set(b.id for b in affected_bookings)
    unaffected_bookings = (
        db.query(models.Booking)
        .filter(
            models.Booking.status == models.BookingStatus.CONFIRMED,
            models.Booking.id.notin_(affected_ids),
        )
        .all()
    )

    existing_inputs = [
        ExistingBookingInput(
            id=b.id,
            candidate_id=b.candidate_id,
            interviewer_id=b.interviewer_id,
            room_id=b.room_id,
            start_time=_ensure_utc(b.start_time),
            end_time=_ensure_utc(b.end_time),
        )
        for b in unaffected_bookings
    ]

    # 3. Available resources excluding the disrupted resource
    all_interviewers = db.query(models.Interviewer).all()
    if disruption.disruption_type == models.DisruptionType.INTERVIEWER_UNAVAILABLE:
        available_interviewers = [i for i in all_interviewers if i.id != disruption.unavailable_interviewer_id]
    else:
        available_interviewers = all_interviewers

    all_rooms = db.query(models.Room).all()
    if disruption.disruption_type == models.DisruptionType.ROOM_UNAVAILABLE:
        available_rooms = [r for r in all_rooms if r.id != disruption.unavailable_room_id]
    else:
        available_rooms = all_rooms

    # Fetch availabilities
    all_profile_ids = [i.profile_id for i in available_interviewers] + [b.candidate.profile_id for b in affected_bookings]
    avail_records = (
        db.query(models.Availability)
        .filter(
            models.Availability.profile_id.in_(all_profile_ids),
            models.Availability.status == models.AvailabilityStatus.AVAILABLE,
        )
        .all()
    )
    profile_avail_map: Dict[str, List[TimeWindow]] = {}
    for a in avail_records:
        profile_avail_map.setdefault(a.profile_id, []).append(
            TimeWindow(start_time=_ensure_utc(a.start_time), end_time=_ensure_utc(a.end_time))
        )

    # 4. Determine overall time window for recovery
    min_start = min(_ensure_utc(b.start_time) for b in affected_bookings)
    max_end = max(_ensure_utc(b.end_time) for b in affected_bookings)
    recovery_window = TimeWindow(start_time=min_start, end_time=max(max_end, min_start + timedelta(hours=4)))

    # Convert candidates needing reassignment
    candidates_input = [
        CandidateInput(
            id=b.candidate_id,
            name=b.candidate.profile.name if b.candidate and b.candidate.profile else f"Candidate {b.candidate_id[:8]}",
            email=b.candidate.profile.email if b.candidate and b.candidate.profile else None,
            availabilities=profile_avail_map.get(b.candidate.profile_id, []),
        )
        for b in affected_bookings
    ]

    interviewers_input = [
        InterviewerInput(
            id=i.id,
            name=i.profile.name if i.profile else f"Interviewer {i.id[:8]}",
            skills=i.skills if isinstance(i.skills, list) else [],
            workload_limit=i.workload_limit or 5,
            availabilities=profile_avail_map.get(i.profile_id, []),
        )
        for i in available_interviewers
    ]

    rooms_input = [
        RoomInput(id=r.id, name=r.name, capacity=r.capacity)
        for r in available_rooms
    ]

    # Assume first affected round requirement
    sample_b = affected_bookings[0]
    duration_minutes = int((sample_b.end_time - sample_b.start_time).total_seconds() / 60)
    req = RoundRequirement(
        round_number=sample_b.round_number,
        duration_minutes=duration_minutes or 60,
        slot_granularity_minutes=30,
        required_skills=[],
        panel_size=1,
    )

    # 5. Run OR-Tools Solver in recovery mode
    scheduler = InterviewScheduler(
        drive_id=drive_id,
        candidates=candidates_input,
        interviewers=interviewers_input,
        rooms=rooms_input,
        existing_bookings=existing_inputs,
        round_requirement=req,
        drive_window=recovery_window,
        max_time_seconds=10.0,
        allow_partial=False,
    )

    result = scheduler.solve()

    original_snapshots = []
    for b in affected_bookings:
        original_snapshots.append({
            "booking_id": b.id,
            "candidate_id": b.candidate_id,
            "candidate_name": b.candidate.profile.name if b.candidate and b.candidate.profile else "Candidate",
            "interviewer_id": b.interviewer_id,
            "interviewer_name": b.interviewer.profile.name if b.interviewer and b.interviewer.profile else "Interviewer",
            "room_id": b.room_id,
            "room_name": b.room.name if b.room else "Virtual Cabin",
            "start_time": _ensure_utc(b.start_time).isoformat(),
            "end_time": _ensure_utc(b.end_time).isoformat(),
        })

    proposed_changes: List[ProposedAssignmentChange] = []
    proposed_snapshots = []

    if result.success and len(result.assignments) == len(affected_bookings):
        status_enum = models.RecoveryStatus.PROPOSED
        # Map assignments back to bookings
        for orig in original_snapshots:
            match = next((a for a in result.assignments if a.candidate_id == orig["candidate_id"]), None)
            if match:
                chg = ProposedAssignmentChange(
                    booking_id=orig["booking_id"],
                    candidate_id=orig["candidate_id"],
                    candidate_name=orig["candidate_name"],
                    original_interviewer_id=orig["interviewer_id"],
                    original_interviewer_name=orig["interviewer_name"],
                    proposed_interviewer_id=match.interviewer_id,
                    proposed_interviewer_name=match.interviewer_name,
                    original_room_id=orig["room_id"],
                    original_room_name=orig["room_name"],
                    proposed_room_id=match.room_id,
                    proposed_room_name=match.room_name,
                    original_start_time=datetime.fromisoformat(orig["start_time"]),
                    original_end_time=datetime.fromisoformat(orig["end_time"]),
                    proposed_start_time=match.start_time,
                    proposed_end_time=match.end_time,
                    change_reason=disruption.reason or f"Disruption recovery: {disruption.disruption_type.value}",
                )
                proposed_changes.append(chg)
                proposed_snapshots.append(chg.model_dump(mode="json"))
    else:
        status_enum = models.RecoveryStatus.INFEASIBLE

    # 6. Store Recovery Audit Record
    recovery = models.ScheduleRecovery(
        drive_id=drive_id,
        initiated_by_profile_id=initiated_by_profile_id,
        disruption_type=disruption.disruption_type,
        status=status_enum,
        affected_booking_ids=[b.id for b in affected_bookings],
        original_assignments=original_snapshots,
        proposed_assignments=proposed_snapshots,
        diagnostics=result.diagnostics if not result.success else ["Feasible replacement schedule verified."],
    )
    db.add(recovery)
    db.commit()
    db.refresh(recovery)

    return recovery, proposed_changes


def apply_schedule_recovery(
    db: Session,
    recovery_id: str,
    approver_profile_id: str,
) -> Tuple[bool, str, int]:
    """
    Atomically applies an approved recovery plan.
    Re-validates all proposed assignments to prevent concurrent booking race conditions,
    updates bookings, generates in-app notifications, and sets status to APPLIED.
    """
    recovery = db.query(models.ScheduleRecovery).filter(models.ScheduleRecovery.id == recovery_id).first()
    if not recovery:
        return False, "Recovery record not found.", 0

    if recovery.status == models.RecoveryStatus.APPLIED:
        return True, "Recovery plan was already applied previously.", len(recovery.proposed_assignments)

    if recovery.status != models.RecoveryStatus.PROPOSED:
        return False, f"Cannot apply recovery plan with status '{recovery.status.value}'.", 0

    if not recovery.proposed_assignments:
        return False, "No valid replacement assignments exist in this recovery proposal.", 0

    # 1. Re-validate conflict invariants against live DB bookings immediately before write
    for prop in recovery.proposed_assignments:
        b_id = prop["booking_id"]
        p_start = _ensure_utc(datetime.fromisoformat(prop["proposed_start_time"]))
        p_end = _ensure_utc(datetime.fromisoformat(prop["proposed_end_time"]))
        p_intr = prop["proposed_interviewer_id"]
        p_room = prop.get("proposed_room_id")

        # Check interviewer conflict with other confirmed bookings
        intr_conflict = (
            db.query(models.Booking)
            .filter(
                models.Booking.id != b_id,
                models.Booking.interviewer_id == p_intr,
                models.Booking.status == models.BookingStatus.CONFIRMED,
                models.Booking.end_time > p_start,
                models.Booking.start_time < p_end,
            )
            .first()
        )
        if intr_conflict:
            recovery.status = models.RecoveryStatus.FAILED
            db.commit()
            return False, f"Interviewer conflict detected during live commit for interviewer {p_intr}.", 0

        # Check room conflict
        if p_room:
            room_conflict = (
                db.query(models.Booking)
                .filter(
                    models.Booking.id != b_id,
                    models.Booking.room_id == p_room,
                    models.Booking.status == models.BookingStatus.CONFIRMED,
                    models.Booking.end_time > p_start,
                    models.Booking.start_time < p_end,
                )
                .first()
            )
            if room_conflict:
                recovery.status = models.RecoveryStatus.FAILED
                db.commit()
                return False, f"Room conflict detected during live commit for room {p_room}.", 0

    # 2. Apply modifications transactionally
    try:
        applied_count = 0
        for prop in recovery.proposed_assignments:
            booking = db.query(models.Booking).filter(models.Booking.id == prop["booking_id"]).first()
            if not booking:
                continue

            booking.interviewer_id = prop["proposed_interviewer_id"]
            booking.room_id = prop.get("proposed_room_id")
            booking.start_time = _ensure_utc(datetime.fromisoformat(prop["proposed_start_time"]))
            booking.end_time = _ensure_utc(datetime.fromisoformat(prop["proposed_end_time"]))
            applied_count += 1

            # In-app notifications to candidate
            if booking.candidate and booking.candidate.profile_id:
                create_in_app_notification(
                    db=db,
                    recipient_profile_id=booking.candidate.profile_id,
                    title="Interview Rescheduled",
                    message=f"Your interview session for Round {booking.round_number} has been updated to {booking.start_time.strftime('%Y-%m-%d %H:%M UTC')} with {prop['proposed_interviewer_name']}.",
                    notification_type=models.NotificationType.BOOKING_CONFIRMED,
                    booking_id=booking.id,
                )

            # In-app notification to new interviewer
            new_intr = db.query(models.Interviewer).filter(models.Interviewer.id == booking.interviewer_id).first()
            if new_intr and new_intr.profile_id:
                create_in_app_notification(
                    db=db,
                    recipient_profile_id=new_intr.profile_id,
                    title="Reassigned Interview Replacement",
                    message=f"You have been assigned as a replacement interviewer on {booking.start_time.strftime('%Y-%m-%d %H:%M UTC')}.",
                    notification_type=models.NotificationType.BOOKING_CONFIRMED,
                    booking_id=booking.id,
                )

        recovery.status = models.RecoveryStatus.APPLIED
        recovery.applied_at = datetime.now(timezone.utc)
        db.commit()
        return True, "Schedule recovery plan successfully applied.", applied_count

    except Exception as e:
        db.rollback()
        recovery.status = models.RecoveryStatus.FAILED
        db.commit()
        return False, f"Transaction error while applying recovery plan: {str(e)}", 0
