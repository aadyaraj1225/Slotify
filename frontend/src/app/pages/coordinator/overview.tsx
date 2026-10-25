import * as React from "react";
import { Link } from "react-router-dom";
import { Plus, ArrowRight, MapPin, Clock } from "lucide-react";
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
    <div className="space-y-12 sm:space-y-16 text-left pb-16">
      {/* 1. Page Greeting & Primary Action */}
      <section className="px-6 sm:px-10 lg:px-14 pt-8 sm:pt-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6">
          <div className="space-y-2 max-w-xl">
            <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-deep-black">
              Overview
            </h1>
            <p className="font-body text-base text-slate-gray">
              Campus recruitment coordination and interview schedule status.
            </p>
          </div>

          <div>
            <Link to="/coordinator/drives?action=new">
              <Button variant="primary" size="lg" className="gap-2">
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Create Recruitment Drive</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Bold High-Contrast Summary Metrics Strip */}
      <section className="bg-near-black border-y-2 border-deep-black text-white px-6 sm:px-10 lg:px-14 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <div className="space-y-1.5">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-gray block">
                Active Drives
              </span>
              <p className="font-mono text-4xl sm:text-5xl font-bold text-electric-lime tracking-tight">
                {activeDrivesCount}
              </p>
              <p className="font-mono text-xs text-muted-gray pt-1">
                of {drives.length} drives configured
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-gray block">
                Registered Candidates
              </span>
              <p className="font-mono text-4xl sm:text-5xl font-bold text-sky-blue tracking-tight">
                {filteredCandidates.length}
              </p>
              <p className="font-mono text-xs text-muted-gray pt-1">
                in active interview pipelines
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-gray block">
                Confirmed Interviews
              </span>
              <p className="font-mono text-4xl sm:text-5xl font-bold text-white tracking-tight">
                {confirmedInterviewsCount}
              </p>
              <p className="font-mono text-xs text-muted-gray pt-1">
                slots locked in timetable
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-gray block">
                System Invariants
              </span>
              <p className={`font-mono text-4xl sm:text-5xl font-bold tracking-tight ${
                conflicts.length > 0 ? "text-error-red" : "text-hot-pink"
              }`}>
                {conflicts.length === 0 ? "Clean" : `${conflicts.length} Notice`}
              </p>
              <p className="font-mono text-xs text-muted-gray pt-1">
                {conflicts.length === 0 ? "zero constraint collisions" : "room buffer collision detected"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Clean White Section: Upcoming Interviews */}
      <section className="px-6 sm:px-10 lg:px-14">
        <div className="max-w-7xl mx-auto bg-white rounded-2xl border-2 border-deep-black p-8 sm:p-10 shadow-[4px_4px_0px_#101010]">
          <div className="flex items-center justify-between pb-6 border-b-2 border-deep-black mb-6">
            <div>
              <h2 className="font-heading text-xl font-bold text-deep-black uppercase tracking-wider">
                Upcoming Interviews
              </h2>
              <p className="text-xs text-slate-gray mt-1">
                Next scheduled panel sessions for active drives.
              </p>
            </div>

            <Link
              to="/coordinator/schedule"
              className="text-xs font-mono font-bold text-deep-black hover:text-hot-pink flex items-center gap-1.5 uppercase transition-colors"
            >
              <span>Full Schedule</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-body">
              <thead className="font-mono text-[11px] text-deep-black uppercase tracking-wider border-b-2 border-deep-black/10">
                <tr>
                  <th className="py-3 pr-6 font-bold">Date &amp; Time</th>
                  <th className="py-3 px-6 font-bold">Candidate</th>
                  <th className="py-3 px-6 font-bold">Evaluator Panel</th>
                  <th className="py-3 px-6 font-bold">Venue</th>
                  <th className="py-3 pl-6 text-right font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-deep-black/10">
                {filteredInterviews.slice(0, 4).map((interview) => {
                  const candidate = candidates.find((c) => c.id === interview.candidateId);
                  const interviewer = interviewers.find((i) => i.id === interview.interviewerId);
                  return (
                    <tr key={interview.id} className="hover:bg-[#FAF9F5] transition-colors">
                      <td className="py-4 pr-6 font-mono text-deep-black">
                        <div className="font-bold">{interview.date}</div>
                        <div className="text-[11px] text-slate-gray flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3 text-slate-gray/70" />
                          <span>{interview.startTime} &ndash; {interview.endTime}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-deep-black text-sm">
                          {candidate?.name || "Student Candidate"}
                        </div>
                        <div className="font-mono text-[11px] text-slate-gray mt-0.5">
                          {candidate?.rollNo}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-deep-black font-medium">
                        {interviewer?.name || "Panelist"}
                      </td>
                      <td className="py-4 px-6 text-slate-gray">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-gray/70" />
                          {interview.roomId === "room-1" ? "Hall 3, Block B" : "Conf Room 4"}
                        </span>
                      </td>
                      <td className="py-4 pl-6 text-right">
                        <StatusIndicator status={interview.status} size="sm" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
