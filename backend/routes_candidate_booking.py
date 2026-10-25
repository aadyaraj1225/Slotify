"""
Booking and Candidate Coordination Routes
Provides authenticated endpoints for:
- Available slot discovery for eligible candidates
- Atomic, concurrency-safe candidate self-booking
- Viewing my bookings & specific booking details
- Authorized booking cancellation
- Calendar (.ics) invitation download
- In-app notification management
"""

from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Response, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from database import get_db
import models
from auth import require_candidate, require_any_authenticated
from schemas import (
    AvailableSlotRead,
    CandidateBookingRequest,
    BookingRead,
    NotificationRead,
    NotificationUpdate,
)
from scheduler_engine import _ensure_utc, _intervals_overlap, _is_within_availabilities
from calendar_service import generate_booking_ics
from notification_service import create_in_app_notification

router = APIRouter(tags=["Candidate Self-Booking & Coordination"])


def _populate_booking_read(b: models.Booking) -> BookingRead:
    return BookingRead(
        id=b.id,
        drive_id=b.drive_id,
        candidate_id=b.candidate_id,
        interviewer_id=b.interviewer_id,
        room_id=b.room_id,
        round_number=b.round_number,
        start_time=b.start_time,
        end_time=b.end_time,
        status=b.status,
        created_at=b.created_at,
        updated_at=b.updated_at,
        candidate_name=b.candidate.profile.name if b.candidate and b.candidate.profile else "Candidate",
        interviewer_name=b.interviewer.profile.name if b.interviewer and b.interviewer.profile else "Interviewer",
        room_name=b.room.name if b.room else "Virtual Cabin",
        drive_title=b.drive.title if b.drive else "Recruitment Drive",
    )


# -------------------------------------------------------------
# 1. Available Slots Discovery
# -------------------------------------------------------------

@router.get("/candidate/available-slots", response_model=List[AvailableSlotRead])
def get_available_slots(
    drive_id: Optional[str] = None,
    round_number: int = 1,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_candidate),
):
    """
    Returns interview slots that the authenticated candidate is eligible to book.
    Ensures slots do not conflict with the candidate's existing confirmed bookings or stated availability.
    """
    candidate = db.query(models.Candidate).filter(models.Candidate.profile_id == current_user.id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile record not found for authenticated user.",
        )

    # Drives filter
    drive_query = db.query(models.RecruitmentDrive).filter(models.RecruitmentDrive.status == models.DriveStatus.ACTIVE)
    if drive_id:
        drive_query = drive_query.filter(models.RecruitmentDrive.id == drive_id)
    active_drives = drive_query.all()

    if not active_drives:
        return []

    # Get candidate's personal availability windows (if specified)
    cand_avails = (
        db.query(models.Availability)
        .filter(
            models.Availability.profile_id == current_user.id,
            models.Availability.status == models.AvailabilityStatus.AVAILABLE,
        )
        .all()
    )
    cand_windows = [
        (a.start_time if a.start_time.tzinfo else _ensure_utc(a.start_time),
         a.end_time if a.end_time.tzinfo else _ensure_utc(a.end_time))
        for a in cand_avails
    ]

    # Get candidate's existing confirmed bookings
    cand_existing_bookings = (
        db.query(models.Booking)
        .filter(
            models.Booking.candidate_id == candidate.id,
            models.Booking.status == models.BookingStatus.CONFIRMED,
        )
        .all()
    )

    # Get active interviewers and their availabilities
    interviewers = db.query(models.Interviewer).all()
    all_rooms = db.query(models.Room).all()

    slots: List[AvailableSlotRead] = []

    for drive in active_drives:
        # Check if candidate already has a confirmed booking for this drive and round
        already_booked = any(
            b.drive_id == drive.id and b.round_number == round_number
            for b in cand_existing_bookings
        )
        if already_booked:
            continue

        for intr in interviewers:
            intr_avails = (
                db.query(models.Availability)
                .filter(
                    models.Availability.profile_id == intr.profile_id,
                    models.Availability.status == models.AvailabilityStatus.AVAILABLE,
                )
                .all()
            )

            # Check interviewer current workload
            intr_booking_count = (
                db.query(models.Booking)
                .filter(
                    models.Booking.interviewer_id == intr.id,
                    models.Booking.status == models.BookingStatus.CONFIRMED,
                )
                .count()
            )
            if intr_booking_count >= intr.workload_limit:
                continue

            for ia in intr_avails:
                ia_start = _ensure_utc(ia.start_time)
                ia_end = _ensure_utc(ia.end_time)

                # Check if candidate is available during this window (if candidate has specific windows)
                if cand_windows:
                    if not any(cw[0] <= ia_start and cw[1] >= ia_end for cw in cand_windows):
                        continue

                # Check if candidate has an existing booking collision
                cand_collision = any(
                    _intervals_overlap(ia_start, ia_end, _ensure_utc(b.start_time), _ensure_utc(b.end_time))
                    for b in cand_existing_bookings
                )
                if cand_collision:
                    continue

                # Check if interviewer has an existing booking collision
                intr_collision = (
                    db.query(models.Booking)
                    .filter(
                        models.Booking.interviewer_id == intr.id,
                        models.Booking.status == models.BookingStatus.CONFIRMED,
                        models.Booking.end_time > ia_start,
                        models.Booking.start_time < ia_end,
                    )
                    .first()
                )
                if intr_collision:
                    continue

                # Find an unreserved room
                matched_room = None
                for rm in all_rooms:
                    rm_collision = (
                        db.query(models.Booking)
                        .filter(
                            models.Booking.room_id == rm.id,
                            models.Booking.status == models.BookingStatus.CONFIRMED,
                            models.Booking.end_time > ia_start,
                            models.Booking.start_time < ia_end,
                        )
                        .first()
                    )
                    if not rm_collision:
                        matched_room = rm
                        break

                slot_id = f"slot-{drive.id[:8]}-{intr.id[:8]}-{int(ia_start.timestamp())}"
                duration = int((ia_end - ia_start).total_seconds() / 60)

                slots.append(
                    AvailableSlotRead(
                        id=slot_id,
                        drive_id=drive.id,
                        drive_title=drive.title,
                        round_number=round_number,
                        round_name=f"Round {round_number}",
                        interviewer_id=intr.id,
                        interviewer_name=intr.profile.name if intr.profile else "Interviewer",
                        room_id=matched_room.id if matched_room else None,
                        room_name=matched_room.name if matched_room else "Virtual Cabin",
                        start_time=ia_start,
                        end_time=ia_end,
                        duration_minutes=duration,
                    )
                )

    return slots


