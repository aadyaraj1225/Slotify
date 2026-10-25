import * as React from "react";
import { useCoordinator } from "./coordinator-context";
import type { Candidate, ScheduledInterview } from "@/types/coordinator";
import type { CandidateNotification, AvailableBookingSlot } from "@/types/candidate";

const CANDIDATE_STORAGE_KEY = "slotify_active_candidate_id";
const NOTIFICATIONS_STORAGE_KEY = "slotify_candidate_notifications_v1";

const INITIAL_NOTIFICATIONS: CandidateNotification[] = [
  {
    id: "notif-1",
    title: "Interview Scheduled",
    message: "Your interview for Round 1: Data Structures & Algorithms has been confirmed for Nov 10, 2026 at 09:30.",
    type: "confirmed",
    timestamp: "2026-10-24 14:30",
    read: false,
    interviewId: "slot-1",
  },
  {
    id: "notif-2",
    title: "Eligible for Self-Booking",
    message: "Google Campus Recruitment Drive 2026 has opened candidate self-booking windows for upcoming technical rounds.",
    type: "info",
    timestamp: "2026-10-23 09:00",
    read: true,
  },
  {
    id: "notif-3",
    title: "Venue Turnaround Policy Notice",
    message: "Remember that all campus interview cabins maintain a mandatory 15-minute sanitization & buffer interval between rounds.",
    type: "info",
    timestamp: "2026-10-22 11:15",
    read: true,
  },
];

interface CandidateContextType {
  activeCandidate: Candidate;
  allCandidates: Candidate[];
  setActiveCandidateId: (id: string) => void;
  myInterviews: ScheduledInterview[];
  availableSlots: AvailableBookingSlot[];
  notifications: CandidateNotification[];
  unreadNotificationCount: number;
  bookSlot: (slot: AvailableBookingSlot) => Promise<{ success: boolean; message: string }>;
  cancelInterview: (interviewId: string) => Promise<{ success: boolean; message: string }>;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
}

const CandidateContext = React.createContext<CandidateContextType | undefined>(undefined);

