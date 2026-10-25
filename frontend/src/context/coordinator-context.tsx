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
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/auth-context";

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
  isLoadingBackend: boolean;
  setSelectedDriveId: (id: string) => void;
  addDrive: (drive: Omit<RecruitmentDrive, "id">) => Promise<string>;
  updateDrive: (id: string, updates: Partial<RecruitmentDrive>) => Promise<void>;
  deleteDrive: (id: string) => Promise<void>;
  addCandidate: (candidate: Omit<Candidate, "id">) => Promise<void>;
  updateCandidate: (id: string, updates: Partial<Candidate>) => Promise<void>;
  deleteCandidate: (id: string) => Promise<void>;
  addInterviewer: (interviewer: Omit<Interviewer, "id">) => Promise<void>;
  updateInterviewer: (id: string, updates: Partial<Interviewer>) => Promise<void>;
  deleteInterviewer: (id: string) => Promise<void>;
  addRoom: (room: Omit<InterviewRoom, "id">) => Promise<void>;
  updateRoom: (id: string, updates: Partial<InterviewRoom>) => Promise<void>;
  toggleRoomAvailability: (id: string) => void;
  deleteRoom: (id: string) => Promise<void>;
  addAvailability: (interviewerId: string, window: Omit<AvailabilityWindow, "id">) => Promise<void>;
  removeAvailability: (interviewerId: string, windowId: string) => Promise<void>;
  generateSchedule: (driveId?: string) => Promise<ScheduleGenerationResult>;
  resolveConflict: (conflictId: string) => void;
  resetToDefaultData: () => void;
  refreshFromBackend: () => Promise<void>;
}

const CoordinatorContext = React.createContext<CoordinatorContextType | undefined>(undefined);

