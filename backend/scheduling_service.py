"""
Scheduling Service layer
Orchestrates DB retrieval, solver invocation, transaction handling, and schedule storage.
"""

from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_

import models
from scheduling_schemas import (
    ScheduleRequest,
    ScheduleResult,
    CandidateInput,
    InterviewerInput,
    RoomInput,
    ExistingBookingInput,
    TimeWindow,
    SolverStatus,
)
from scheduler_engine import InterviewScheduler, _ensure_utc
from scheduling_validator import validate_schedule_invariants


def generate_and_save_schedule(
    db: Session,
    request: ScheduleRequest,
) -> ScheduleResult:
    # 1. Verify Drive exists
    drive = db.query(models.RecruitmentDrive).filter(models.RecruitmentDrive.id == request.drive_id).first()
    if not drive:
        return ScheduleResult(
            status=SolverStatus.ERROR,
            success=False,
            drive_id=request.drive_id,
            round_number=request.round_requirement.round_number,
            total_requested=0,
            scheduled_count=0,
            unassigned_count=0,
            diagnostics=[f"Recruitment drive '{request.drive_id}' not found."],
        )

    # 2. Query Candidates
    cand_query = db.query(models.Candidate)
    if request.candidate_ids:
        cand_query = cand_query.filter(models.Candidate.id.in_(request.candidate_ids))
    db_candidates = cand_query.all()

    if not db_candidates:
        return ScheduleResult(
            status=SolverStatus.ERROR,
            success=False,
            drive_id=request.drive_id,
            round_number=request.round_requirement.round_number,
            total_requested=0,
            scheduled_count=0,
            unassigned_count=0,
            diagnostics=["No eligible candidates found for scheduling."],
        )

    # 3. Query Interviewers
    intr_query = db.query(models.Interviewer)
    if request.interviewer_ids:
        intr_query = intr_query.filter(models.Interviewer.id.in_(request.interviewer_ids))
    db_interviewers = intr_query.all()

    if not db_interviewers:
        return ScheduleResult(
            status=SolverStatus.ERROR,
            success=False,
            drive_id=request.drive_id,
            round_number=request.round_requirement.round_number,
            total_requested=len(db_candidates),
            scheduled_count=0,
            unassigned_count=len(db_candidates),
            diagnostics=["No interviewers available in the system."],
        )

    # 4. Query Rooms
    room_query = db.query(models.Room)
    if request.room_ids:
        room_query = room_query.filter(models.Room.id.in_(request.room_ids))
    db_rooms = room_query.all()

    if not db_rooms:
        return ScheduleResult(
            status=SolverStatus.ERROR,
            success=False,
            drive_id=request.drive_id,
            round_number=request.round_requirement.round_number,
            total_requested=len(db_candidates),
            scheduled_count=0,
            unassigned_count=len(db_candidates),
            diagnostics=["No rooms available for scheduling."],
        )

    # 5. Load profile availabilities
    all_profile_ids = [c.profile_id for c in db_candidates] + [i.profile_id for i in db_interviewers]
    avail_records = (
        db.query(models.Availability)
        .filter(
            models.Availability.profile_id.in_(all_profile_ids),
            models.Availability.status == models.AvailabilityStatus.AVAILABLE,
        )
        .all()
    )

    profile_avail_map = {}
    for a in avail_records:
        profile_avail_map.setdefault(a.profile_id, []).append(
            TimeWindow(start_time=_ensure_utc(a.start_time), end_time=_ensure_utc(a.end_time))
        )

    # 6. Map to solver inputs
    candidates_input = [
        CandidateInput(
            id=c.id,
            name=c.profile.name if c.profile else f"Candidate {c.id[:8]}",
            email=c.profile.email if c.profile else None,
            availabilities=profile_avail_map.get(c.profile_id, []),
        )
        for c in db_candidates
    ]

    interviewers_input = [
        InterviewerInput(
            id=i.id,
            name=i.profile.name if i.profile else f"Interviewer {i.id[:8]}",
            email=i.profile.email if i.profile else None,
            skills=i.skills if isinstance(i.skills, list) else [],
            workload_limit=i.workload_limit or 5,
            availabilities=profile_avail_map.get(i.profile_id, []),
        )
        for i in db_interviewers
    ]

    rooms_input = [
        RoomInput(
            id=r.id,
            name=r.name,
            capacity=r.capacity,
            availabilities=[],  # Room available across entire window unless occupied by existing booking
        )
        for r in db_rooms
    ]

    # 7. Load existing confirmed bookings that may overlap with this window
    start_utc = _ensure_utc(request.window.start_time)
    end_utc = _ensure_utc(request.window.end_time)

    existing_db_bookings = (
        db.query(models.Booking)
        .filter(
            models.Booking.status == models.BookingStatus.CONFIRMED,
            models.Booking.end_time > start_utc,
            models.Booking.start_time < end_utc,
        )
        .all()
    )

    existing_bookings_input = [
        ExistingBookingInput(
            id=b.id,
            candidate_id=b.candidate_id,
            interviewer_id=b.interviewer_id,
            room_id=b.room_id,
            start_time=_ensure_utc(b.start_time),
            end_time=_ensure_utc(b.end_time),
        )
        for b in existing_db_bookings
    ]

    # 8. Run Solver
    scheduler = InterviewScheduler(
        drive_id=request.drive_id,
        candidates=candidates_input,
        interviewers=interviewers_input,
        rooms=rooms_input,
        existing_bookings=existing_bookings_input,
        round_requirement=request.round_requirement,
        drive_window=request.window,
        max_time_seconds=request.max_solver_time_seconds,
        allow_partial=request.allow_partial_generation,
    )

    result = scheduler.solve()

    if not result.success:
        return result

    # 9. Independent Invariant Verification
    is_valid, violations = validate_schedule_invariants(
        assignments=result.assignments,
        candidates=candidates_input,
        interviewers=interviewers_input,
        rooms=rooms_input,
        existing_bookings=existing_bookings_input,
        required_skills=request.round_requirement.required_skills,
    )

    if not is_valid:
        return ScheduleResult(
            status=SolverStatus.ERROR,
            success=False,
            drive_id=request.drive_id,
            round_number=request.round_requirement.round_number,
            total_requested=len(candidates_input),
            scheduled_count=0,
            unassigned_count=len(candidates_input),
            diagnostics=[f"Soundness violation during independent schedule validation: {v}" for v in violations],
            solver_time_ms=result.solver_time_ms,
        )

    # 10. Transactional persistence
    try:
        # Atomic commit
        new_bookings = []
        for a in result.assignments:
            booking = models.Booking(
                drive_id=request.drive_id,
                candidate_id=a.candidate_id,
                interviewer_id=a.interviewer_id,
                room_id=a.room_id,
                round_number=a.round_number,
                start_time=_ensure_utc(a.start_time),
                end_time=_ensure_utc(a.end_time),
                status=models.BookingStatus.CONFIRMED,
            )
            db.add(booking)
            new_bookings.append(booking)

        db.commit()
        for b in new_bookings:
            db.refresh(b)

    except Exception as e:
        db.rollback()
        return ScheduleResult(
            status=SolverStatus.ERROR,
            success=False,
            drive_id=request.drive_id,
            round_number=request.round_requirement.round_number,
            total_requested=len(candidates_input),
            scheduled_count=0,
            unassigned_count=len(candidates_input),
            diagnostics=[f"Database transaction failure during schedule commit: {str(e)}"],
            solver_time_ms=result.solver_time_ms,
        )

    return result
