import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, MapPin } from "lucide-react";
import { useCandidate } from "@/context/candidate-context";
import { Button } from "@/components/ui/button";

export const CandidateOverviewPage: React.FC = () => {
  const { activeCandidate, myInterviews, availableSlots } = useCandidate();

  // Find next upcoming interview
  const nextInterview = myInterviews
    .filter((i) => i.status !== "cancelled")
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))[0];

  const pendingBookingsCount = activeCandidate.bookingStatus === "pending" || activeCandidate.bookingStatus === "unassigned" ? 1 : 0;
  const confirmedCount = myInterviews.filter((i) => i.status === "confirmed").length;

  return (
    <div className="space-y-10 sm:space-y-12 px-6 sm:px-10 lg:px-14 py-8 sm:py-12 max-w-6xl mx-auto text-left">
      {/* 1. Header & Welcome Greeting */}
      <div className="border-b-2 border-deep-black pb-8">
        <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tight text-deep-black">
          Your interview journey
        </h1>
        <p className="font-body text-base text-slate-gray mt-2 max-w-2xl">
          Welcome back, {activeCandidate.name.split(" ")[0]}. Review your scheduled campus assessments and lock in eligible trial slots.
        </p>
      </div>

      {/* 2. Exactly 3 Compact Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-xl border-2 border-deep-black bg-white p-6 shadow-[4px_4px_0px_#101010]">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-gray block mb-1">
            Active Drive
          </span>
          <span className="font-heading text-xl font-bold text-deep-black block truncate">
            {activeCandidate.appliedRole}
          </span>
          <span className="font-mono text-xs text-slate-gray mt-2 block">
            Stage: {activeCandidate.currentStage}
          </span>
        </div>

        <div className="rounded-xl border-2 border-deep-black bg-white p-6 shadow-[4px_4px_0px_#101010]">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-gray block mb-1">
            Confirmed Sessions
          </span>
          <span className="font-heading text-3xl font-black text-deep-black block">
            {confirmedCount}
          </span>
          <span className="font-mono text-xs text-slate-gray mt-2 block">
            {confirmedCount > 0 ? "Panel locked in" : "No sessions confirmed yet"}
          </span>
        </div>

        <div className="rounded-xl border-2 border-deep-black bg-white p-6 shadow-[4px_4px_0px_#101010]">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-gray block mb-1">
            Booking Actions
          </span>
          <span className="font-heading text-3xl font-black text-hot-pink block">
            {pendingBookingsCount > 0 ? `${pendingBookingsCount} Action` : "Up to date"}
          </span>
          <span className="font-mono text-xs text-slate-gray mt-2 block">
            {availableSlots.length} available slots open
          </span>
        </div>
      </div>

      {/* 3. Next Upcoming Interview Card OR Empty State */}
      <div className="space-y-4">
        <h2 className="font-heading text-xl font-bold text-deep-black">
          Next upcoming session
        </h2>

        {nextInterview ? (
          <div className="rounded-2xl border-2 border-deep-black bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#101010] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="rounded bg-electric-lime text-deep-black font-mono text-xs font-bold px-2 py-0.5 border border-deep-black">
                  {nextInterview.status.toUpperCase()}
                </span>
                <span className="font-mono text-xs text-slate-gray">
                  Slot #{nextInterview.id}
                </span>
              </div>
              <h3 className="font-heading text-2xl font-black text-deep-black">
                {activeCandidate.currentStage}
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-deep-black pt-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-gray" />
                  <span>{nextInterview.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-gray" />
                  <span>{nextInterview.startTime} &ndash; {nextInterview.endTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-gray" />
                  <span>Room venue assigned</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start md:self-center">
              <Link to="/candidate/interviews">
                <Button variant="outline" size="md" className="gap-2 text-xs font-bold border-2 border-deep-black">
                  <span>View Details</span>
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
                No upcoming interview scheduled
              </h3>
              <p className="font-body text-xs text-slate-gray">
                You currently do not have any confirmed interview appointments on your schedule.
              </p>
            </div>
            {availableSlots.length > 0 && (
              <div className="pt-2">
                <Link to="/candidate/available-slots">
                  <Button variant="primary" size="md" className="gap-2 text-xs font-bold">
                    <span>Browse Open Slots</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. One Clear Booking Action Callout */}
      {availableSlots.length > 0 && (
        <div className="rounded-2xl border-2 border-deep-black bg-near-black text-white p-6 sm:p-8 shadow-[4px_4px_0px_#D7FF35] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="font-heading text-xl font-bold text-white">
              Self-booking window is active
            </h3>
            <p className="font-body text-xs text-muted-gray max-w-xl">
              There are {availableSlots.length} eligible evaluation openings available for your current assessment stage. Reserve your preferred time slot early.
            </p>
          </div>
          <Link to="/candidate/available-slots" className="shrink-0">
            <Button variant="primary" size="md" className="gap-2 text-xs font-bold">
              <span>View Available Slots</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};
