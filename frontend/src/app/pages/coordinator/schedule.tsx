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
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-6 border-b border-[#E4E3DD]/80 pb-8">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-slate-gray block mb-1">
            Operational Timetable
          </span>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-3xl sm:text-4xl font-normal tracking-tight text-charcoal">
              Schedule &amp; Solver Grid
            </h1>
            <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-pale-blue text-muted-cobalt border border-pale-blue-border/70">
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
            className="gap-2 px-5 py-2.5 text-xs font-medium"
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
              className="rounded-xl border border-error-red/25 bg-[#FDF0F0]/70 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left"
            >
              <div className="flex items-start gap-3.5">
                <AlertTriangle className="h-5 w-5 text-error-red shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-heading font-medium text-sm text-charcoal flex items-center gap-2">
                    <span>{conf.title}</span>
                    <span className="font-mono text-[10px] uppercase text-error-red bg-error-red/10 px-2 py-0.5 rounded-full border border-error-red/20">
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
                  className="text-xs border-error-red/30 text-error-red hover:bg-white"
                >
                  Inspect Invariant
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => resolveConflict(conf.id)}
                  className="text-xs border-[#E4E3DD] bg-white hover:bg-warm-ivory"
                >
                  Dismiss Notice
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter and View Mode Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E4E3DD]/80">
        <div className="flex flex-wrap items-center gap-3">
          {/* Drive Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-gray">Drive:</span>
            <select
              value={driveFilter}
              onChange={(e) => setDriveFilter(e.target.value)}
              className="h-9 rounded-lg border border-[#E4E3DD] bg-[#FAF9F5] px-3 text-xs font-body text-charcoal focus:outline-none focus:border-muted-cobalt focus:bg-white transition-colors"
            >
              <option value="all">All Drives</option>
              {drives.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-gray">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border border-[#E4E3DD] bg-[#FAF9F5] px-3 text-xs font-body text-charcoal focus:outline-none focus:border-muted-cobalt focus:bg-white transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="conflict">Conflict</option>
            </select>
          </div>

          {/* Room Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-gray">Venue:</span>
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="h-9 rounded-lg border border-[#E4E3DD] bg-[#FAF9F5] px-3 text-xs font-body text-charcoal focus:outline-none focus:border-muted-cobalt focus:bg-white transition-colors"
            >
              <option value="all">All Venues</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Panelist Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-gray">Panel:</span>
            <select
              value={interviewerFilter}
              onChange={(e) => setInterviewerFilter(e.target.value)}
              className="h-9 rounded-lg border border-[#E4E3DD] bg-[#FAF9F5] px-3 text-xs font-body text-charcoal focus:outline-none focus:border-muted-cobalt focus:bg-white transition-colors"
            >
              <option value="all">All Evaluators</option>
              {interviewers.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* View Switcher: Calendar vs Table */}
        <div className="flex items-center gap-1.5 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#E4E3DD]/80 self-end lg:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono transition-colors ${
              viewMode === "calendar"
                ? "bg-pale-blue text-muted-cobalt font-medium"
                : "text-slate-gray hover:text-charcoal hover:bg-[#FAF9F5]"
            }`}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>Timetable Matrix</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono transition-colors ${
              viewMode === "table"
                ? "bg-pale-blue text-muted-cobalt font-medium"
                : "text-slate-gray hover:text-charcoal hover:bg-[#FAF9F5]"
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
            <div className="rounded-xl border border-[#E4E3DD]/80 bg-white p-16 text-center text-slate-gray text-xs">
              No interview sessions match the active filters.
            </div>
          ) : (
            dates.map((dateStr) => {
              const dayInterviews = filteredInterviews.filter((i) => i.date === dateStr);
              return (
                <div key={dateStr} className="rounded-xl border border-[#E4E3DD]/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
                  <div className="border-b border-[#E4E3DD]/80 bg-[#FAF9F5]/70 px-6 py-3.5 flex items-center justify-between">
                    <span className="font-mono text-xs font-medium text-charcoal flex items-center gap-2">
                      <CalendarIcon className="h-3.5 w-3.5 text-muted-cobalt" />
                      Date: {dateStr}
                    </span>
                    <span className="font-mono text-xs text-slate-gray">
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
                          className={`rounded-xl border p-5 space-y-3 transition-all text-left ${
                            slot.status === "conflict"
                              ? "border-error-red/40 bg-[#FDF0F0]/50"
                              : "border-[#E4E3DD]/80 bg-[#FAF9F5]/30 hover:bg-white hover:border-[#626A70]/40"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-heading font-medium text-sm text-charcoal">
                                  {candidate?.name || "Student"}
                                </span>
                                <span className="font-mono text-[10px] text-slate-gray px-1.5 py-0.5 rounded bg-warm-ivory border border-[#E4E3DD]">
                                  {candidate?.rollNo}
                                </span>
                              </div>
                              <span className="font-mono text-[10px] text-slate-gray/70 block mt-0.5">
                                {slot.id}
                              </span>
                            </div>
                            <StatusIndicator status={slot.status} size="sm" />
                          </div>

                          <div className="text-xs text-slate-gray space-y-1.5 pt-3 border-t border-[#E4E3DD]/60">
                            <div className="flex items-center gap-2 font-mono text-charcoal font-medium text-[11px]">
                              <Clock className="h-3.5 w-3.5 text-slate-gray/70 shrink-0" />
                              <span>{slot.startTime} &ndash; {slot.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2 truncate text-xs">
                              <User className="h-3.5 w-3.5 text-slate-gray/70 shrink-0" />
                              <span className="truncate">{interviewer?.name || "Panelist"}</span>
                            </div>
                            <div className="flex items-center gap-2 truncate text-xs">
                              <MapPin className="h-3.5 w-3.5 text-slate-gray/70 shrink-0" />
                              <span className="truncate">{room?.name || "Room"}</span>
                            </div>
                          </div>

                          {slot.conflictReason && (
                            <div className="rounded-lg bg-error-red/10 border border-error-red/20 p-2.5 text-[11px] text-error-red">
                              <span className="font-medium">Notice:</span> {slot.conflictReason}
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
        <div className="rounded-xl border border-[#E4E3DD]/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-body">
              <thead className="border-b border-[#E4E3DD]/80 bg-[#FAF9F5]/70 font-mono text-[11px] text-slate-gray font-normal tracking-wide">
                <tr>
                  <th className="px-6 py-3.5">Slot ID</th>
                  <th className="px-6 py-3.5">Date &amp; Time</th>
                  <th className="px-6 py-3.5">Candidate</th>
                  <th className="px-6 py-3.5">Assigned Panelist</th>
                  <th className="px-6 py-3.5">Venue / Room</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E3DD]/60">
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
                      <tr key={slot.id} className="hover:bg-warm-ivory/40 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-muted-cobalt">
                          {slot.id}
                        </td>
                        <td className="px-6 py-4 font-mono">
                          <div className="text-charcoal font-medium">{slot.date}</div>
                          <div className="text-slate-gray text-[11px]">{slot.startTime} &ndash; {slot.endTime}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-charcoal block">{candidate?.name}</span>
                          <span className="font-mono text-[10px] text-slate-gray">{candidate?.rollNo}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-gray">
                          {interviewer?.name}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-charcoal">{room?.name}</span>
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
                <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-pale-blue text-muted-cobalt border border-pale-blue-border/70">
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
                className={`rounded-xl p-4 border flex items-start gap-3 ${
                  generatorResult.success
                    ? "bg-[#EAF4EE] border-success-green/30 text-success-green"
                    : "bg-[#FDF0F0] border-error-red/30 text-error-red"
                }`}
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">
                    {generatorResult.success ? "Feasible Schedule Generated" : "Constraint Conflicts Found"}
                  </p>
                  <p className="text-xs text-charcoal/80 mt-1">
                    Allocated {generatorResult.scheduledCount} candidates. {generatorResult.conflictCount} conflict alerts registered.
                  </p>
                </div>
              </div>

              {/* Solver Execution Logs Box */}
              <div>
                <span className="text-slate-gray uppercase font-mono text-[10px] block mb-2">
                  Constraint Verification Logs
                </span>
                <div className="rounded-xl border border-[#E4E3DD] bg-charcoal text-[#F7F6F2] font-mono text-[11px] p-4 max-h-48 overflow-y-auto space-y-1">
                  {generatorResult.logs.map((line, idx) => (
                    <div key={idx} className="leading-relaxed">
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-[#FAF9F5] p-4 text-[11px] text-slate-gray border border-[#E4E3DD]">
                <span className="font-medium text-charcoal block mb-0.5">Phase 4 Backend Note</span>
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

            <div className="space-y-4 pt-4 text-xs font-body text-charcoal border-t border-[#E4E3DD]/70">
              <div>
                <span className="text-slate-gray font-mono uppercase text-[10px] block">Title:</span>
                <p className="font-medium text-sm mt-1">{selectedConflict.title}</p>
              </div>

              <div>
                <span className="text-slate-gray font-mono uppercase text-[10px] block">Violation Explanation:</span>
                <p className="mt-1 leading-relaxed bg-[#FDF0F0] p-3 rounded-lg border border-error-red/20 text-error-red">
                  {selectedConflict.description}
                </p>
              </div>

              <div>
                <span className="text-slate-gray font-mono uppercase text-[10px] block">Affected Sessions:</span>
                <div className="flex gap-2 mt-1.5">
                  {selectedConflict.affectedInterviewIds.map((id) => (
                    <span key={id} className="font-mono text-xs px-2.5 py-1 rounded bg-[#FAF9F5] border border-[#E4E3DD]">
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
