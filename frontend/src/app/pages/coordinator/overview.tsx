import * as React from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Play,
  ArrowRight,
  AlertTriangle,
  MapPin,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useCoordinator } from "@/context/coordinator-context";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";

export const CoordinatorOverviewPage: React.FC = () => {
  const {
    drives,
    candidates,
    interviewers,
    interviews,
    conflicts,
    selectedDriveId,
    activeDrive,
  } = useCoordinator();

  const activeDrivesCount = drives.filter((d) => d.status === "active").length;
  const filteredCandidates = selectedDriveId === "all"
    ? candidates
    : candidates.filter((c) => c.driveId === selectedDriveId);

  const filteredInterviews = selectedDriveId === "all"
    ? interviews
    : interviews.filter((i) => i.driveId === selectedDriveId);

  const confirmedInterviewsCount = filteredInterviews.filter((i) => i.status === "confirmed").length;

  return (
    <div className="space-y-12 text-left">
      {/* Spacious Editorial Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-6 border-b border-[#F0EFEB] pb-8">
        <div className="space-y-1.5 max-w-xl">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-charcoal">
            Overview
          </h1>
          <p className="font-body text-sm text-slate-gray leading-relaxed">
            Monitor active recruitment drives, candidate progress, and interview panel assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/coordinator/drives?action=new">
            <Button variant="primary" size="md" className="gap-2">
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Create Drive</span>
            </Button>
          </Link>
          <Link to="/coordinator/schedule">
            <Button variant="outline" size="md" className="gap-2">
              <Play className="h-4 w-4" aria-hidden="true" />
              <span>Open Schedule</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Restrained Metric Blocks: 4 Key Figures with Generous Whitespace */}
      <div className="rounded-xl border border-soft-border/90 bg-white p-8 sm:p-10 shadow-[0_1px_3px_rgba(32,35,33,0.02)]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:divide-x lg:divide-[#F0EFEB]">
          <div className="space-y-1">
            <span className="text-xs text-slate-gray font-body font-medium">
              Active Drives
            </span>
            <p className="font-heading text-4xl font-normal text-charcoal tracking-tight">
              {activeDrivesCount}
            </p>
            <p className="text-xs text-slate-gray/80 pt-1">
              of {drives.length} drives registered
            </p>
          </div>

          <div className="space-y-1 lg:pl-8">
            <span className="text-xs text-slate-gray font-body font-medium">
              Candidates in Scope
            </span>
            <p className="font-heading text-4xl font-normal text-charcoal tracking-tight">
              {filteredCandidates.length}
            </p>
            <p className="text-xs text-slate-gray/80 pt-1">
              across current drive scope
            </p>
          </div>

          <div className="space-y-1 lg:pl-8">
            <span className="text-xs text-slate-gray font-body font-medium">
              Confirmed Interviews
            </span>
            <p className="font-heading text-4xl font-normal text-charcoal tracking-tight">
              {confirmedInterviewsCount}
            </p>
            <p className="text-xs text-slate-gray/80 pt-1">
              scheduled and verified
            </p>
          </div>

          <div className="space-y-1 lg:pl-8">
            <span className="text-xs text-slate-gray font-body font-medium">
              Conflicts Requiring Attention
            </span>
            <p className={`font-heading text-4xl font-normal tracking-tight ${
              conflicts.length > 0 ? "text-error-red" : "text-charcoal"
            }`}>
              {conflicts.length}
            </p>
            <p className="text-xs text-slate-gray/80 pt-1">
              {conflicts.length === 0 ? "invariants respected" : "room buffer warnings"}
            </p>
          </div>
        </div>
      </div>

      {/* Conflict Notice Banner if present */}
      {conflicts.length > 0 && (
        <div className="rounded-xl border border-error-red/20 bg-[#FDF0F0] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-error-red shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="font-heading text-sm font-semibold text-charcoal">
                {conflicts[0].title}
              </h4>
              <p className="text-xs text-slate-gray leading-relaxed max-w-2xl">
                {conflicts[0].description}
              </p>
            </div>
          </div>
          <Link to="/coordinator/schedule">
            <Button variant="outline" size="sm" className="border-error-red/30 text-error-red hover:bg-error-red/10 shrink-0">
              Inspect Schedule
            </Button>
          </Link>
        </div>
      )}

      {/* Main Content Layout: Upcoming Sessions & Facility Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Upcoming Sessions Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-semibold text-charcoal">
                Upcoming Interview Sessions
              </h2>
              <p className="text-xs text-slate-gray mt-0.5">
                {activeDrive ? activeDrive.name : "All Drives"}
              </p>
            </div>
            <Link
              to="/coordinator/schedule"
              className="text-xs font-medium text-muted-cobalt hover:underline flex items-center gap-1"
            >
              <span>Full timetable</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-xl border border-soft-border/90 bg-white overflow-hidden shadow-[0_1px_3px_rgba(32,35,33,0.02)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-body">
                <thead className="border-b border-[#F0EFEB] bg-[#FAF9F5] font-heading font-medium text-slate-gray text-[11px]">
                  <tr>
                    <th className="px-6 py-4">Time Window</th>
                    <th className="px-6 py-4">Candidate</th>
                    <th className="px-6 py-4">Assigned Panel</th>
                    <th className="px-6 py-4">Venue</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EFEB]">
                  {filteredInterviews.slice(0, 5).map((interview) => {
                    const candidate = candidates.find((c) => c.id === interview.candidateId);
                    const interviewer = interviewers.find((i) => i.id === interview.interviewerId);
                    return (
                      <tr key={interview.id} className="hover:bg-[#FAF9F6] transition-colors">
                        <td className="px-6 py-4 font-mono text-charcoal">
                          <div>{interview.date}</div>
                          <div className="text-[11px] text-slate-gray">
                            {interview.startTime} - {interview.endTime}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-charcoal text-sm">
                            {candidate?.name || "Student Candidate"}
                          </div>
                          <div className="font-mono text-[11px] text-slate-gray">
                            {candidate?.rollNo}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-gray">
                          {interviewer?.name || "Panelist"}
                        </td>
                        <td className="px-6 py-4 text-slate-gray">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-gray/70" />
                            {interview.roomId === "room-1" ? "Hall 3, Block B" : "Conf Room 4"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusIndicator status={interview.status} size="sm" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Operational Status Checklist */}
        <div className="lg:col-span-4 space-y-8">
          <div className="rounded-xl border border-soft-border/90 bg-white p-7 shadow-[0_1px_3px_rgba(32,35,33,0.02)] space-y-6">
            <h3 className="font-heading text-sm font-semibold text-charcoal">
              Coordination Checklist
            </h3>

            <div className="space-y-4 text-xs font-body">
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EAF4EE] text-success-green mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-medium text-charcoal">Drive Scope Verification</p>
                  <p className="text-slate-gray mt-0.5 leading-relaxed">
                    Student rosters mapped to eligible technical tracks.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FDF6E7] text-warning-amber mt-0.5">
                  <Clock className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-medium text-charcoal">Mandatory 15-Minute Buffer</p>
                  <p className="text-slate-gray mt-0.5 leading-relaxed">
                    Solver room cleaning intervals configured in settings.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EAF4EE] text-success-green mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-medium text-charcoal">Panel Workload Safeguard</p>
                  <p className="text-slate-gray mt-0.5 leading-relaxed">
                    Max daily evaluations limited to avoid interviewer fatigue.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
