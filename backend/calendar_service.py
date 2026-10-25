"""
Calendar Service for Slotify
Generates standard RFC 5545 .ics iCalendar invitations for confirmed bookings.
"""

from datetime import datetime, timezone
import uuid
import icalendar

from icalendar import Calendar, Event, vCalAddress, vText

import models
from scheduler_engine import _ensure_utc


def generate_booking_ics(booking: models.Booking) -> bytes:
    cal = Calendar()
    cal.add("prodid", "-//Slotify Automated Interview Scheduling Engine//slotify.edu//EN")
    cal.add("version", "2.0")
    cal.add("calscale", "GREGORIAN")
    cal.add("method", "REQUEST")

    event = Event()
    drive_title = booking.drive.title if booking.drive else "Recruitment Drive"
    summary = f"Slotify Interview: {drive_title} (Round {booking.round_number})"
    event.add("summary", summary)

    start_utc = _ensure_utc(booking.start_time)
    end_utc = _ensure_utc(booking.end_time)
    event.add("dtstart", start_utc)
    event.add("dtend", end_utc)
    event.add("dtstamp", datetime.now(timezone.utc))


    uid = f"slotify-booking-{booking.id}@slotify.edu"
    event.add("uid", uid)

    room_name = booking.room.name if booking.room else "Virtual Cabin / TBD"
    event.add("location", room_name)

    candidate_name = booking.candidate.profile.name if booking.candidate and booking.candidate.profile else "Candidate"
    interviewer_name = booking.interviewer.profile.name if booking.interviewer and booking.interviewer.profile else "Interviewer"

    description = (
        f"Interview Details:\n"
        f"Drive: {drive_title}\n"
        f"Round: {booking.round_number}\n"
        f"Candidate: {candidate_name}\n"
        f"Interviewer: {interviewer_name}\n"
        f"Room / Location: {room_name}\n"
        f"Status: {booking.status.value.upper()}\n\n"
        f"Instructions:\n"
        f"- Please join or arrive 5 minutes prior to the start time.\n"
        f"- Keep your student ID or credentials available."
    )
    event.add("description", description)
    event.add("status", "CONFIRMED" if booking.status == models.BookingStatus.CONFIRMED else "CANCELLED")

    cal.add_component(event)
    return cal.to_ical()
