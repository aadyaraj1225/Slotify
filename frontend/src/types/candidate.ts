export interface CandidateNotification {
  id: string;
  title: string;
  message: string;
  type: "scheduled" | "confirmed" | "rescheduled" | "cancelled" | "info";
  timestamp: string;
  read: boolean;
  interviewId?: string;
}

export interface AvailableBookingSlot {
  id: string;
  driveId: string;
  driveName: string;
  roundId: string;
  roundName: string;
  interviewerId: string;
  interviewerName: string;
  roomId: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}