# -------------------------------------------------------------
# 2. Concurrency-Safe Candidate Booking Creation
# -------------------------------------------------------------

@router.post("/bookings", response_model=BookingRead)
def create_booking(
    payload: CandidateBookingRequest,
    response: Response,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_candidate),
):
    """
    Secure, transactional booking confirmation by an eligible candidate.
    Uses database row locks / conflict re-checking to prevent double-booking.
    """
    candidate = db.query(models.Candidate).filter(models.Candidate.profile_id == current_user.id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile record not found.",
        )

    # 1. Verify Drive
    drive = db.query(models.RecruitmentDrive).filter(models.RecruitmentDrive.id == payload.drive_id).first()
    if not drive:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recruitment drive not found.")
    if drive.status != models.DriveStatus.ACTIVE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Recruitment drive is not currently active.")

    # 2. Verify Interviewer
    interviewer = db.query(models.Interviewer).filter(models.Interviewer.id == payload.interviewer_id).first()
    if not interviewer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interviewer not found.")

    start_utc = _ensure_utc(payload.start_time)
    end_utc = _ensure_utc(payload.end_time)

    # Idempotency check: if candidate already submitted this exact booking, return existing confirmed record with 200 OK
    existing_dup = (
        db.query(models.Booking)
        .filter(
            models.Booking.candidate_id == candidate.id,
            models.Booking.drive_id == payload.drive_id,
            models.Booking.round_number == payload.round_number,
            models.Booking.status == models.BookingStatus.CONFIRMED,
            models.Booking.start_time == start_utc,
            models.Booking.end_time == end_utc,
        )
        .first()
    )
    if existing_dup:
        response.status_code = status.HTTP_200_OK
        return _populate_booking_read(existing_dup)


    # 3. Conflict re-check within transaction: Candidate collision
    cand_conflict = (
        db.query(models.Booking)
        .filter(
            models.Booking.candidate_id == candidate.id,
            models.Booking.status == models.BookingStatus.CONFIRMED,
            models.Booking.end_time > start_utc,
            models.Booking.start_time < end_utc,
        )
        .first()
    )
    if cand_conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have an active interview booked during this overlapping time interval.",
        )

    # 4. Conflict re-check: Interviewer collision
    intr_conflict = (
        db.query(models.Booking)
        .filter(
            models.Booking.interviewer_id == payload.interviewer_id,
            models.Booking.status == models.BookingStatus.CONFIRMED,
            models.Booking.end_time > start_utc,
            models.Booking.start_time < end_utc,
        )
        .first()
    )
    if intr_conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This slot was just claimed by another candidate or conflicts with the interviewer schedule. Please select another slot.",
        )

    # 5. Conflict re-check: Room collision (if room specified)
    if payload.room_id:
        room_conflict = (
            db.query(models.Booking)
            .filter(
                models.Booking.room_id == payload.room_id,
                models.Booking.status == models.BookingStatus.CONFIRMED,
                models.Booking.end_time > start_utc,
                models.Booking.start_time < end_utc,
            )
            .first()
        )
        if room_conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="The designated interview cabin has an overlapping booking. Please pick another opening.",
            )

    # 6. Check Interviewer Workload Limit
    current_load = (
        db.query(models.Booking)
        .filter(
            models.Booking.interviewer_id == payload.interviewer_id,
            models.Booking.status == models.BookingStatus.CONFIRMED,
        )
        .count()
    )
    if current_load >= interviewer.workload_limit:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Interviewer daily workload quota has been reached. Please choose an alternate slot.",
        )

    # 7. Atomic write
    try:
        booking = models.Booking(
            drive_id=payload.drive_id,
            candidate_id=candidate.id,
            interviewer_id=payload.interviewer_id,
            room_id=payload.room_id,
            round_number=payload.round_number,
            start_time=start_utc,
            end_time=end_utc,
            status=models.BookingStatus.CONFIRMED,
        )
        db.add(booking)
        db.flush()

        # Generate in-app notifications
        # To Candidate
        create_in_app_notification(
            db=db,
            recipient_profile_id=current_user.id,
            title="Interview Slot Confirmed",
            message=f"Your interview for {drive.title} (Round {booking.round_number}) on {start_utc.strftime('%Y-%m-%d %H:%M UTC')} is confirmed.",
            notification_type=models.NotificationType.BOOKING_CONFIRMED,
            booking_id=booking.id,
        )
        # To Interviewer
        if interviewer.profile_id:
            create_in_app_notification(
                db=db,
                recipient_profile_id=interviewer.profile_id,
                title="New Interview Assigned",
                message=f"A candidate confirmed an interview for {drive.title} (Round {booking.round_number}) on {start_utc.strftime('%Y-%m-%d %H:%M UTC')}.",
                notification_type=models.NotificationType.BOOKING_CONFIRMED,
                booking_id=booking.id,
            )

        db.commit()
        db.refresh(booking)
        response.status_code = status.HTTP_201_CREATED
        return _populate_booking_read(booking)


    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during booking confirmation: {str(e)}",
        )


