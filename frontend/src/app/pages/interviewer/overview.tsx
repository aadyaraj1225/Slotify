import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, MapPin } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useCoordinator } from "@/context/coordinator-context";
import { Button } from "@/components/ui/button";

export const InterviewerOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const { interviewers, interviews, candidates, rooms } = useCoordinator();

  const currentInterviewer = interviewers.find(
    (i) => i.email.toLowerCase() === user?.email.toLowerCase()
  ) || interviewers[0];

  const assignedInterviews = interviews.filter((i) => i.interviewerId === currentInterviewer.id);
  const nextSession = assignedInterviews
    .filter((i) => i.status !== "cancelled")
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))[0];

  const candidateForNext = candidates.find((c) => c.id === nextSession?.candidateId);
  const roomForNext = rooms.find((r) => r.id === nextSession?.roomId);

  return (
    <div className="space-y-10 sm:space-y-12 px-6 sm:px-10 lg:px-14 py-8 sm:py-12 max-w-6xl mx-auto text-left">
      {/* Header */}
      <div className="border-b-2 border-deep-black pb-8">
        <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tight text-deep-black">
          Panelist Workspace
        </h1>
        <p className="font-body text-base text-slate-gray mt-2 max-w-2xl">
          Welcome, {user?.name || currentInterviewer.name}. Review candidate rosters, submit scoring feedback, and manage your availability windows.
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-xl border-2 border-deep-black bg-white p-6 shadow-[4px_4px_0px_#101010]">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-gray block mb-1">
            Assigned Interviews
          </span>
          <span className="font-heading text-3xl font-black text-deep-black block">
            {assignedInterviews.length}
          </span>
          <span className="font-mono text-xs text-slate-gray mt-2 block">
            Across active campus recruitment drives
          </span>
        </div>

        <div className="rounded-xl border-2 border-deep-black bg-white p-6 shadow-[4px_4px_0px_#101010]">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-gray block mb-1">
            Daily Workload Limit
          </span>
          <span className="font-heading text-3xl font-black text-sky-blue block">
            {currentInterviewer.assignedCount} / {currentInterviewer.maxDailyLoad}
          </span>
          <span className="font-mono text-xs text-slate-gray mt-2 block">
            Enforced by solver workload invariant
          </span>
        </div>

        <div className="rounded-xl border-2 border-deep-black bg-white p-6 shadow-[4px_4px_0px_#101010]">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-gray block mb-1">
            Availability Windows
          </span>
          <span className="font-heading text-3xl font-black text-deep-black block">
            {currentInterviewer.availability.length} Registered
          </span>
          <span className="font-mono text-xs text-slate-gray mt-2 block">
            Active evaluation blocks
          </span>
        </div>
      </div>

      {/* Next Assigned Candidate Session */}
      <div className="space-y-4">
        <h2 className="font-heading text-xl font-bold text-deep-black">
          Next evaluation session
        </h2>

        {nextSession ? (
          <div className="rounded-2xl border-2 border-deep-black bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#101010] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="rounded bg-sky-blue text-deep-black font-mono text-xs font-bold px-2 py-0.5 border border-deep-black">
                  {nextSession.status.toUpperCase()}
                </span>
                <span className="font-mono text-xs text-slate-gray">
                  Session #{nextSession.id}
                </span>
              </div>
              <h3 className="font-heading text-2xl font-black text-deep-black">
                {candidateForNext?.name || "Student Candidate"} ({candidateForNext?.rollNo || "Roll N/A"})
              </h3>
              <p className="font-body text-xs text-slate-gray">
                Role Target: {candidateForNext?.appliedRole}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-deep-black pt-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-gray" />
                  <span>{nextSession.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-gray" />
                  <span>{nextSession.startTime} &ndash; {nextSession.endTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-gray" />
                  <span>{roomForNext?.name || "Venue Allocated"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start md:self-center">
              <Link to="/interviewer/interviews">
                <Button variant="primary" size="md" className="gap-2 text-xs font-bold">
                  <span>Start Deliberation</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-deep-black bg-white p-8 sm:p-12 text-center shadow-[4px_4px_0px_#101010] space-y-4">
            <div className="h-12 w-12 rounded-xl bg-warm-offwhite border-2 border-deep-black text-slate-gray mx-auto flex items-center justify-center">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-heading text-lg font-bold text-deep-black">
                No active interview sessions assigned
              </h3>
              <p className="font-body text-xs text-slate-gray">
                You have fulfilled all current candidate evaluations or are awaiting recruitment drive solver generation.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Strip */}
      <div className="rounded-2xl border-2 border-deep-black bg-near-black text-white p-6 sm:p-8 shadow-[4px_4px_0px_#73D0F4] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="font-heading text-xl font-bold text-white">
            Set or update your evaluation availability
          </h3>
          <p className="font-body text-xs text-muted-gray max-w-xl">
            Ensure placement coordinators have your accurate daily blocks before constraint optimization runs.
          </p>
        </div>
        <Link to="/interviewer/availability" className="shrink-0">
          <Button variant="secondary" size="md" className="gap-2 text-xs font-bold bg-sky-blue text-deep-black hover:bg-white">
            <span>Manage Blocks</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
