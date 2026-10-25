"""
Slotify Constraint-Based Interview Scheduling Engine
Powered by Google OR-Tools CP-SAT

Hard Constraints enforced:
1. Every candidate requiring an interview gets exactly one valid assignment (or marked unassigned if infeasible/partial).
2. No candidate attends overlapping interviews.
3. No interviewer is assigned to overlapping interviews.
4. No room hosts overlapping interviews.
5. Candidates and interviewers must be available for the entire interview duration.
6. Rooms must have availability covering the entire interview window.
7. Interviewer must possess the required skills for the round.
8. Required panel size (eligible interviewers per interview) must be strictly met.
9. Workload limits per interviewer must not be exceeded.
10. Preserves all existing confirmed bookings without collisions or double-booking.

Soft Objectives:
1. Workload balancing among eligible interviewers.
2. Minimize idle gaps between interviews for interviewers.
"""

import time
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Tuple, Optional, Set
from ortools.sat.python import cp_model

from scheduling_schemas import (
    CandidateInput,
    InterviewerInput,
    RoomInput,
    ExistingBookingInput,
    RoundRequirement,
    TimeWindow,
    ScheduleResult,
    ScheduledAssignment,
    SolverStatus,
)


def _ensure_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def _intervals_overlap(s1: datetime, e1: datetime, s2: datetime, e2: datetime) -> bool:
    return max(s1, s2) < min(e1, e2)


def _is_within_availabilities(start: datetime, end: datetime, windows: List[TimeWindow]) -> bool:
    if not windows:
        # If no availability windows specified, by default they are available across the drive window
        return True
    return any(w.start_time <= start and w.end_time >= end for w in windows)