export const CandidateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    candidates,
    interviews,
    drives,
    rooms,
    interviewers,
    updateCandidate,
  } = useCoordinator();

  // Active candidate id in session
  const [activeCandidateId, setActiveCandidateIdState] = React.useState<string>(() => {
    try {
      const saved = localStorage.getItem(CANDIDATE_STORAGE_KEY);
      if (saved && candidates.some((c) => c.id === saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return candidates[0]?.id || "cand-1";
  });

  const setActiveCandidateId = (id: string) => {
    setActiveCandidateIdState(id);
    try {
      localStorage.setItem(CANDIDATE_STORAGE_KEY, id);
    } catch {
      // ignore
    }
  };

  const activeCandidate = candidates.find((c) => c.id === activeCandidateId) || candidates[0] || {
    id: "cand-1",
    name: "Aarav Patel",
    email: "aarav.patel@campus.edu",
    rollNo: "CS21B042",
    driveId: "drive-1",
    appliedRole: "Software Engineer (Backend)",
    currentStage: "Round 1: Data Structures & Algorithms",
    bookingStatus: "confirmed",
  };

  // Notifications
  const [notifications, setNotifications] = React.useState<CandidateNotification[]>(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_NOTIFICATIONS;
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

  // Candidate's scheduled interviews
  const myInterviews = React.useMemo(() => {
    return interviews.filter((i) => i.candidateId === activeCandidate.id);
  }, [interviews, activeCandidate.id]);

  // Candidate's eligible booking slots (derived from active drive rounds + interviewers + rooms)
  const availableSlots: AvailableBookingSlot[] = React.useMemo(() => {
    const candidateDrive = drives.find((d) => d.id === activeCandidate.driveId);
    if (!candidateDrive) return [];

    // Filter available rooms
    const activeRooms = rooms.filter((r) => r.isAvailable);
    if (activeRooms.length === 0) return [];

    // Generate prospective slots from interviewer availability windows that do not clash with booked interviews
    const prospectiveSlots: AvailableBookingSlot[] = [];

    candidateDrive.rounds.forEach((round) => {
      // Collect interviewers participating in this drive
      const driveInterviewers = interviewers.filter((inv) => candidateDrive.interviewerIds.includes(inv.id));

      driveInterviewers.forEach((inv, invIdx) => {
        const assignedRoom = activeRooms[invIdx % activeRooms.length];
        inv.availability.forEach((avail) => {
          // Check if this time slot is already booked
          const isSlotTaken = interviews.some(
            (itv) =>
              itv.date === avail.date &&
              itv.startTime === avail.startTime &&
              (itv.interviewerId === inv.id || itv.roomId === assignedRoom.id) &&
              itv.status !== "cancelled"
          );

          if (!isSlotTaken) {
            prospectiveSlots.push({
              id: `bookable-${round.id}-${inv.id}-${avail.id}`,
              driveId: candidateDrive.id,
              driveName: candidateDrive.name,
              roundId: round.id,
              roundName: round.name,
              interviewerId: inv.id,
              interviewerName: inv.name,
              roomId: assignedRoom.id,
              roomName: assignedRoom.name,
              date: avail.date,
              startTime: avail.startTime,
              endTime: avail.endTime,
              durationMinutes: round.durationMinutes,
            });
          }
        });
      });
    });

    return prospectiveSlots;
  }, [activeCandidate.driveId, drives, rooms, interviewers, interviews]);

  // Booking action
  const bookSlot = async (slot: AvailableBookingSlot): Promise<{ success: boolean; message: string }> => {
    // Check if candidate already has an interview on the same date and overlapping time
    const hasConflict = myInterviews.some(
      (itv) => itv.date === slot.date && itv.startTime === slot.startTime && itv.status !== "cancelled"
    );

    if (hasConflict) {
      return {
        success: false,
        message: "You already have another interview scheduled at this exact time. Overlapping sessions are strictly forbidden by solver invariants.",
      };
    }

    // Update candidate status
    updateCandidate(activeCandidate.id, {
      bookingStatus: "confirmed",
      currentStage: slot.roundName,
      assignedSlotId: slot.id,
    });

    // Add notification
    const newNotification: CandidateNotification = {
      id: `notif-${Date.now()}`,
      title: "Booking Confirmed",
      message: `You successfully reserved a slot for ${slot.roundName} on ${slot.date} (${slot.startTime} - ${slot.endTime}) at ${slot.roomName}.`,
      type: "confirmed",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      read: false,
      interviewId: slot.id,
    };

    setNotifications((prev) => [newNotification, ...prev]);

    return {
      success: true,
      message: `Slot confirmed! Your interview for ${slot.roundName} is locked in.`,
    };
  };

  // Cancellation action
  const cancelInterview = async (interviewId: string): Promise<{ success: boolean; message: string }> => {
    // Update candidate booking status
    updateCandidate(activeCandidate.id, {
      bookingStatus: "unassigned",
      assignedSlotId: undefined,
    });

    // Add notification
    const newNotification: CandidateNotification = {
      id: `notif-${Date.now()}`,
      title: "Interview Cancelled",
      message: `Your interview session (${interviewId}) was cancelled. You may select a new opening from Available Slots.`,
      type: "cancelled",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      read: false,
      interviewId,
    };

    setNotifications((prev) => [newNotification, ...prev]);

    return {
      success: true,
      message: "Interview reservation released. You are now free to re-book an available slot.",
    };
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <CandidateContext.Provider
      value={{
        activeCandidate,
        allCandidates: candidates,
        setActiveCandidateId,
        myInterviews,
        availableSlots,
        notifications,
        unreadNotificationCount,
        bookSlot,
        cancelInterview,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </CandidateContext.Provider>
  );
};

export const useCandidate = () => {
  const context = React.useContext(CandidateContext);
  if (!context) {
    throw new Error("useCandidate must be used within a CandidateProvider");
  }
  return context;
};