# -------------------------------------------------------------
# 3. Retrieve Candidate Bookings & Specific Booking
# -------------------------------------------------------------

@router.get("/bookings/my", response_model=List[BookingRead])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_any_authenticated),
):
    """
    Returns the authenticated user's confirmed or historical bookings.
    Candidates view their candidate bookings; Interviewers view their evaluations.
    """
    if current_user.role == models.UserRole.CANDIDATE:
        cand = db.query(models.Candidate).filter(models.Candidate.profile_id == current_user.id).first()
        if not cand:
            return []
        bookings = (
            db.query(models.Booking)
            .filter(models.Booking.candidate_id == cand.id)
            .order_by(models.Booking.start_time.asc())
            .all()
        )
    elif current_user.role == models.UserRole.INTERVIEWER:
        intr = db.query(models.Interviewer).filter(models.Interviewer.profile_id == current_user.id).first()
        if not intr:
            return []
        bookings = (
            db.query(models.Booking)
            .filter(models.Booking.interviewer_id == intr.id)
            .order_by(models.Booking.start_time.asc())
            .all()
        )
    else:  # Coordinator
        bookings = db.query(models.Booking).order_by(models.Booking.start_time.asc()).limit(100).all()

    return [_populate_booking_read(b) for b in bookings]


@router.get("/bookings/{booking_id}", response_model=BookingRead)
def get_booking_details(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_any_authenticated),
):
    """
    Get booking details. Restricted to the booking's candidate, interviewer, or coordinators.
    """
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    # Authorization verification
    is_owner_candidate = booking.candidate and booking.candidate.profile_id == current_user.id
    is_owner_interviewer = booking.interviewer and booking.interviewer.profile_id == current_user.id
    is_coordinator = current_user.role == models.UserRole.COORDINATOR

    if not (is_owner_candidate or is_owner_interviewer or is_coordinator):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this booking.",
        )

    return _populate_booking_read(booking)