export const CoordinatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated, user } = useAuth();
  const [isLoadingBackend, setIsLoadingBackend] = React.useState<boolean>(false);

  const [drives, setDrives] = React.useState<RecruitmentDrive[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.drives) return parsed.drives;
      }
    } catch {}
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

  // Persist local coordinator cache
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
    } catch {}
  }, [drives, candidates, interviewers, rooms, interviews, conflicts]);

  // Optionally fetch real entities from FastAPI backend if coordinator is authenticated
  const refreshFromBackend = React.useCallback(async () => {
    if (!token || user?.role !== "coordinator") return;
    setIsLoadingBackend(true);
    try {
      // 1. Fetch drives
      const backendDrives = await apiClient<any[]>("/drives", { token });
      if (backendDrives && backendDrives.length > 0) {
        const mappedDrives: RecruitmentDrive[] = backendDrives.map((bd) => ({
          id: bd.id,
          name: bd.title,
          company: bd.title.split(" - ")[0] || "Campus Partner",
          description: bd.description || "",
          startDate: bd.created_at ? bd.created_at.split("T")[0] : "2026-11-10",
          endDate: "2026-11-12",
          status: bd.status === "active" ? "active" : bd.status === "completed" ? "completed" : "planning",
          rounds: [
            { id: `rnd-${bd.id}-1`, name: "Technical Interview", type: "technical", sequenceOrder: 1, durationMinutes: 45 },
          ],
          candidateIds: [],
          interviewerIds: [],
          roomIds: [],
        }));
        setDrives((prev) => {
          // Merge avoiding duplicates
          const nonBackend = prev.filter((p) => !mappedDrives.some((m) => m.id === p.id));
          return [...mappedDrives, ...nonBackend];
        });
      }

      // 2. Fetch rooms
      const backendRooms = await apiClient<any[]>("/rooms", { token });
      if (backendRooms && backendRooms.length > 0) {
        const mappedRooms: InterviewRoom[] = backendRooms.map((br) => ({
          id: br.id,
          name: br.name,
          building: br.location?.split(",")[0] || "Academic Block",
          floor: br.location?.split(",")[1] || "1st Floor",
          capacity: br.capacity,
          equipment: ["Whiteboard", "High-speed LAN"],
          isAvailable: true,
        }));
        setRooms((prev) => {
          const nonBackend = prev.filter((p) => !mappedRooms.some((m) => m.id === p.id));
          return [...mappedRooms, ...nonBackend];
        });
      }
    } catch {
      // Backend not running or offline; local data preserved
    } finally {
      setIsLoadingBackend(false);
    }
  }, [token, user]);

  React.useEffect(() => {
    if (isAuthenticated && user?.role === "coordinator") {
      refreshFromBackend();
    }
  }, [isAuthenticated, user, refreshFromBackend]);

  const activeDrive = drives.find((d) => d.id === selectedDriveId);

  // Drive operations
  const addDrive = async (driveData: Omit<RecruitmentDrive, "id">): Promise<string> => {
    let newId = `drive-${Date.now()}`;
    if (token && user?.role === "coordinator") {
      try {
        const res = await apiClient<any>("/drives", {
          method: "POST",
          token,
          body: JSON.stringify({
            title: driveData.name,
            description: driveData.description,
            status: driveData.status === "active" ? "active" : driveData.status === "completed" ? "completed" : "draft",
          }),
        });
        if (res?.id) {
          newId = res.id;
        }
      } catch (e) {
        console.warn("Backend drive sync skipped:", e);
      }
    }

    const newDrive: RecruitmentDrive = { ...driveData, id: newId };
    setDrives((prev) => [newDrive, ...prev]);
    setSelectedDriveId(newId);
    return newId;
  };

  const updateDrive = async (id: string, updates: Partial<RecruitmentDrive>) => {
    if (token && user?.role === "coordinator" && !id.startsWith("drive-demo-")) {
      try {
        await apiClient(`/drives/${id}`, {
          method: "PATCH",
          token,
          body: JSON.stringify({
            title: updates.name,
            description: updates.description,
            status: updates.status === "active" ? "active" : updates.status === "completed" ? "completed" : "draft",
          }),
        });
      } catch (e) {
        console.warn("Backend drive update skipped:", e);
      }
    }
    setDrives((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const deleteDrive = async (id: string) => {
    if (token && user?.role === "coordinator" && !id.startsWith("drive-demo-")) {
      try {
        await apiClient(`/drives/${id}`, {
          method: "DELETE",
          token,
        });
      } catch (e) {
        console.warn("Backend drive deletion skipped:", e);
      }
    }
    setDrives((prev) => prev.filter((d) => d.id !== id));
    if (selectedDriveId === id) {
      setSelectedDriveId(drives[0]?.id || "all");
    }
  };

  // Candidate operations
  const addCandidate = async (candData: Omit<Candidate, "id">) => {
    const newCandidate: Candidate = { ...candData, id: `cand-${Date.now()}` };
    setCandidates((prev) => [newCandidate, ...prev]);
  };

  const updateCandidate = async (id: string, updates: Partial<Candidate>) => {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCandidate = async (id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  };

  // Interviewer operations
  const addInterviewer = async (intData: Omit<Interviewer, "id">) => {
    const newInterviewer: Interviewer = { ...intData, id: `int-${Date.now()}` };
    setInterviewers((prev) => [...prev, newInterviewer]);
  };

  const updateInterviewer = async (id: string, updates: Partial<Interviewer>) => {
    setInterviewers((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const deleteInterviewer = async (id: string) => {
    setInterviewers((prev) => prev.filter((i) => i.id !== id));
  };

  // Room operations
  const addRoom = async (roomData: Omit<InterviewRoom, "id">) => {
    let newId = `room-${Date.now()}`;
    if (token && user?.role === "coordinator") {
      try {
        const res = await apiClient<any>("/rooms", {
          method: "POST",
          token,
          body: JSON.stringify({
            name: roomData.name,
            location: `${roomData.building}, ${roomData.floor}`,
            capacity: roomData.capacity,
          }),
        });
        if (res?.id) newId = res.id;
      } catch (e) {
        console.warn("Backend room sync skipped:", e);
      }
    }
    const newRoom: InterviewRoom = { ...roomData, id: newId };
    setRooms((prev) => [...prev, newRoom]);
  };

  const updateRoom = async (id: string, updates: Partial<InterviewRoom>) => {
    if (token && user?.role === "coordinator" && !id.startsWith("room-demo-")) {
      try {
        await apiClient(`/rooms/${id}`, {
          method: "PATCH",
          token,
          body: JSON.stringify({
            name: updates.name,
            location: updates.building ? `${updates.building}, ${updates.floor || ""}` : undefined,
            capacity: updates.capacity,
          }),
        });
      } catch (e) {
        console.warn("Backend room update skipped:", e);
      }
    }
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const toggleRoomAvailability = (id: string) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isAvailable: !r.isAvailable } : r))
    );
  };

  const deleteRoom = async (id: string) => {
    if (token && user?.role === "coordinator" && !id.startsWith("room-demo-")) {
      try {
        await apiClient(`/rooms/${id}`, {
          method: "DELETE",
          token,
        });
      } catch (e) {
        console.warn("Backend room delete skipped:", e);
      }
    }
    setRooms((prev) => prev.filter((r) => r.id !== id));
  };

  // Availability operations
  const addAvailability = async (interviewerId: string, window: Omit<AvailabilityWindow, "id">) => {
    const newWindow: AvailabilityWindow = { ...window, id: `av-${Date.now()}` };
    setInterviewers((prev) =>
      prev.map((i) =>
        i.id === interviewerId
          ? { ...i, availability: [...i.availability, newWindow] }
          : i
      )
    );
  };

  const removeAvailability = async (interviewerId: string, windowId: string) => {
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

    // If authenticated as coordinator with token, invoke the real backend CP-SAT solver
    if (token && isAuthenticated && user?.role === "coordinator") {
      try {
        const startDate = new Date();
        startDate.setHours(9, 0, 0, 0);
        const endDate = new Date(startDate.getTime() + 8 * 60 * 60 * 1000); // 8-hour window

        const payload = {
          drive_id: driveToSchedule.id,
          round_requirement: {
            round_number: 1,
            name: driveToSchedule.rounds?.[0]?.name || "Technical Round 1",
            duration_minutes: driveToSchedule.rounds?.[0]?.durationMinutes || 60,
            slot_granularity_minutes: 30,
            required_skills: [],
            panel_size: 1,
          },
          window: {
            start_time: startDate.toISOString(),
            end_time: endDate.toISOString(),
          },
          candidate_ids: candidates.map((c) => c.id),
          interviewer_ids: interviewers.map((i) => i.id),
          room_ids: rooms.map((r) => r.id),
          max_solver_time_seconds: 10.0,
          allow_partial_generation: false,
        };

        const res = await apiClient<any>(`/drives/${driveToSchedule.id}/schedule/generate`, {
          method: "POST",
          token,
          body: JSON.stringify(payload),
        });

        if (res && res.assignments) {
          // Map backend assignments to ScheduledInterview
          const newScheduled: ScheduledInterview[] = res.assignments.map((a: any, idx: number) => ({
            id: `sched-${a.candidate_id}-${idx}`,
            driveId: driveToSchedule.id,
            roundId: `round-${a.round_number}`,
            candidateId: a.candidate_id,
            interviewerId: a.interviewer_id,
            roomId: a.room_id || "",
            date: new Date(a.start_time).toISOString().split("T")[0],
            startTime: new Date(a.start_time).toTimeString().substring(0, 5),
            endTime: new Date(a.end_time).toTimeString().substring(0, 5),
            status: "scheduled",
          }));

          setInterviews((prev) => [...prev.filter((i) => i.driveId !== driveToSchedule.id), ...newScheduled]);
          setConflicts([]);

          return {
            success: res.success,
            timestamp: new Date().toISOString(),
            scheduledCount: res.scheduled_count,
            conflictCount: 0,
            unassignedCount: res.unassigned_count,
            conflicts: [],
            logs: [
              `CP-SAT Solver Status: ${res.status.toUpperCase()}`,
              `Time: ${res.solver_time_ms ? res.solver_time_ms.toFixed(1) : 0}ms`,
              ...(res.diagnostics || []),
            ],
          };
        } else if (res && !res.success) {
          return {
            success: false,
            timestamp: new Date().toISOString(),
            scheduledCount: 0,
            conflictCount: res.diagnostics?.length || 1,
            unassignedCount: res.unassigned_count || candidates.length,
            conflicts: (res.diagnostics || []).map((diag: string, i: number) => ({
              id: `diag-${i}`,
              type: "capacity_exceeded",
              title: "Scheduling Infeasibility",
              description: diag,
              affectedInterviewIds: [],
              severity: "error",
            })),
            logs: res.diagnostics || ["No feasible schedule found."],
          };
        }
      } catch (err: any) {
        console.warn("Backend scheduler API error, falling back to local simulator:", err);
      }
    }

    // Standalone fallback generator
    const result = await runDemoScheduleGenerator({
      drive: driveToSchedule,
      candidates,
      interviewers,
      rooms,
      existingInterviews: interviews,
    });

    if (result.success) {
      setConflicts(result.conflicts);
    }

    return result;
  };


  const resolveConflict = (conflictId: string) => {
    setConflicts((prev) => prev.filter((c) => c.id !== conflictId));
  };

  const resetToDefaultData = () => {
    setDrives(INITIAL_DRIVES);
    setCandidates(INITIAL_CANDIDATES);
    setInterviewers(INITIAL_INTERVIEWERS);
    setRooms(INITIAL_ROOMS);
    setInterviews(INITIAL_INTERVIEWS);
    setConflicts(INITIAL_CONFLICTS);
    setSelectedDriveId("drive-1");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
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
        isLoadingBackend,
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
        refreshFromBackend,
      }}
    >
      {children}
    </CoordinatorContext.Provider>
  );
};

export const useCoordinator = () => {
  const context = React.useContext(CoordinatorContext);
  if (!context) {
    throw new Error("useCoordinator must be used within a CoordinatorProvider");
  }
  return context;
};
