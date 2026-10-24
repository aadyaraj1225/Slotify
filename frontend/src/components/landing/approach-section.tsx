import * as React from "react";
import { Check, SlidersHorizontal, ShieldAlert, Award } from "lucide-react";

export const ApproachSection: React.FC = () => {
  const mandatoryRules = [
    {
      title: "Zero Overlaps Invariant",
      detail: "No candidate, interviewer, or room is ever assigned to simultaneous or overlapping interview sessions.",
    },
    {
      title: "Interviewer Qualification",
      detail: "Interviewers are matched strictly to their verified evaluation domains (e.g. Distributed Systems leads evaluate Round 2).",
    },
    {
      title: "Spatial Room Capacity",
      detail: "Rooms and interview cabins are booked according to seating constraints, equipment readiness, and campus operating hours.",
    },
    {
      title: "Strict Round Sequencing",
      detail: "Candidates can only advance to subsequent technical and HR evaluations after satisfying prerequisite assessment stages.",
    },
  ];

  const optimizationPreferences = [
    {
      title: "Interviewer Load Balancing",
      detail: "Distributes interviews equitably across panels to prevent interviewer exhaustion and maintain consistent scoring.",
    },
    {
      title: "Candidate Slot Preferences",
      detail: "Considers candidate travel logistics, academic timetables, and preferred time windows wherever feasible.",
    },
    {
      title: "Gap Minimization",
      detail: "Schedules interviews in contiguous blocks to eliminate dead idle hours for visiting recruitment teams.",
    },
    {
      title: "Minimal Disruption Recovery",
      detail: "When a cancellation happens, changes are localized to preserve existing confirmed appointments without cascading resets.",
    },
  ];

  return (
    <section id="approach" className="py-16 sm:py-24 bg-warm-ivory">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-3 text-left">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-cobalt">
            Constraint Architecture
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-charcoal leading-tight">
            A schedule built around real constraints.
          </h2>
          <p className="font-body text-base text-slate-gray leading-relaxed">
            Effective interview scheduling is not about filling calendar blocks at random. Slotify distinguishes
            between non-negotiable operational requirements and optimization goals to deliver conflict-free timetables.
          </p>
        </div>

        {/* Comparison Grid: Mandatory Requirements vs Optimization Preferences */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {/* Card 1: Mandatory Requirements */}
          <div className="rounded-lg border border-soft-border bg-white p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex items-center gap-3 border-b border-soft-border pb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded bg-error-red/10 text-error-red">
                <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-charcoal">
                  Mandatory Requirements
                </h3>
                <p className="font-body text-xs text-slate-gray">
                  Hard operational rules that must never be violated.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {mandatoryRules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-error-red/10 text-error-red mt-0.5">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="font-heading text-xs sm:text-sm font-semibold text-charcoal">
                      {rule.title}
                    </h4>
                    <p className="font-body text-xs text-slate-gray mt-0.5 leading-relaxed">
                      {rule.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded bg-[#ECEAE4]/60 p-3 text-[11px] font-body text-slate-gray border border-soft-border/70">
              <span className="font-semibold text-charcoal">Strict Invariant:</span> Any schedule
              proposal violating even one mandatory rule is immediately discarded by the constraint model.
            </div>
          </div>

          {/* Card 2: Optimization Preferences */}
          <div className="rounded-lg border border-soft-border bg-white p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex items-center gap-3 border-b border-soft-border pb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded bg-muted-cobalt/10 text-muted-cobalt">
                <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-charcoal">
                  Optimization Preferences
                </h3>
                <p className="font-body text-xs text-slate-gray">
                  Soft objectives optimized across all valid solutions.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {optimizationPreferences.map((pref, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-pale-blue text-muted-cobalt mt-0.5">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="font-heading text-xs sm:text-sm font-semibold text-charcoal">
                      {pref.title}
                    </h4>
                    <p className="font-body text-xs text-slate-gray mt-0.5 leading-relaxed">
                      {pref.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded bg-pale-blue/40 p-3 text-[11px] font-body text-slate-gray border border-pale-blue-border">
              <span className="font-semibold text-muted-cobalt">Optimization Target:</span> Scores
              multiple valid schedules to present coordinators with the most balanced and resilient timetable.
            </div>
          </div>
        </div>

        {/* Solver Context Box */}
        <div className="mt-8 rounded-lg border border-soft-border bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-[#ECEAE4] text-charcoal">
              <Award className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-heading text-xs sm:text-sm font-semibold text-charcoal">
                Built for Mathematical Constraint Solvers
              </p>
              <p className="font-body text-xs text-slate-gray">
                Slotify's upcoming scheduling engine models these relationships mathematically using Google OR-Tools.
              </p>
            </div>
          </div>
          <span className="font-mono text-xs text-slate-gray px-2.5 py-1 rounded bg-warm-ivory border border-soft-border shrink-0">
            Engine Phase: In Development
          </span>
        </div>
      </div>
    </section>
  );
};
