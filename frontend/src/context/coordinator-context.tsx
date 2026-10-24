import * as React from "react";
import type {
  RecruitmentDrive,
  Candidate,
  Interviewer,
  InterviewRoom,
  ScheduledInterview,
  ScheduleConflict,
  AvailabilityWindow,
  ScheduleGenerationResult,
} from "@/types/coordinator";
import {
  INITIAL_DRIVES,
  INITIAL_CANDIDATES,
  INITIAL_INTERVIEWERS,
  INITIAL_ROOMS,
  INITIAL_INTERVIEWS,
  INITIAL_CONFLICTS,
} from "@/lib/coordinator-demo-data";
import { runDemoScheduleGenerator } from "@/lib/demo-scheduler";

const STORAGE_KEY = "slotify_coordinator_data_v1";

interface CoordinatorContextType {
  drives: RecruitmentDrive[];
  candidates: Candidate[];
  interviewers: Interviewer[];
  rooms: InterviewRoom[];
  interviews: ScheduledInterview[];
  conflicts: ScheduleConflict[];
  selectedDriveId: string;
  activeDrive: RecruitmentDrive | undefined;
  setSelectedDriveId: (id: string) => void;
  addDrive: (drive: Omit<RecruitmentDrive, "id">) => string;
  updateDrive: (id: string, updates: Partial<RecruitmentDrive>) => void;
  deleteDrive: (id: string) => void;
  addCandidate: (candidate: Omit<Candidate, "id">) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  deleteCandidate: (id: string) => void;
  addInterviewer: (interviewer: Omit<Interviewer, "id">) => void;
  updateInterviewer: (id: string, updates: Partial<Interviewer>) => void;
  deleteInterviewer: (id: string) => void;
  addRoom: (room: Omit<InterviewRoom, "id">) => void;
  updateRoom: (id: string, updates: Partial<InterviewRoom>) => void;
  toggleRoomAvailability: (id: string) => void;
  deleteRoom: (id: string) => void;
  addAvailability: (interviewerId: string, window: Omit<AvailabilityWindow, "id">) => void;
  removeAvailability: (interviewerId: string, windowId: string) => void;
  generateSchedule: (driveId?: string) => Promise<ScheduleGenerationResult>;
  resolveConflict: (conflictId: string) => void;
  resetToDefaultData: () => void;
}

const CoordinatorContext = React.createContext<CoordinatorContextType | undefined>(undefined);

