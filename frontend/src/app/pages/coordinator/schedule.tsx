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
    <div className="space-y-6 text-left">
      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-soft-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-charcoal">
              Interview Timetable & Solver Schedule
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-pale-blue text-muted-cobalt border border-pale-blue-border font-semibold">
              Live Matrix
            </span>
          </div>
          <p className="font-body text-xs sm:text-sm text-slate-gray mt-1">
            Central operational timetable. Review panel allocations, detect venue clashes, and trigger the schedule generator.
          </p>
        </div>

        {/* Primary Action Button: Generate Schedule */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            onClick={handleRunGenerator}
            disabled={isGenerating}
            className="gap-2 shadow-subtle"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Evaluating Constraints...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" aria-hidden="true" />
                <span>Generate Schedule</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Active Conflict Banners */}
      {conflicts.length > 0 && (
        <div className="space-y-2">
          {conflicts.map((conf) => (
            <div
              key={conf.id}
              className="rounded-lg border border-error-red/30 bg-error-red/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-error-red shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-heading font-bold text-xs sm:text-sm text-charcoal flex items-center gap-2">
                    <span>{conf.title}</span>
                    <span className="font-mono text-[10px] uppercase text-error-red bg-error-red/10 px-1.5 py-0.2 rounded">
                      {conf.type}
                    </span>
                  </h4>
                  <p className="text-xs text-charcoal/80 font-body mt-0.5 leading-relaxed">
                    {conf.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedConflict(conf)}
                  className="text-xs border-error-red/30 text-error-red hover:bg-error-red/10"
                >
                  Inspect Invariant
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => resolveConflict(conf.id)}
                  className="text-xs"
                >
                  Dismiss Notice
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter and View Mode Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-soft-border shadow-subtle">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Drive Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-gray">Drive:</span>
            <select
              value={driveFilter}
              onChange={(e) => setDriveFilter(e.target.value)}
              className="h-8 rounded border border-soft-border bg-[#FDFCFB] px-2 text-xs font-body text-charcoal focus:outline-none focus:ring-1 focus:ring-muted-cobalt"
            >
              <option value="all">All Drives</option>
              {drives.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-gray">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded border border-soft-border bg-[#FDFCFB] px-2 text-xs font-body text-charcoal focus:outline-none focus:ring-1 focus:ring-muted-cobalt"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="conflict">Conflict</option>
            </select>
          </div>

          {/* Room Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-gray">Room:</span>
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="h-8 rounded border border-soft-border bg-[#FDFCFB] px-2 text-xs font-body text-charcoal focus:outline-none focus:ring-1 focus:ring-muted-cobalt"
            >
              <option value="all">All Rooms</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Panelist Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-gray">Panel:</span>
            <select
              value={interviewerFilter}
              onChange={(e) => setInterviewerFilter(e.target.value)}
              className="h-8 rounded border border-soft-border bg-[#FDFCFB] px-2 text-xs font-body text-charcoal focus:outline-none focus:ring-1 focus:ring-muted-cobalt"
            >
              <option value="all">All Interviewers</option>
              {interviewers.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* View Switcher: Calendar vs Table */}
        <div className="flex items-center gap-1 border-t lg:border-t-0 pt-2 lg:pt-0 border-soft-border self-end lg:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-body transition-colors ${
              viewMode === "calendar"
                ? "bg-pale-blue text-muted-cobalt font-semibold"
                : "text-slate-gray hover:text-charcoal hover:bg-[#ECEAE4]"
            }`}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>Timetable Matrix</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-body transition-colors ${
              viewMode === "table"
                ? "bg-pale-blue text-muted-cobalt font-semibold"
                : "text-slate-gray hover:text-charcoal hover:bg-[#ECEAE4]"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            <span>Table Stream</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: TIMETABLE MATRIX */}
      {viewMode === "calendar" && (
        <div className="space-y-6">
          {dates.length === 0 ? (
            <div className="rounded-lg border border-soft-border bg-white p-12 text-center text-slate-gray text-sm">
              No interview sessions match the active filters.
            </div>
          ) : (
            dates.map((dateStr) => {
              const dayInterviews = filteredInterviews.filter((i) => i.date === dateStr);
              return (
                <div key={dateStr} className="rounded-lg border border-soft-border bg-white shadow-card overflow-hidden">
                  <div className="border-b border-soft-border bg-[#FDFCFB] px-4 py-2.5 flex items-center justify-between">
                    <span className="font-heading text-xs font-bold text-charcoal flex items-center gap-2">
                      <CalendarIcon className="h-3.5 w-3.5 text-muted-cobalt" />
                      Date: {dateStr}
                    </span>
                    <span className="font-mono text-xs text-slate-gray">
                      {dayInterviews.length} Sessions Allocated
                    </span>
                  </div>

                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dayInterviews.map((slot) => {
                      const candidate = candidates.find((c) => c.id === slot.candidateId);
                      const interviewer = interviewers.find((i) => i.id === slot.interviewerId);
                      const room = rooms.find((r) => r.id === slot.roomId);

                      return (
                        <div
                          key={slot.id}
                          className={`rounded-md border p-3.5 space-y-2.5 transition-all text-left ${
                            slot.status === "conflict"
                              ? "border-error-red/40 bg-error-red/5 ring-1 ring-error-red/30"
                              : "border-soft-border bg-white shadow-subtle hover:border-slate-gray/40"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-heading font-semibold text-xs text-charcoal">
                                  {candidate?.name || "Student"}
                                </span>
                                <span className="font-mono text-[10px] text-slate-gray px-1 rounded bg-warm-ivory">
                                  {candidate?.rollNo}
                                </span>
                              </div>
                              <span className="font-mono text-[10px] text-slate-gray block mt-0.5">
                                {slot.id}
                              </span>
                            </div>
                            <StatusIndicator status={slot.status} size="sm" />
                          </div>

                          <div className="text-[11px] text-slate-gray space-y-1 pt-2 border-t border-soft-border/60">
                            <div className="flex items-center gap-1.5 font-mono text-charcoal font-medium">
                              <Clock className="h-3 w-3 text-slate-gray shrink-0" />
                              <span>{slot.startTime} - {slot.endTime}</span>
                            </div>
                            <div className="flex items-center gap-1.5 truncate">
                              <User className="h-3 w-3 text-slate-gray shrink-0" />
                              <span className="truncate">{interviewer?.name || "Panelist"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 truncate">
                              <MapPin className="h-3 w-3 text-slate-gray shrink-0" />
                              <span className="truncate">{room?.name || "Room"}</span>
                            </div>
                          </div>

                          {slot.conflictReason && (
                            <div className="rounded bg-error-red/10 border border-error-red/20 p-2 text-[11px] text-error-red">
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
        <div className="rounded-lg border border-soft-border bg-white shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-body">
              <thead className="border-b border-soft-border bg-[#FDFCFB] font-heading font-semibold text-slate-gray uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Slot ID</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Assigned Panelist</th>
                  <th className="px-4 py-3">Room / Venue</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft-border">
                {filteredInterviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-gray text-sm">
                      No interviews scheduled. Click "Generate Schedule" to evaluate unassigned candidates.
                    </td>
                  </tr>
                ) : (
                  filteredInterviews.map((slot) => {
                    const candidate = candidates.find((c) => c.id === slot.candidateId);
                    const interviewer = interviewers.find((i) => i.id === slot.interviewerId);
                    const room = rooms.find((r) => r.id === slot.roomId);

                    return (
                      <tr key={slot.id} className="hover:bg-warm-ivory/50 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-muted-cobalt">
                          {slot.id}
                        </td>
                        <td className="px-4 py-3 font-mono">
                          <div>{slot.date}</div>
                          <div className="text-slate-gray text-[11px]">{slot.startTime} - {slot.endTime}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-charcoal block">{candidate?.name}</span>
                          <span className="font-mono text-[10px] text-slate-gray">{candidate?.rollNo}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-gray">
                          {interviewer?.name}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-charcoal">{room?.name}</span>
                        </td>
                        <td className="px-4 py-3">
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
                <DialogTitle>Schedule Generator Results</DialogTitle>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-pale-blue text-muted-cobalt border border-pale-blue-border">
                  Demo Evaluator Routine
                </span>
              </div>
              <DialogDescription>
                Simulated constraint solver execution for "{activeDrive?.name || "Target Drive"}"
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-3 text-xs font-body">
              {/* Outcome Banner */}
              <div
                className={`rounded-md p-3 border flex items-start gap-2.5 ${
                  generatorResult.success
                    ? "bg-success-green/10 border-success-green/30 text-success-green"
                    : "bg-error-red/10 border-error-red/30 text-error-red"
                }`}
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">
                    {generatorResult.success ? "Feasible Schedule Generated" : "Constraint Conflicts Found"}
                  </p>
                  <p className="text-[11px] text-charcoal/80 mt-0.5">
                    Allocated {generatorResult.scheduledCount} candidates. {generatorResult.conflictCount} conflict alerts registered.
                  </p>
                </div>
              </div>

              {/* Solver Execution Logs Box */}
              <div>
                <span className="text-slate-gray uppercase font-mono text-[10px] block mb-1">
                  Constraint Verification Logs
                </span>
                <div className="rounded border border-soft-border bg-charcoal text-[#F7F6F2] font-mono text-[11px] p-3 max-h-48 overflow-y-auto space-y-1">
                  {generatorResult.logs.map((line, idx) => (
                    <div key={idx} className="leading-tight">
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded bg-warm-ivory p-3 text-[11px] text-slate-gray border border-soft-border">
                <span className="font-semibold text-charcoal block">Phase 4 Backend Note</span>
                This routine executes frontend constraint checks. In Phase 4, this flow connects directly to the FastAPI Google OR-Tools endpoint.
              </div>
            </div>

            <DialogFooter>
              <Button variant="primary" size="sm" onClick={() => setGeneratorResult(null)}>
                Apply & Close
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
                Conflict ID: {selectedConflict.id} (Severity: {selectedConflict.severity})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-3 text-xs font-body text-charcoal">
              <div>
                <span className="text-slate-gray font-mono uppercase text-[10px] block">Title:</span>
                <p className="font-semibold text-sm mt-0.5">{selectedConflict.title}</p>
              </div>

              <div>
                <span className="text-slate-gray font-mono uppercase text-[10px] block">Violation Explanation:</span>
                <p className="mt-1 leading-relaxed bg-error-red/5 p-2.5 rounded border border-error-red/20 text-error-red">
                  {selectedConflict.description}
                </p>
              </div>

              <div>
                <span className="text-slate-gray font-mono uppercase text-[10px] block">Affected Sessions:</span>
                <div className="flex gap-1.5 mt-1">
                  {selectedConflict.affectedInterviewIds.map((id) => (
                    <span key={id} className="font-mono px-2 py-0.5 rounded bg-warm-ivory border border-soft-border">
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
