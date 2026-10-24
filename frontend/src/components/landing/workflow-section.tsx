import * as React from "react";
import { ArrowRight } from "lucide-react";

export const WorkflowSection: React.FC = () => {
  const workflowSteps = [
    {
      stepNumber: "01",
      title: "Set up the drive",
      summary: "The coordinator creates the recruitment drive and configures interview rounds.",
      details:
        "Define company tracks, technical stages (Coding, Tech, HR), required panelist specializations, interview duration, and designated room blocks.",
      badge: "Configuration",
    },
    {
      stepNumber: "02",
      title: "Collect availability",
      summary: "Candidates and interviewers provide their available times through streamlined portals.",
      details:
        "Interviewers submit available hours and evaluation capacity. Candidates confirm attendance windows, eliminating endless email back-and-forth.",
      badge: "Intake",
    },
    {
      stepNumber: "03",
      title: "Generate the schedule",
      summary: "The scheduler finds assignments respecting hard constraints and optimizing preferences.",
      details:
        "Algorithmic solvers construct conflict-free pairings, ensuring balanced panel workloads, valid room sizes, and mandatory buffer intervals.",
      badge: "Solver Engine",
    },
    {
      stepNumber: "04",
      title: "Book and coordinate",
      summary: "Candidates view available slots, while interviewers receive verified timetables.",
      details:
        "Self-booking interfaces let students select interview windows within their qualified rounds, while panel dashboards display upcoming candidate queues.",
      badge: "Distribution",
    },
    {
      stepNumber: "05",
      title: "Recover from changes",
      summary: "When cancellations occur, Slotify proposes feasible replacements for coordinator approval.",
      details:
        "Instead of manual phone calls and spreadsheet scrambling, coordinators review minimal-impact recovery proposals with one-click adjustments.",
      badge: "Resilience",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-white border-b border-soft-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
          <div className="max-w-2xl space-y-3">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-gray">
              Recruitment Lifecycle
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-charcoal leading-tight">
              How Slotify organizes campus trials.
            </h2>
            <p className="font-body text-base text-slate-gray leading-relaxed">
              From the initial registration of campus panels to real-time cancellation recovery,
              the planned scheduling pipeline follows five structured coordination phases.
            </p>
          </div>
          <div className="shrink-0">
            <span className="font-mono text-xs text-slate-gray px-3 py-1.5 rounded bg-warm-ivory border border-soft-border inline-block">
              Intended Product Workflow
            </span>
          </div>
        </div>

        {/* Step-by-Step Editorial Flow */}
        <div className="mt-12 space-y-4">
          {workflowSteps.map((step, idx) => (
            <div
              key={step.stepNumber}
              className="rounded-lg border border-soft-border bg-[#FDFCFB] p-5 sm:p-6 hover:bg-white hover:border-slate-gray/40 transition-all text-left"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Step Indicator */}
                <div className="md:col-span-2 flex items-center gap-3">
                  <span className="font-mono text-2xl sm:text-3xl font-bold text-muted-cobalt">
                    {step.stepNumber}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#ECEAE4] text-charcoal">
                    {step.badge}
                  </span>
                </div>

                {/* Step Title and Core Summary */}
                <div className="md:col-span-4 space-y-1">
                  <h3 className="font-heading text-base sm:text-lg font-bold text-charcoal">
                    {step.title}
                  </h3>
                  <p className="font-body text-xs sm:text-sm text-slate-gray">
                    {step.summary}
                  </p>
                </div>

                {/* Expanded Details */}
                <div className="md:col-span-5 text-xs sm:text-sm font-body text-slate-gray leading-relaxed">
                  {step.details}
                </div>

                {/* Arrow indicator (if not last) */}
                <div className="hidden md:flex md:col-span-1 justify-end text-slate-gray/40">
                  {idx < workflowSteps.length - 1 && (
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Architectural Timeline Notice */}
        <div className="mt-8 rounded bg-warm-ivory p-4 border border-soft-border text-xs text-slate-gray font-body text-left flex items-start gap-3">
          <span className="font-mono font-semibold text-charcoal shrink-0">Note:</span>
          <span>
            This structured workflow represents the product architecture currently under development.
            Drive setup, solver invocation, and live candidate self-booking portals will be enabled in
            subsequent implementation phases.
          </span>
        </div>
      </div>
    </section>
  );
};