export const CoordinatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [drives, setDrives] = React.useState<RecruitmentDrive[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.drives) return parsed.drives;
      }
    } catch {
      // fallback to initial
    }
    return INITIAL_DRIVES;
  });

  const [candidates, setCandidates] = React.useState<Candidate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.candidates) return parsed.candidates;
      }
    } catch {}
    return INITIAL_CANDIDATES;
  });

  const [interviewers, setInterviewers] = React.useState<Interviewer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.interviewers) return parsed.interviewers;
      }
    } catch {}
    return INITIAL_INTERVIEWERS;
  });

  const [rooms, setRooms] = React.useState<InterviewRoom[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.rooms) return parsed.rooms;
      }
    } catch {}
    return INITIAL_ROOMS;
  });

  const [interviews, setInterviews] = React.useState<ScheduledInterview[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.interviews) return parsed.interviews;
      }
    } catch {}
    return INITIAL_INTERVIEWS;
  });

  const [conflicts, setConflicts] = React.useState<ScheduleConflict[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.conflicts) return parsed.conflicts;
      }
    } catch {}
    return INITIAL_CONFLICTS;
  });

  const [selectedDriveId, setSelectedDriveId] = React.useState<string>("drive-1");

  // Persist demo state whenever changes occur
  React.useEffect(() => {
    try {
      const payload = {
        drives,
        candidates,
        interviewers,
        rooms,
        interviews,
        conflicts,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage errors in restricted iframe environments
    }
  }, [drives, candidates, interviewers, rooms, interviews, conflicts]);

  const activeDrive = drives.find((d) => d.id === selectedDriveId);

  // Drive operations
  const addDrive = (driveData: Omit<RecruitmentDrive, "id">): string => {
    const newId = `drive-${Date.now()}`;
    const newDrive: RecruitmentDrive = { ...driveData, id: newId };
    setDrives((prev) => [newDrive, ...prev]);
    setSelectedDriveId(newId);
    return newId;
  };

  const updateDrive = (id: string, updates: Partial<RecruitmentDrive>) => {
    setDrives((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const deleteDrive = (id: string) => {
    setDrives((prev) => prev.filter((d) => d.id !== id));
    if (selectedDriveId === id) {
      setSelectedDriveId(drives[0]?.id || "all");
    }
  };

  // Candidate operations
  const addCandidate = (candData: Omit<Candidate, "id">) => {
    const newCandidate: Candidate = { ...candData, id: `cand-${Date.now()}` };
    setCandidates((prev) => [newCandidate, ...prev]);
  };

  const updateCandidate = (id: string, updates: Partial<Candidate>) => {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCandidate = (id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  };

  // Interviewer operations
  const addInterviewer = (intData: Omit<Interviewer, "id">) => {
    const newInterviewer: Interviewer = { ...intData, id: `int-${Date.now()}` };
    setInterviewers((prev) => [...prev, newInterviewer]);
  };

  const updateInterviewer = (id: string, updates: Partial<Interviewer>) => {
    setInterviewers((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const deleteInterviewer = (id: string) => {
    setInterviewers((prev) => prev.filter((i) => i.id !== id));
  };

  // Room operations
  const addRoom = (roomData: Omit<InterviewRoom, "id">) => {
    const newRoom: InterviewRoom = { ...roomData, id: `room-${Date.now()}` };
    setRooms((prev) => [...prev, newRoom]);
  };

  const updateRoom = (id: string, updates: Partial<InterviewRoom>) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const toggleRoomAvailability = (id: string) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isAvailable: !r.isAvailable } : r))
    );
  };

  const deleteRoom = (id: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
  };

  // Availability operations
  const addAvailability = (interviewerId: string, window: Omit<AvailabilityWindow, "id">) => {
    const newWindow: AvailabilityWindow = { ...window, id: `av-${Date.now()}` };
    setInterviewers((prev) =>
      prev.map((i) =>
        i.id === interviewerId
          ? { ...i, availability: [...i.availability, newWindow] }
          : i
      )
    );
  };

  const removeAvailability = (interviewerId: string, windowId: string) => {
    setInterviewers((prev) =>
      prev.map((i) =>
        i.id === interviewerId
          ? { ...i, availability: i.availability.filter((a) => a.id !== windowId) }
          : i
      )
    );
  };

  // Schedule Generation Routine
  const generateSchedule = async (driveId?: string): Promise<ScheduleGenerationResult> => {
    const targetDriveId = driveId || selectedDriveId;
    const driveToSchedule = drives.find((d) => d.id === targetDriveId) || drives[0];

    if (!driveToSchedule) {
      throw new Error("No active recruitment drive selected for schedule generation.");
    }

    const result = await runDemoScheduleGenerator({
      drive: driveToSchedule,
      candidates,
      interviewers,
      rooms,
      existingInterviews: interviews,
    });

    if (result.conflicts.length > 0) {
      setConflicts((prev) => [...result.conflicts, ...prev]);
    }

    return result;
  };

  const resolveConflict = (conflictId: string) => {
    setConflicts((prev) => prev.filter((c) => c.id !== conflictId));
  };

  const resetToDefaultData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setDrives(INITIAL_DRIVES);
    setCandidates(INITIAL_CANDIDATES);
    setInterviewers(INITIAL_INTERVIEWERS);
    setRooms(INITIAL_ROOMS);
    setInterviews(INITIAL_INTERVIEWS);
    setConflicts(INITIAL_CONFLICTS);
    setSelectedDriveId("drive-1");
  };

  return (
    <CoordinatorContext.Provider
      value={{
        drives,
        candidates,
        interviewers,
        rooms,
        interviews,
        conflicts,
        selectedDriveId,
        activeDrive,
        setSelectedDriveId,
        addDrive,
        updateDrive,
        deleteDrive,
        addCandidate,
        updateCandidate,
        deleteCandidate,
        addInterviewer,
        updateInterviewer,
        deleteInterviewer,
        addRoom,
        updateRoom,
        toggleRoomAvailability,
        deleteRoom,
        addAvailability,
        removeAvailability,
        generateSchedule,
        resolveConflict,
        resetToDefaultData,
      }}
    >
      {children}
    </CoordinatorContext.Provider>
  );
};

// oxlint-disable-next-line react/only-export-components
export const useCoordinator = (): CoordinatorContextType => {
  const context = React.useContext(CoordinatorContext);
  if (!context) {
    throw new Error("useCoordinator must be used within a CoordinatorProvider");
  }
  return context;
};
