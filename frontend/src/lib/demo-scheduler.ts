import type {
  RecruitmentDrive,
  Candidate,
  Interviewer,
  InterviewRoom,
  ScheduledInterview,
  ScheduleConflict,
  ScheduleGenerationResult,
} from "@/types/coordinator";

/**
 * Demo Schedule Generator
 * Simulates constraint evaluation for campus recruitment drives.
 * Structured to be easily swapped with the FastAPI OR-Tools endpoint in Phase 4.
 */
export async function runDemoScheduleGenerator(params: {
  drive: RecruitmentDrive;
  candidates: Candidate[];
  interviewers: Interviewer[];
  rooms: InterviewRoom[];
  existingInterviews: ScheduledInterview[];
}): Promise<ScheduleGenerationResult> {
  const { drive, candidates, interviewers, rooms, existingInterviews } = params;

  // Simulate network/solver latency (1.2 seconds)
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const logs: string[] = [];
  logs.push(`[Init] Invoking demo constraint evaluator for drive: "${drive.name}" (ID: ${drive.id})`);
  logs.push(`[Inputs] Available Rooms: ${rooms.filter((r) => r.isAvailable).length}, Qualified Interviewers: ${interviewers.length}`);

  // Candidates belonging to this drive that are unassigned or have conflicts
  const pendingCandidates = candidates.filter(
    (c) => c.driveId === drive.id && (c.bookingStatus === "unassigned" || c.bookingStatus === "conflict")
  );

  logs.push(`[Analysis] Found ${pendingCandidates.length} candidate(s) awaiting interview allocation in this drive.`);

  const newScheduledInterviews: ScheduledInterview[] = [...existingInterviews];
  const detectedConflicts: ScheduleConflict[] = [];

  const availableRooms = rooms.filter((r) => r.isAvailable);

  if (availableRooms.length === 0) {
    logs.push("[Error] Invariant check failed: Zero available rooms configured for this drive.");
    return {
      success: false,
      timestamp: new Date().toISOString(),
      scheduledCount: 0,
      conflictCount: 1,
      unassignedCount: pendingCandidates.length,
      conflicts: [
        {
          id: `conf-${Date.now()}`,
          type: "capacity_exceeded",
          title: "No Available Interview Rooms",
          description: "All rooms in this drive are currently marked unavailable. Please activate at least one room.",
          affectedInterviewIds: [],
          severity: "error",
        },
      ],
      logs,
    };
  }

  let newlyScheduledCount = 0;
  const targetDate = drive.startDate || "2026-11-10";

  // Attempt assignment for each pending candidate
  for (const candidate of pendingCandidates) {
    // Find the first round in drive
    const round = drive.rounds[0] || {
      id: "rnd-default",
      name: "Preliminary Assessment",
      type: "technical",
      sequenceOrder: 1,
      durationMinutes: 45,
    };

    // Find an interviewer with remaining capacity
    const eligibleInterviewer = interviewers.find(
      (int) => int.assignedCount < int.maxDailyLoad
    );

    if (!eligibleInterviewer) {
      logs.push(`[Warning] No interviewer available with remaining capacity for candidate: ${candidate.name}`);
      detectedConflicts.push({
        id: `conf-capacity-${candidate.id}`,
        type: "interviewer_overlap",
        title: `Interviewer Capacity Reached for ${candidate.name}`,
        description: `All interviewers have reached their daily workload limit (${eligibleInterviewer || "max limit"}). Additional panelists required.`,
        affectedInterviewIds: [],
        severity: "warning",
      });
      continue;
    }

    // Select room
    const assignedRoom = availableRooms[newlyScheduledCount % availableRooms.length];

    // Compute slot times with 15-minute buffer
    const slotHour = 13 + Math.floor(newlyScheduledCount / 2);
    const slotMin = (newlyScheduledCount % 2) * 45;
    const startTime = `${String(slotHour).padStart(2, "0")}:${String(slotMin).padStart(2, "0")}`;
    const endMin = (slotMin + round.durationMinutes) % 60;
    const endHour = slotHour + Math.floor((slotMin + round.durationMinutes) / 60);
    const endTime = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;

    const newInterview: ScheduledInterview = {
      id: `slot-gen-${Date.now()}-${candidate.id}`,
      driveId: drive.id,
      roundId: round.id,
      candidateId: candidate.id,
      interviewerId: eligibleInterviewer.id,
      roomId: assignedRoom.id,
      date: targetDate,
      startTime,
      endTime,
      status: "confirmed",
    };

    newScheduledInterviews.push(newInterview);
    newlyScheduledCount++;

    // Increment interviewer count
    eligibleInterviewer.assignedCount += 1;
    candidate.bookingStatus = "confirmed";
    candidate.assignedSlotId = newInterview.id;

    logs.push(`[Allocated] Matched ${candidate.name} with ${eligibleInterviewer.name} in ${assignedRoom.name} (${startTime} - ${endTime})`);
  }

  logs.push(`[Success] Solver routine finalized. Generated ${newlyScheduledCount} valid assignments.`);

  return {
    success: true,
    timestamp: new Date().toISOString(),
    scheduledCount: newlyScheduledCount,
    conflictCount: detectedConflicts.length,
    unassignedCount: pendingCandidates.length - newlyScheduledCount,
    conflicts: detectedConflicts,
    logs,
  };
}
