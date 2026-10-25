"""
Independent Schedule Validator
Verifies that generated schedules do NOT violate any hard invariants, ensuring 100%
soundness before storing into the database.
"""

from typing import List, Tuple
from scheduling_schemas import ScheduledAssignment, ExistingBookingInput, InterviewerInput, RoomInput, CandidateInput, TimeWindow
from scheduler_engine import _intervals_overlap, _is_within_availabilities, _ensure_utc


def validate_schedule_invariants(
    assignments: List[ScheduledAssignment],
    candidates: List[CandidateInput],
    interviewers: List[InterviewerInput],
    rooms: List[RoomInput],
    existing_bookings: List[ExistingBookingInput],
    required_skills: List[str],
) -> Tuple[bool, List[str]]:
    violations: List[str] = []

    # Map lookups
    c_map = {c.id: c for c in candidates}
    i_map = {i.id: i for i in interviewers}
    r_map = {r.id: r for r in rooms}
    req_skills_lower = set(s.lower() for s in required_skills)

    # Invariant 1: Candidate uniqueness / no overlap in assignments
    for i, a1 in enumerate(assignments):
        s1 = _ensure_utc(a1.start_time)
        e1 = _ensure_utc(a1.end_time)

        if e1 <= s1:
            violations.append(f"Assignment for candidate {a1.candidate_id} has invalid end_time <= start_time.")

        for j in range(i + 1, len(assignments)):
            a2 = assignments[j]
            s2 = _ensure_utc(a2.start_time)
            e2 = _ensure_utc(a2.end_time)

            if _intervals_overlap(s1, e1, s2, e2):
                if a1.candidate_id == a2.candidate_id:
                    violations.append(f"Double-booked candidate {a1.candidate_id} between {s1} and {s2}.")
                if a1.interviewer_id == a2.interviewer_id:
                    violations.append(f"Double-booked interviewer {a1.interviewer_id} between {s1} and {s2}.")
                if a1.room_id and a2.room_id and a1.room_id == a2.room_id:
                    violations.append(f"Double-booked room {a1.room_id} between {s1} and {s2}.")

    # Invariant 2: Candidate availability and existing bookings
    for a in assignments:
        s = _ensure_utc(a.start_time)
        e = _ensure_utc(a.end_time)

        c = c_map.get(a.candidate_id)
        if c and not _is_within_availabilities(s, e, c.availabilities):
            violations.append(f"Candidate {a.candidate_id} scheduled outside their stated availability window.")

        # Check existing bookings collisions
        for eb in existing_bookings:
            eb_s = _ensure_utc(eb.start_time)
            eb_e = _ensure_utc(eb.end_time)
            if _intervals_overlap(s, e, eb_s, eb_e):
                if eb.candidate_id == a.candidate_id:
                    violations.append(f"Candidate {a.candidate_id} overlaps with pre-existing booking {eb.id}.")
                if eb.interviewer_id == a.interviewer_id:
                    violations.append(f"Interviewer {a.interviewer_id} overlaps with pre-existing booking {eb.id}.")
                if a.room_id and eb.room_id and eb.room_id == a.room_id:
                    violations.append(f"Room {a.room_id} overlaps with pre-existing booking {eb.id}.")

    # Invariant 3: Interviewer skills & workload
    interviewer_counts = {}
    for a in assignments:
        interviewer_counts[a.interviewer_id] = interviewer_counts.get(a.interviewer_id, 0) + 1
        intr = i_map.get(a.interviewer_id)
        if intr:
            i_skills_lower = set(s.lower() for s in intr.skills)
            if not req_skills_lower.issubset(i_skills_lower):
                violations.append(f"Interviewer {a.interviewer_id} lacks required skills {required_skills}.")

    for i_id, count in interviewer_counts.items():
        intr = i_map.get(i_id)
        if intr:
            existing_count = sum(1 for eb in existing_bookings if eb.interviewer_id == i_id)
            if count + existing_count > intr.workload_limit:
                violations.append(
                    f"Interviewer {i_id} exceeds workload limit: assigned {count} + existing {existing_count} > limit {intr.workload_limit}."
                )

    return len(violations) == 0, violations
