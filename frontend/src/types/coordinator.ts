import type { SlotStatus } from "./index";

export type DriveStatus = "planning" | "active" | "completed" | "paused";

export type RoundType = "coding" | "technical" | "system_design" | "hr";

export interface InterviewRound {
  id: string;
  name: string;
  type: RoundType;
  sequenceOrder: number;
  durationMinutes: number;
}

export interface RecruitmentDrive {
  id: string;
  name: string;
  company: string;
  description: string;
  startDate: string;
  endDate: string;
  status: DriveStatus;
  rounds: InterviewRound[];
  candidateIds: string[];
  interviewerIds: string[];
  roomIds: string[];
}

export type CandidateBookingStatus = SlotStatus | "unassigned";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  rollNo: string;
  driveId: string;
  appliedRole: string;
  currentStage: string;
  bookingStatus: CandidateBookingStatus;
  assignedSlotId?: string;
  notes?: string;
}

export interface AvailabilityWindow {
  id: string;
  day: number;
  date: string;
  startTime: string;
  endTime: string;
}

export interface Interviewer {
  id: string;
  name: string;
  email: string;
  department: string;
  expertise: string[];
  maxDailyLoad: number;
  availability: AvailabilityWindow[];
  assignedCount: number;
}

export interface InterviewRoom {
  id: string;
  name: string;
  building: string;
  floor: string;
  capacity: number;
  isAvailable: boolean;
  equipment: string[];
}

export interface ScheduledInterview {
  id: string;
  driveId: string;
  roundId: string;
  candidateId: string;
  interviewerId: string;
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: SlotStatus;
  conflictReason?: string;
}

export type ConflictType =
  | "room_overlap"
  | "interviewer_overlap"
  | "candidate_overlap"
  | "capacity_exceeded"
  | "buffer_violation";

export interface ScheduleConflict {
  id: string;
  type: ConflictType;
  title: string;
  description: string;
  affectedInterviewIds: string[];
  severity: "error" | "warning";
}

export interface ScheduleGenerationResult {
  success: boolean;
  timestamp: string;
  scheduledCount: number;
  conflictCount: number;
  unassignedCount: number;
  conflicts: ScheduleConflict[];
  logs: string[];
}
