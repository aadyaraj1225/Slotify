import * as React from "react";
import {
  Calendar as CalendarIcon,
  List,
  Play,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { useCoordinator } from "@/context/coordinator-context";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import type { ScheduleGenerationResult, ScheduleConflict } from "@/types/coordinator";

export const SchedulePage: React.FC = () => {
  const {
    interviews,
    candidates,
    interviewers,
    rooms,
    drives,
    conflicts,
    selectedDriveId,
    activeDrive,
    generateSchedule,
    resolveConflict,
  } = useCoordinator();

  const [viewMode, setViewMode] = React.useState<"calendar" | "table">("calendar");

  // Filters
  const [driveFilter, setDriveFilter] = React.useState(selectedDriveId);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [roomFilter, setRoomFilter] = React.useState("all");
  const [interviewerFilter, setInterviewerFilter] = React.useState("all");

  // Generator Execution Modal State
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatorResult, setGeneratorResult] = React.useState<ScheduleGenerationResult | null>(null);
  const [selectedConflict, setSelectedConflict] = React.useState<ScheduleConflict | null>(null);

  const filteredInterviews = interviews.filter((interview) => {
    const matchesDrive = driveFilter === "all" || interview.driveId === driveFilter;
    const matchesStatus = statusFilter === "all" || interview.status === statusFilter;
    const matchesRoom = roomFilter === "all" || interview.roomId === roomFilter;
    const matchesInterviewer = interviewerFilter === "all" || interview.interviewerId === interviewerFilter;
    return matchesDrive && matchesStatus && matchesRoom && matchesInterviewer;
  });

  const handleRunGenerator = async () => {
    setIsGenerating(true);
    setGeneratorResult(null);

    try {
      const result = await generateSchedule(driveFilter === "all" ? undefined : driveFilter);
      setGeneratorResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Group interviews by Date and Room for calendar matrix view
  const dates = Array.from(new Set(filteredInterviews.map((i) => i.date))).sort();

  return (
    <div className="px-6 sm:px-10 lg:px-14 py-8 sm:py-12 max-w-7xl mx-auto space-y-10 text-left">
      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-6 border-b-2 border-deep-black pb-8">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-slate-gray block mb-1">
            Operational Timetable
          </span>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-tight text-deep-black">
              Schedule &amp; Solver Grid
            </h1>
            <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded bg-electric-lime text-deep-black border-2 border-deep-black shadow-[2px_2px_0px_#101010]">
              Live Matrix
            </span>
          </div>
          <p className="font-body text-sm text-slate-gray mt-1.5 max-w-xl">
            Review allocated panel sessions, inspect invariant violations, and execute the constraint solver.
          </p>
        </div>

        {/* Primary Action Button: Generate Schedule */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Button
            variant="primary"
            size="md"
            onClick={handleRunGenerator}
            disabled={isGenerating}
            className="gap-2 px-5 py-2.5 text-xs font-bold"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Evaluating Constraints...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Execute Solver Routine</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Active Conflict Banners */}
      {conflicts.length > 0 && (
        <div className="space-y-3">
          {conflicts.map((conf) => (
            <div
              key={conf.id}
              className="rounded-xl border-2 border-deep-black bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left shadow-[4px_4px_0px_#FF6262]"
            >
              <div className="flex items-start gap-3.5">
                <AlertTriangle className="h-5 w-5 text-error-red shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-heading font-black text-sm text-deep-black flex items-center gap-2">
                    <span>{conf.title}</span>
                    <span className="font-mono text-[10px] uppercase font-bold text-deep-black bg-error-red/20 px-2 py-0.5 rounded border border-error-red">
                      {conf.type}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-gray font-body mt-1 leading-relaxed max-w-2xl">
                    {conf.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedConflict(conf)}
                  className="text-xs border-2 border-error-red text-error-red hover:bg-error-red/10"
                >
                  Inspect Invariant
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => resolveConflict(conf.id)}
                  className="text-xs border-2 border-deep-black bg-white hover:bg-warm-offwhite"
                >
                  Dismiss Notice
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter and View Mode Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border-2 border-deep-black shadow-[4px_4px_0px_#101010]">
        <div className="flex flex-wrap items-center gap-3">
          {/* Drive Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-gray">Drive:</span>
            <select
              value={driveFilter}
              onChange={(e) => setDriveFilter(e.target.value)}
              className="h-9 rounded-lg border-2 border-deep-black bg-warm-offwhite px-3 text-xs font-body font-medium text-deep-black focus:outline-none focus:ring-2 focus:ring-electric-lime transition-colors"
            >
              <option value="all">All Drives</option>
              {drives.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-gray">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border-2 border-deep-black bg-warm-offwhite px-3 text-xs font-body font-medium text-deep-black focus:outline-none focus:ring-2 focus:ring-electric-lime transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="conflict">Conflict</option>
            </select>
          </div>

          {/* Room Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-gray">Venue:</span>
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="h-9 rounded-lg border-2 border-deep-black bg-warm-offwhite px-3 text-xs font-body font-medium text-deep-black focus:outline-none focus:ring-2 focus:ring-electric-lime transition-colors"
            >
              <option value="all">All Venues</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Panelist Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-gray">Panel:</span>
            <select
              value={interviewerFilter}
              onChange={(e) => setInterviewerFilter(e.target.value)}
              className="h-9 rounded-lg border-2 border-deep-black bg-warm-offwhite px-3 text-xs font-body font-medium text-deep-black focus:outline-none focus:ring-2 focus:ring-electric-lime transition-colors"
            >
              <option value="all">All Evaluators</option>
              {interviewers.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* View Switcher: Calendar vs Table */}
        <div className="flex items-center gap-1.5 border-t lg:border-t-0 pt-3 lg:pt-0 border-deep-black self-end lg:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono border-2 border-deep-black transition-colors ${
              viewMode === "calendar"
                ? "bg-electric-lime text-deep-black font-bold shadow-[2px_2px_0px_#101010]"
                : "text-slate-gray bg-warm-offwhite hover:text-deep-black"
            }`}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>Timetable Matrix</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono border-2 border-deep-black transition-colors ${
              viewMode === "table"
                ? "bg-electric-lime text-deep-black font-bold shadow-[2px_2px_0px_#101010]"
                : "text-slate-gray bg-warm-offwhite hover:text-deep-black"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            <span>Stream View</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: TIMETABLE MATRIX */}
      {viewMode === "calendar" && (
        <div className="space-y-6">
          {dates.length === 0 ? (
            <div className="rounded-xl border-2 border-deep-black bg-white p-16 text-center text-slate-gray text-xs shadow-[4px_4px_0px_#101010]">
              No interview sessions match the active filters.
            </div>
          ) : (
            dates.map((dateStr) => {
              const dayInterviews = filteredInterviews.filter((i) => i.date === dateStr);
              return (
                <div key={dateStr} className="rounded-xl border-2 border-deep-black bg-white shadow-[4px_4px_0px_#101010] overflow-hidden">
                  <div className="border-b-2 border-deep-black bg-warm-offwhite px-6 py-3.5 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-deep-black flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-hot-pink" />
                      Date: {dateStr}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-gray">
                      {dayInterviews.length} Sessions Allocated
                    </span>
                  </div>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {dayInterviews.map((slot) => {
                      const candidate = candidates.find((c) => c.id === slot.candidateId);
                      const interviewer = interviewers.find((i) => i.id === slot.interviewerId);
                      const room = rooms.find((r) => r.id === slot.roomId);

                      return (
                        <div
                          key={slot.id}
                          className={`rounded-xl border-2 p-5 space-y-3 transition-all text-left ${
                            slot.status === "conflict"
                              ? "border-error-red bg-white shadow-[4px_4px_0px_#FF6262]"
                              : "border-deep-black bg-warm-offwhite hover:bg-white shadow-[3px_3px_0px_#101010]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-heading font-black text-sm text-deep-black">
                                  {candidate?.name || "Student"}
                                </span>
                                <span className="font-mono text-[10px] font-bold text-deep-black px-1.5 py-0.5 rounded bg-white border border-deep-black">
                                  {candidate?.rollNo}
                                </span>
                              </div>
                              <span className="font-mono text-[10px] text-slate-gray block mt-0.5">
                                {slot.id}
                              </span>
                            </div>
                            <StatusIndicator status={slot.status} size="sm" />
                          </div>

                          <div className="text-xs text-slate-gray space-y-1.5 pt-3 border-t-2 border-deep-black/10">
                            <div className="flex items-center gap-2 font-mono text-deep-black font-bold text-[11px]">
                              <Clock className="h-3.5 w-3.5 text-deep-black shrink-0" />
                              <span>{slot.startTime} &ndash; {slot.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2 truncate text-xs text-deep-black">
                              <User className="h-3.5 w-3.5 text-slate-gray shrink-0" />
                              <span className="truncate">{interviewer?.name || "Panelist"}</span>
                            </div>
                            <div className="flex items-center gap-2 truncate text-xs text-deep-black">
                              <MapPin className="h-3.5 w-3.5 text-slate-gray shrink-0" />
                              <span className="truncate">{room?.name || "Room"}</span>
                            </div>
                          </div>

                          {slot.conflictReason && (
                            <div className="rounded-lg bg-error-red/10 border border-error-red p-2.5 text-[11px] font-medium text-error-red">
                              <span className="font-bold">Notice:</span> {slot.conflictReason}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: TABLE STREAM */}
      {viewMode === "table" && (
        <div className="rounded-xl border-2 border-deep-black bg-white shadow-[4px_4px_0px_#101010] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-body">
              <thead className="border-b-2 border-deep-black bg-warm-offwhite font-mono text-[11px] text-deep-black font-bold tracking-wide">
                <tr>
                  <th className="px-6 py-3.5">Slot ID</th>
                  <th className="px-6 py-3.5">Date &amp; Time</th>
                  <th className="px-6 py-3.5">Candidate</th>
                  <th className="px-6 py-3.5">Assigned Panelist</th>
                  <th className="px-6 py-3.5">Venue / Room</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-deep-black/10">
                {filteredInterviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-gray text-xs">
                      No interviews scheduled. Click "Execute Solver Routine" to evaluate unassigned candidates.
                    </td>
                  </tr>
                ) : (
                  filteredInterviews.map((slot) => {
                    const candidate = candidates.find((c) => c.id === slot.candidateId);
                    const interviewer = interviewers.find((i) => i.id === slot.interviewerId);
                    const room = rooms.find((r) => r.id === slot.roomId);

                    return (
                      <tr key={slot.id} className="hover:bg-warm-offwhite transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-deep-black">
                          {slot.id}
                        </td>
                        <td className="px-6 py-4 font-mono">
                          <div className="text-deep-black font-bold">{slot.date}</div>
                          <div className="text-slate-gray text-[11px]">{slot.startTime} &ndash; {slot.endTime}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-deep-black block">{candidate?.name}</span>
                          <span className="font-mono text-[10px] text-slate-gray">{candidate?.rollNo}</span>
                        </td>
                        <td className="px-6 py-4 text-deep-black font-medium">
                          {interviewer?.name}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-deep-black">{room?.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusIndicator status={slot.status} size="sm" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generator Results Modal */}
      {generatorResult && (
        <Dialog open={true} onOpenChange={() => setGeneratorResult(null)}>
          <DialogContent maxWidth="lg" onClose={() => setGeneratorResult(null)}>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <DialogTitle>Constraint Solver Routine Results</DialogTitle>
                <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded bg-electric-lime text-deep-black border border-deep-black shadow-[1px_1px_0px_#101010]">
                  Automated Check
                </span>
              </div>
              <DialogDescription>
                Simulated solver execution run for &ldquo;{activeDrive?.name || "Active Recruitment Drive"}&rdquo;
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 pt-4 text-xs font-body">
              {/* Outcome Banner */}
              <div
                className={`rounded-xl p-4 border-2 border-deep-black flex items-start gap-3 shadow-[3px_3px_0px_#101010] ${
                  generatorResult.success
                    ? "bg-[#D7FF35]/20 text-deep-black"
                    : "bg-[#FF6262]/20 text-deep-black"
                }`}
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-deep-black" />
                <div>
                  <p className="font-bold text-sm">
                    {generatorResult.success ? "Feasible Schedule Generated" : "Constraint Conflicts Found"}
                  </p>
                  <p className="text-xs text-deep-black mt-1">
                    Allocated {generatorResult.scheduledCount} candidates. {generatorResult.conflictCount} conflict alerts registered.
                  </p>
                </div>
              </div>

              {/* Solver Execution Logs Box */}
              <div>
                <span className="text-deep-black font-bold uppercase font-mono text-[10px] block mb-2">
                  Constraint Verification Logs
                </span>
                <div className="rounded-xl border-2 border-deep-black bg-deep-black text-electric-lime font-mono text-[11px] p-4 max-h-48 overflow-y-auto space-y-1 shadow-[3px_3px_0px_#101010]">
                  {generatorResult.logs.map((line, idx) => (
                    <div key={idx} className="leading-relaxed">
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-warm-offwhite p-4 text-[11px] text-slate-gray border-2 border-deep-black">
                <span className="font-bold text-deep-black block mb-0.5">Phase 4 Backend Note</span>
                This routine executes frontend constraint checks. In Phase 4, this flow connects directly to the FastAPI Google OR-Tools endpoint.
              </div>
            </div>

            <DialogFooter>
              <Button variant="primary" size="sm" onClick={() => setGeneratorResult(null)}>
                Apply &amp; Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Conflict Inspector Modal */}
      {selectedConflict && (
        <Dialog open={true} onOpenChange={() => setSelectedConflict(null)}>
          <DialogContent maxWidth="md" onClose={() => setSelectedConflict(null)}>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-error-red" />
                <DialogTitle>Constraint Invariant Violation</DialogTitle>
              </div>
              <DialogDescription>
                Conflict ID: {selectedConflict.id} &middot; Severity: {selectedConflict.severity}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4 text-xs font-body text-deep-black border-t-2 border-deep-black">
              <div>
                <span className="text-slate-gray font-mono uppercase text-[10px] font-bold block">Title:</span>
                <p className="font-bold text-sm mt-1 text-deep-black">{selectedConflict.title}</p>
              </div>

              <div>
                <span className="text-slate-gray font-mono uppercase text-[10px] font-bold block">Violation Explanation:</span>
                <p className="mt-1 leading-relaxed bg-[#FF6262]/20 p-3 rounded-lg border-2 border-error-red text-deep-black font-medium">
                  {selectedConflict.description}
                </p>
              </div>

              <div>
                <span className="text-slate-gray font-mono uppercase text-[10px] font-bold block">Affected Sessions:</span>
                <div className="flex gap-2 mt-1.5">
                  {selectedConflict.affectedInterviewIds.map((id) => (
                    <span key={id} className="font-mono text-xs px-2.5 py-1 rounded bg-warm-offwhite border-2 border-deep-black font-bold">
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  resolveConflict(selectedConflict.id);
                  setSelectedConflict(null);
                }}
              >
                Mark as Resolved
              </Button>
              <Button variant="primary" size="sm" onClick={() => setSelectedConflict(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
