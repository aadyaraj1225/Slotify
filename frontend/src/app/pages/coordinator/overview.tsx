import * as React from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Users,
  UserCheck,
  Calendar,
  AlertTriangle,
  Clock,
  Plus,
  Play,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Building,
} from "lucide-react";
import { useCoordinator } from "@/context/coordinator-context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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

  // Metrics derived dynamically from centralized state
  const activeDrivesCount = drives.filter((d) => d.status === "active").length;
  const filteredCandidates = selectedDriveId === "all"
    ? candidates
    : candidates.filter((c) => c.driveId === selectedDriveId);

  const filteredInterviews = selectedDriveId === "all"
    ? interviews
    : interviews.filter((i) => i.driveId === selectedDriveId);

  const confirmedInterviewsCount = filteredInterviews.filter((i) => i.status === "confirmed").length;
  const awaitingAssignmentCount = filteredCandidates.filter(
    (c) => c.bookingStatus === "unassigned" || c.bookingStatus === "pending"
  ).length;

  return (
    <div className="space-y-8 text-left">
      {/* Overview Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-soft-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-cobalt bg-pale-blue px-2 py-0.5 rounded font-semibold">
              Live Workspace State
            </span>
            <span className="font-mono text-xs text-slate-gray">
              {activeDrive ? activeDrive.name : "All Drives Combined"}
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-charcoal mt-1">
            Placement Coordination Overview
          </h1>
          <p className="font-body text-xs sm:text-sm text-slate-gray mt-1">
            Real-time status of candidate allocations, interviewer workload distribution, and room capacities.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/coordinator/drives?action=new">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Create Drive</span>
            </Button>
          </Link>
          <Link to="/coordinator/schedule">
            <Button variant="primary" size="sm" className="gap-1.5">
              <Play className="h-4 w-4" aria-hidden="true" />
              <span>Open Schedule</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Metric 1 */}
        <div className="rounded-lg border border-soft-border bg-white p-4 shadow-card">
          <div className="flex items-center justify-between text-slate-gray">
            <span className="font-mono text-[11px] uppercase tracking-wider">Active Drives</span>
            <Briefcase className="h-4 w-4 text-muted-cobalt" />
          </div>
          <p className="font-heading text-2xl font-bold text-charcoal mt-2">
            {activeDrivesCount}
          </p>
          <span className="text-[11px] text-slate-gray font-body">of {drives.length} total drives</span>
        </div>

        {/* Metric 2 */}
        <div className="rounded-lg border border-soft-border bg-white p-4 shadow-card">
          <div className="flex items-center justify-between text-slate-gray">
            <span className="font-mono text-[11px] uppercase tracking-wider">Candidates</span>
            <Users className="h-4 w-4 text-charcoal" />
          </div>
          <p className="font-heading text-2xl font-bold text-charcoal mt-2">
            {filteredCandidates.length}
          </p>
          <span className="text-[11px] text-slate-gray font-body">enrolled in scope</span>
        </div>

        {/* Metric 3 */}
        <div className="rounded-lg border border-soft-border bg-white p-4 shadow-card">
          <div className="flex items-center justify-between text-slate-gray">
            <span className="font-mono text-[11px] uppercase tracking-wider">Interviewers</span>
            <UserCheck className="h-4 w-4 text-charcoal" />
          </div>
          <p className="font-heading text-2xl font-bold text-charcoal mt-2">
            {interviewers.length}
          </p>
          <span className="text-[11px] text-slate-gray font-body">active panels</span>
        </div>

        {/* Metric 4 */}
        <div className="rounded-lg border border-soft-border bg-white p-4 shadow-card">
          <div className="flex items-center justify-between text-slate-gray">
            <span className="font-mono text-[11px] uppercase tracking-wider">Scheduled</span>
            <Calendar className="h-4 w-4 text-success-green" />
          </div>
          <p className="font-heading text-2xl font-bold text-charcoal mt-2">
            {confirmedInterviewsCount}
          </p>
          <span className="text-[11px] text-success-green font-medium font-body">confirmed slots</span>
        </div>

        {/* Metric 5 */}
        <div className="rounded-lg border border-soft-border bg-white p-4 shadow-card">
          <div className="flex items-center justify-between text-slate-gray">
            <span className="font-mono text-[11px] uppercase tracking-wider">Awaiting Slot</span>
            <Clock className="h-4 w-4 text-warning-amber" />
          </div>
          <p className="font-heading text-2xl font-bold text-charcoal mt-2">
            {awaitingAssignmentCount}
          </p>
          <span className="text-[11px] text-warning-amber font-medium font-body">needs solver</span>
        </div>

        {/* Metric 6 */}
        <div className="rounded-lg border border-soft-border bg-white p-4 shadow-card">
          <div className="flex items-center justify-between text-slate-gray">
            <span className="font-mono text-[11px] uppercase tracking-wider">Conflicts</span>
            <AlertTriangle className="h-4 w-4 text-error-red" />
          </div>
          <p className="font-heading text-2xl font-bold text-error-red mt-2">
            {conflicts.length}
          </p>
          <span className="text-[11px] text-error-red font-medium font-body">requires action</span>
        </div>
      </div>

      {/* Main Grid: Upcoming Interviews & Operational Sidecars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Upcoming Interviews Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-charcoal">
              Upcoming Interview Sessions
            </h2>
            <Link
              to="/coordinator/schedule"
              className="text-xs font-medium text-muted-cobalt hover:underline flex items-center gap-1"
            >
              <span>View Full Schedule</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-lg border border-soft-border bg-white shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-body">
                <thead className="border-b border-soft-border bg-[#FDFCFB] font-heading font-semibold text-slate-gray uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Time & Date</th>
                    <th className="px-4 py-3">Candidate</th>
                    <th className="px-4 py-3">Panelist</th>
                    <th className="px-4 py-3">Room</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soft-border">
                  {filteredInterviews.slice(0, 5).map((interview) => {
                    const candidate = candidates.find((c) => c.id === interview.candidateId);
                    const interviewer = interviewers.find((i) => i.id === interview.interviewerId);
                    return (
                      <tr key={interview.id} className="hover:bg-warm-ivory/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-charcoal">
                          <div>{interview.date}</div>
                          <div className="text-[11px] text-slate-gray">
                            {interview.startTime} - {interview.endTime}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-charcoal">
                            {candidate?.name || "Candidate"}
                          </div>
                          <div className="font-mono text-[10px] text-slate-gray">
                            {candidate?.rollNo}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-gray">
                          {interviewer?.name || "Panel"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 text-slate-gray">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {interview.roomId === "room-1" ? "Hall 3, Block B" : "Conf Room 4"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusIndicator status={interview.status} size="sm" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Conflict Notification Card if present */}
          {conflicts.length > 0 && (
            <div className="rounded-lg border border-error-red/30 bg-error-red/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-error-red font-heading font-bold text-sm">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Scheduling Invariant Attention Required ({conflicts.length})</span>
              </div>
              <p className="text-xs text-charcoal/90 font-body leading-relaxed">
                {conflicts[0].title}: {conflicts[0].description}
              </p>
              <div className="pt-2">
                <Link to="/coordinator/schedule">
                  <Button variant="outline" size="sm" className="border-error-red/30 text-error-red hover:bg-error-red/10">
                    Resolve Conflict in Schedule
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right 4 Cols: Coordinator Tasks and Quick Status */}
        <div className="lg:col-span-4 space-y-6">
          {/* Pending Tasks Panel */}
          <Card>
            <CardHeader className="p-4 border-b border-soft-border">
              <CardTitle className="text-sm">Pending Coordinator Tasks</CardTitle>
              <CardDescription>Mandatory actions before drive lock-in</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-2.5 text-xs font-body">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-warning-amber/10 text-warning-amber mt-0.5">
                  <Clock className="h-3 w-3" />
                </div>
                <div>
                  <p className="font-semibold text-charcoal">Verify Room Buffers</p>
                  <p className="text-slate-gray text-[11px]">
                    Ensure 15m cleaning time between Hall 3 interviews.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs font-body">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-muted-cobalt/10 text-muted-cobalt mt-0.5">
                  <UserCheck className="h-3 w-3" />
                </div>
                <div>
                  <p className="font-semibold text-charcoal">Review Panel Qualifications</p>
                  <p className="text-slate-gray text-[11px]">
                    3 interviewers need domain tags updated for Round 2.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs font-body">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-success-green/10 text-success-green mt-0.5">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
                <div>
                  <p className="font-semibold text-charcoal">Confirm Drive Dates</p>
                  <p className="text-slate-gray text-[11px]">
                    Google campus drive dates approved by Dean's office.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Drive Status Summary */}
          <Card>
            <CardHeader className="p-4 border-b border-soft-border">
              <CardTitle className="text-sm">Campus Facility Status</CardTitle>
              <CardDescription>Interview venue allocation</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-xs font-body">
              <div className="flex items-center justify-between py-1 border-b border-soft-border/50">
                <span className="flex items-center gap-1.5 text-charcoal">
                  <Building className="h-3.5 w-3.5 text-slate-gray" />
                  Academic Complex B
                </span>
                <span className="font-mono text-success-green font-medium">Ready (Hall 3)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-soft-border/50">
                <span className="flex items-center gap-1.5 text-charcoal">
                  <Building className="h-3.5 w-3.5 text-slate-gray" />
                  Student Activity Center
                </span>
                <span className="font-mono text-success-green font-medium">Ready (Room 4)</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-1.5 text-charcoal">
                  <Building className="h-3.5 w-3.5 text-slate-gray" />
                  Computing Center
                </span>
                <span className="font-mono text-slate-gray">Auditorium Lab Offline</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