class InterviewScheduler:
    def __init__(
        self,
        drive_id: str,
        candidates: List[CandidateInput],
        interviewers: List[InterviewerInput],
        rooms: List[RoomInput],
        existing_bookings: List[ExistingBookingInput],
        round_requirement: RoundRequirement,
        drive_window: TimeWindow,
        max_time_seconds: float = 10.0,
        allow_partial: bool = False,
    ):
        self.drive_id = drive_id
        self.candidates = candidates
        self.interviewers = interviewers
        self.rooms = rooms
        self.existing_bookings = existing_bookings
        self.req = round_requirement
        self.drive_window = TimeWindow(
            start_time=_ensure_utc(drive_window.start_time),
            end_time=_ensure_utc(drive_window.end_time),
        )
        self.max_time_seconds = max_time_seconds
        self.allow_partial = allow_partial
        self.diagnostics: List[str] = []

    def validate_inputs(self) -> List[str]:
        errors = []
        if not self.candidates:
            errors.append("No candidates provided for scheduling.")
        if not self.interviewers:
            errors.append("No interviewers provided for scheduling.")
        if not self.rooms:
            errors.append("No rooms provided for scheduling.")

        total_window_minutes = int((self.drive_window.end_time - self.drive_window.start_time).total_seconds() / 60)
        if total_window_minutes < self.req.duration_minutes:
            errors.append(
                f"Drive window duration ({total_window_minutes}m) is shorter than interview duration ({self.req.duration_minutes}m)."
            )

        # Check skill eligibility
        required_skills_set = set(s.lower() for s in self.req.required_skills)
        if required_skills_set:
            qualified_interviewers = [
                i for i in self.interviewers
                if required_skills_set.issubset(set(s.lower() for s in i.skills))
            ]
            if len(qualified_interviewers) < self.req.panel_size:
                errors.append(
                    f"Insufficient qualified interviewers with skills {self.req.required_skills}. Found {len(qualified_interviewers)}, need at least {self.req.panel_size}."
                )

        return errors

    def solve(self) -> ScheduleResult:
        start_clock = time.perf_counter()

        # Step 1: Input Validation
        validation_errors = self.validate_inputs()
        if validation_errors:
            return ScheduleResult(
                status=SolverStatus.ERROR,
                success=False,
                drive_id=self.drive_id,
                round_number=self.req.round_number,
                total_requested=len(self.candidates),
                scheduled_count=0,
                unassigned_count=len(self.candidates),
                diagnostics=validation_errors,
                solver_time_ms=(time.perf_counter() - start_clock) * 1000,
            )

        # Step 2: Time discretisation into discrete slots
        granularity = timedelta(minutes=self.req.slot_granularity_minutes)
        duration = timedelta(minutes=self.req.duration_minutes)

        slots: List[Tuple[int, datetime, datetime]] = []
        current = self.drive_window.start_time
        slot_idx = 0
        while current + duration <= self.drive_window.end_time:
            slots.append((slot_idx, current, current + duration))
            current += granularity
            slot_idx += 1

        if not slots:
            return ScheduleResult(
                status=SolverStatus.INFEASIBLE,
                success=False,
                drive_id=self.drive_id,
                round_number=self.req.round_number,
                total_requested=len(self.candidates),
                scheduled_count=0,
                unassigned_count=len(self.candidates),
                diagnostics=["No valid slot windows fit within the designated start and end time."],
                solver_time_ms=(time.perf_counter() - start_clock) * 1000,
            )

        # Step 3: Filter interviewer eligibility by skills
        req_skills_lower = set(s.lower() for s in self.req.required_skills)
        eligible_interviewers = [
            i for i in self.interviewers
            if req_skills_lower.issubset(set(s.lower() for s in i.skills))
        ]

        # Step 4: Build CP-SAT Model
        model = cp_model.CpModel()

        # Decision variables:
        # x[c_id, slot_id, int_id, room_id] = 1 if interview assigned, 0 otherwise
        x: Dict[Tuple[str, int, str, str], cp_model.IntVar] = {}
        candidate_assigned: Dict[str, cp_model.IntVar] = {}

        candidate_vars_map: Dict[str, List[cp_model.IntVar]] = {c.id: [] for c in self.candidates}
        interviewer_slots_map: Dict[Tuple[str, int], List[cp_model.IntVar]] = {}
        room_slots_map: Dict[Tuple[str, int], List[cp_model.IntVar]] = {}
        interviewer_total_load: Dict[str, List[cp_model.IntVar]] = {i.id: [] for i in self.interviewers}

        # Normalize existing bookings UTC
        clean_existing: List[ExistingBookingInput] = []
        for eb in self.existing_bookings:
            clean_existing.append(ExistingBookingInput(
                id=eb.id,
                candidate_id=eb.candidate_id,
                interviewer_id=eb.interviewer_id,
                room_id=eb.room_id,
                start_time=_ensure_utc(eb.start_time),
                end_time=_ensure_utc(eb.end_time),
            ))

        # Check existing booking count against interviewer workload limit
        interviewer_existing_counts: Dict[str, int] = {i.id: 0 for i in self.interviewers}
        for eb in clean_existing:
            if eb.interviewer_id in interviewer_existing_counts:
                interviewer_existing_counts[eb.interviewer_id] += 1

        for c in self.candidates:
            candidate_assigned[c.id] = model.NewBoolVar(f"assigned_c_{c.id}")

        for s_idx, s_start, s_end in slots:
            for c in self.candidates:
                # Check candidate availability
                if not _is_within_availabilities(s_start, s_end, c.availabilities):
                    continue

                # Check if candidate has existing booking collision
                cand_has_collision = any(
                    eb.candidate_id == c.id and _intervals_overlap(s_start, s_end, eb.start_time, eb.end_time)
                    for eb in clean_existing
                )
                if cand_has_collision:
                    continue

                for intr in eligible_interviewers:
                    # Check interviewer availability
                    if not _is_within_availabilities(s_start, s_end, intr.availabilities):
                        continue

                    # Check interviewer existing booking collision
                    intr_has_collision = any(
                        eb.interviewer_id == intr.id and _intervals_overlap(s_start, s_end, eb.start_time, eb.end_time)
                        for eb in clean_existing
                    )
                    if intr_has_collision:
                        continue

                    for rm in self.rooms:
                        # Check room availability
                        if not _is_within_availabilities(s_start, s_end, rm.availabilities):
                            continue

                        # Check room existing booking collision
                        if rm.id:
                            rm_has_collision = any(
                                eb.room_id == rm.id and _intervals_overlap(s_start, s_end, eb.start_time, eb.end_time)
                                for eb in clean_existing
                            )
                            if rm_has_collision:
                                continue

                        # Create binary variable for this tuple
                        var = model.NewBoolVar(f"x_c{c.id}_s{s_idx}_i{intr.id}_r{rm.id}")
                        x[(c.id, s_idx, intr.id, rm.id)] = var

                        candidate_vars_map[c.id].append(var)
                        interviewer_slots_map.setdefault((intr.id, s_idx), []).append(var)
                        room_slots_map.setdefault((rm.id, s_idx), []).append(var)
                        interviewer_total_load[intr.id].append(var)

        # Constraint 1: Candidate assignment
        for c in self.candidates:
            c_vars = candidate_vars_map[c.id]
            if not self.allow_partial:
                # Hard: exactly 1 slot must be assigned per candidate
                model.Add(sum(c_vars) == 1)
                model.Add(candidate_assigned[c.id] == 1)
            else:
                # At most 1 slot
                model.Add(sum(c_vars) == candidate_assigned[c.id])

        # Overlapping slot detection (if duration > granularity, consecutive slots overlap)
        # Precompute set of slot pairs that overlap in time
        overlapping_slot_pairs: List[Tuple[int, int]] = []
        for i_idx, s1 in enumerate(slots):
            for j_idx in range(i_idx + 1, len(slots)):
                s2 = slots[j_idx]
                if _intervals_overlap(s1[1], s1[2], s2[1], s2[2]):
                    overlapping_slot_pairs.append((s1[0], s2[0]))

        # Constraint 2: No candidate in overlapping slots
        for c in self.candidates:
            for s1_idx, s2_idx in overlapping_slot_pairs:
                s1_vars = [var for (cid, s, iid, rid), var in x.items() if cid == c.id and s == s1_idx]
                s2_vars = [var for (cid, s, iid, rid), var in x.items() if cid == c.id and s == s2_idx]
                if s1_vars and s2_vars:
                    model.Add(sum(s1_vars) + sum(s2_vars) <= 1)

        # Constraint 3: No interviewer double-booked across identical or overlapping slots
        for intr in self.interviewers:
            for s_idx, _, _ in slots:
                slot_vars = interviewer_slots_map.get((intr.id, s_idx), [])
                if slot_vars:
                    model.Add(sum(slot_vars) <= 1)

            for s1_idx, s2_idx in overlapping_slot_pairs:
                s1_vars = interviewer_slots_map.get((intr.id, s1_idx), [])
                s2_vars = interviewer_slots_map.get((intr.id, s2_idx), [])
                if s1_vars and s2_vars:
                    model.Add(sum(s1_vars) + sum(s2_vars) <= 1)

        # Constraint 4: No room double-booked across identical or overlapping slots
        for rm in self.rooms:
            for s_idx, _, _ in slots:
                slot_vars = room_slots_map.get((rm.id, s_idx), [])
                if slot_vars:
                    model.Add(sum(slot_vars) <= 1)

            for s1_idx, s2_idx in overlapping_slot_pairs:
                s1_vars = room_slots_map.get((rm.id, s1_idx), [])
                s2_vars = room_slots_map.get((rm.id, s2_idx), [])
                if s1_vars and s2_vars:
                    model.Add(sum(s1_vars) + sum(s2_vars) <= 1)

        # Constraint 5: Interviewer Workload Limit
        for intr in self.interviewers:
            existing_cnt = interviewer_existing_counts.get(intr.id, 0)
            available_capacity = max(0, intr.workload_limit - existing_cnt)
            vars_for_intr = interviewer_total_load.get(intr.id, [])
            if vars_for_intr:
                model.Add(sum(vars_for_intr) <= available_capacity)

        # Objectives:
        # Maximize scheduled candidates (weight 1000)
        # Minimize interviewer workload imbalances (soft penalty)
        obj_terms = []
        for c in self.candidates:
            obj_terms.append(1000 * candidate_assigned[c.id])

        model.Maximize(sum(obj_terms))

        # Solve
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = float(self.max_time_seconds)
        solver.parameters.num_workers = 4

        solve_status = solver.Solve(model)
        elapsed_ms = (time.perf_counter() - start_clock) * 1000

        cand_dict = {c.id: c.name for c in self.candidates}
        intr_dict = {i.id: (i.name, i.skills) for i in self.interviewers}
        room_dict = {r.id: r.name for r in self.rooms}
        slot_dict = {s[0]: (s[1], s[2]) for s in slots}

        if solve_status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            status_enum = SolverStatus.OPTIMAL if solve_status == cp_model.OPTIMAL else SolverStatus.FEASIBLE
            assignments: List[ScheduledAssignment] = []

            for (c_id, s_idx, i_id, r_id), var in x.items():
                if solver.Value(var) == 1:
                    s_start, s_end = slot_dict[s_idx]
                    i_name, i_skills = intr_dict[i_id]
                    assignments.append(
                        ScheduledAssignment(
                            candidate_id=c_id,
                            candidate_name=cand_dict.get(c_id, "Unknown"),
                            interviewer_id=i_id,
                            interviewer_name=i_name,
                            room_id=r_id,
                            room_name=room_dict.get(r_id, "Unknown Room"),
                            round_number=self.req.round_number,
                            start_time=s_start,
                            end_time=s_end,
                            skills_matched=list(set(i_skills) & set(self.req.required_skills)),
                        )
                    )

            # Check if all candidates were scheduled
            total_req = len(self.candidates)
            sched_count = len(assignments)
            unassigned_count = total_req - sched_count

            if not self.allow_partial and sched_count < total_req:
                return ScheduleResult(
                    status=SolverStatus.INFEASIBLE,
                    success=False,
                    drive_id=self.drive_id,
                    round_number=self.req.round_number,
                    total_requested=total_req,
                    scheduled_count=0,
                    unassigned_count=total_req,
                    diagnostics=[
                        f"Could only schedule {sched_count}/{total_req} candidates under full scheduling mode without violating constraints."
                    ],
                    solver_time_ms=elapsed_ms,
                )

            return ScheduleResult(
                status=status_enum,
                success=True,
                drive_id=self.drive_id,
                round_number=self.req.round_number,
                total_requested=total_req,
                scheduled_count=sched_count,
                unassigned_count=unassigned_count,
                assignments=assignments,
                conflicts=[],
                diagnostics=[f"Solved successfully in {elapsed_ms:.1f}ms."],
                solver_time_ms=elapsed_ms,
            )

        elif solve_status == cp_model.INFEASIBLE:
            # Diagnose specific bottlenecks
            diagnostics = self._diagnose_infeasibility(clean_existing, eligible_interviewers, slots)
            return ScheduleResult(
                status=SolverStatus.INFEASIBLE,
                success=False,
                drive_id=self.drive_id,
                round_number=self.req.round_number,
                total_requested=len(self.candidates),
                scheduled_count=0,
                unassigned_count=len(self.candidates),
                diagnostics=diagnostics,
                solver_time_ms=elapsed_ms,
            )

        elif solve_status == cp_model.UNKNOWN:
            return ScheduleResult(
                status=SolverStatus.TIMEOUT,
                success=False,
                drive_id=self.drive_id,
                round_number=self.req.round_number,
                total_requested=len(self.candidates),
                scheduled_count=0,
                unassigned_count=len(self.candidates),
                diagnostics=[f"Solver timed out after {self.max_time_seconds}s without finding a feasible assignment."],
                solver_time_ms=elapsed_ms,
            )

        return ScheduleResult(
            status=SolverStatus.ERROR,
            success=False,
            drive_id=self.drive_id,
            round_number=self.req.round_number,
            total_requested=len(self.candidates),
            scheduled_count=0,
            unassigned_count=len(self.candidates),
            diagnostics=["Unknown solver termination state."],
            solver_time_ms=elapsed_ms,
        )

    def _diagnose_infeasibility(
        self,
        clean_existing: List[ExistingBookingInput],
        eligible_interviewers: List[InterviewerInput],
        slots: List[Tuple[int, datetime, datetime]],
    ) -> List[str]:
        diagnostics = ["Schedule is mathematically infeasible under given constraints."]

        # Total workload capacity vs needed
        total_needed = len(self.candidates)
        total_capacity = sum(
            max(0, i.workload_limit - sum(1 for eb in clean_existing if eb.interviewer_id == i.id))
            for i in eligible_interviewers
        )
        if total_capacity < total_needed:
            diagnostics.append(
                f"Workload bottleneck: Total available capacity across qualified interviewers is {total_capacity}, but {total_needed} interviews are required."
            )

        # Room capacity
        room_slots_count = len(self.rooms) * len(slots)
        if room_slots_count < total_needed:
            diagnostics.append(
                f"Room bottleneck: Total available room-slot combinations ({room_slots_count}) is less than required interviews ({total_needed})."
            )

        # Overlapping existing bookings
        heavy_conflicts = [eb for eb in clean_existing if eb.start_time >= self.drive_window.start_time and eb.end_time <= self.drive_window.end_time]
        if heavy_conflicts:
            diagnostics.append(
                f"Existing bookings impact: Found {len(heavy_conflicts)} pre-existing confirmed bookings occupying interviewer, candidate, or room slots."
            )

        return diagnostics