# -------------------------------------------------------------
# 4. Cancellation Flow
# -------------------------------------------------------------

@router.post("/bookings/{booking_id}/cancel", response_model=BookingRead)
def cancel_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_any_authenticated),
):
    """
    Safely releases an interview booking.
    Permitted transitions: CONFIRMED -> CANCELLED.
    """
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    is_owner_candidate = booking.candidate and booking.candidate.profile_id == current_user.id
    is_owner_interviewer = booking.interviewer and booking.interviewer.profile_id == current_user.id
    is_coordinator = current_user.role == models.UserRole.COORDINATOR

    if not (is_owner_candidate or is_owner_interviewer or is_coordinator):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to cancel this booking.",
        )

    if booking.status == models.BookingStatus.CANCELLED:
        # Already cancelled
        return _populate_booking_read(booking)

    booking.status = models.BookingStatus.CANCELLED

    # Create notifications
    if booking.candidate and booking.candidate.profile_id:
        create_in_app_notification(
            db=db,
            recipient_profile_id=booking.candidate.profile_id,
            title="Interview Slot Cancelled",
            message=f"Your booking for Round {booking.round_number} has been cancelled. You may re-book an available slot.",
            notification_type=models.NotificationType.BOOKING_CANCELLED,
            booking_id=booking.id,
        )

    if booking.interviewer and booking.interviewer.profile_id:
        create_in_app_notification(
            db=db,
            recipient_profile_id=booking.interviewer.profile_id,
            title="Interview Slot Released",
            message=f"Interview booking for Round {booking.round_number} was cancelled and the slot has been freed.",
            notification_type=models.NotificationType.BOOKING_CANCELLED,
            booking_id=booking.id,
        )

    db.commit()
    db.refresh(booking)
    return _populate_booking_read(booking)


# -------------------------------------------------------------
# 5. Calendar Invitation (.ics) Download
# -------------------------------------------------------------

@router.get("/bookings/{booking_id}/calendar", response_class=Response)
def download_calendar_invite(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_any_authenticated),
):
    """
    Generates and returns an RFC 5545 .ics calendar invitation file for the booking.
    """
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    is_owner_candidate = booking.candidate and booking.candidate.profile_id == current_user.id
    is_owner_interviewer = booking.interviewer and booking.interviewer.profile_id == current_user.id
    is_coordinator = current_user.role == models.UserRole.COORDINATOR

    if not (is_owner_candidate or is_owner_interviewer or is_coordinator):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to download this calendar invitation.",
        )

    ics_bytes = generate_booking_ics(booking)
    filename = f"interview-{booking.id[:8]}.ics"

    return Response(
        content=ics_bytes,
        media_type="text/calendar; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# -------------------------------------------------------------
# 6. In-App Notifications API
# -------------------------------------------------------------

@router.get("/notifications", response_model=List[NotificationRead])
def list_my_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_any_authenticated),
):
    """
    Returns in-app notifications for the authenticated user only.
    """
    return (
        db.query(models.Notification)
        .filter(models.Notification.recipient_profile_id == current_user.id)
        .order_by(models.Notification.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.patch("/notifications/{notification_id}/read", response_model=NotificationRead)
def mark_notification_as_read(
    notification_id: str,
    payload: NotificationUpdate,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_any_authenticated),
):
    """
    Updates the read status of a notification belonging to the current user.
    """
    notif = (
        db.query(models.Notification)
        .filter(
            models.Notification.id == notification_id,
            models.Notification.recipient_profile_id == current_user.id,
        )
        .first()
    )
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")

    notif.is_read = payload.is_read
    db.commit()
    db.refresh(notif)
    return notif
