import * as React from "react";
import { Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useCoordinator } from "@/context/coordinator-context";
import { StatusIndicator } from "@/components/ui/status-indicator";

export const InterviewerSchedulePage: React.FC = () => {
  const { user } = useAuth();
  const { interviewers, interviews, candidates, rooms, drives } = useCoordinator();

  const currentInterviewer = interviewers.find(
    (i) => i.email.toLowerCase() === user?.email.toLowerCase()
  ) || interviewers[0];

  const assignedInterviews = interviews.filter((i) => i.interviewerId === currentInterviewer.id);
  const dates = Array.from(new Set(assignedInterviews.map((i) => i.date))).sort();

  return (
    <div className="space-y-10 sm:space-y-12 px-6 sm:px-10 lg:px-14 py-8 sm:py-12 max-w-6xl mx-auto text-left">
      {/* Header */}
      <div className="border-b-2 border-deep-black pb-8">
        <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tight text-deep-black">
          My Schedule
        </h1>
        <p className="font-body text-base text-slate-gray mt-2 max-w-2xl">
          Consolidated timetable matrix for your technical panels and behavioral rounds.
        </p>
      </div>

      {/* Date Sessions Feed */}
      {dates.length === 0 ? (
        <div className="rounded-2xl border-2 border-deep-black bg-white p-12 text-center shadow-[4px_4px_0px_#101010] space-y-4">
          <div className="h-12 w-12 rounded-xl bg-warm-offwhite border-2 border-deep-black text-slate-gray mx-auto flex items-center justify-center">
            <CalendarIcon className="h-6 w-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-heading text-lg font-bold text-deep-black">
              No sessions scheduled
            </h3>
            <p className="font-body text-xs text-slate-gray">
              You do not have any candidate evaluations scheduled across active drives.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {dates.map((dateStr) => {
            const daySessions = assignedInterviews.filter((i) => i.date === dateStr);
            return (
              <div key={dateStr} className="rounded-2xl border-2 border-deep-black bg-white shadow-[4px_4px_0px_#101010] overflow-hidden">
                <div className="bg-warm-offwhite border-b-2 border-deep-black px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-deep-black">
                    <CalendarIcon className="h-4 w-4 text-sky-blue" />
                    <span>Date: {dateStr}</span>
                  </div>
                  <span className="font-mono text-xs text-slate-gray">
                    {daySessions.length} Evaluation Sessions
                  </span>
                </div>

                <div className="p-6 divide-y-2 divide-deep-black/10">
                  {daySessions.map((session) => {
                    const candidate = candidates.find((c) => c.id === session.candidateId);
                    const room = rooms.find((r) => r.id === session.roomId);
                    const drive = drives.find((d) => d.id === session.driveId);

                    return (
                      <div key={session.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3">
                            <span className="font-heading text-base font-bold text-deep-black">
                              {candidate?.name || "Student"}
                            </span>
                            <span className="font-mono text-xs font-bold text-deep-black px-2 py-0.5 rounded bg-warm-offwhite border border-deep-black">
                              {candidate?.rollNo}
                            </span>
                            <StatusIndicator status={session.status} size="sm" />
                          </div>
                          <p className="font-body text-xs text-slate-gray">
                            {drive?.name} &middot; {candidate?.appliedRole}
                          </p>
                        </div>

                        <div className="flex items-center gap-6 font-mono text-xs text-deep-black">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-slate-gray" />
                            <span>{session.startTime} &ndash; {session.endTime}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-slate-gray" />
                            <span>{room?.name || "Room"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
