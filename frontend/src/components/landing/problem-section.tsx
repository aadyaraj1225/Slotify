import * as React from "react";
import { AlertTriangle, Clock, Users, Building, Shuffle } from "lucide-react";

export const ProblemSection: React.FC = () => {
  const frictionPoints = [
    {
      id: "double-bookings",
      title: "Double bookings and room contention",
      description:
        "When parallel technical rounds run simultaneously, two panels often get assigned to the same conference hall or candidate, halting interview tracks.",
      icon: Building,
    },
    {
      id: "conflicting-availability",
      title: "Conflicting availability across panels",
      description:
        "Senior panelists, department heads, and external hiring leads have fragmented calendar blocks that change with short notice.",
      icon: Clock,
    },
    {
      id: "uneven-workloads",
      title: "Uneven interviewer workloads",
      description:
        "Without balancing algorithms, popular interviewers face 6 consecutive hours of evaluations while others remain underutilized.",
      icon: Users,
    },
    {
      id: "cancellations",
      title: "Last-minute cancellations and dropouts",
      description:
        "A single candidate withdrawal creates an empty slot, stranding panelists and disrupting subsequent round eligibility.",
      icon: AlertTriangle,
    },
    {
      id: "manual-rescheduling",
      title: "Time-consuming manual rescheduling",
      description:
        "Spreadsheet-based coordinators spend hours manually cross-checking availability matrices to resolve a single scheduling delay.",
      icon: Shuffle,
    },
  ];

  return (
    <section id="problem" className="py-16 sm:py-24 bg-white border-y border-soft-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Contextual Overview */}
          <div className="lg:col-span-5 space-y-4">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-gray">
              The Placement Challenge
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-charcoal leading-tight">
              One interview plan. Too many moving parts.
            </h2>
            <p className="font-body text-sm sm:text-base text-slate-gray leading-relaxed">
              Campus placement drives require coordinating hundreds of graduating candidates, dozens of
              specialized industry panels, limited interview rooms, and strict multi-stage round sequencing.
            </p>
            <p className="font-body text-sm sm:text-base text-slate-gray leading-relaxed">
              Manual spreadsheets fail as soon as interviews run long, panelists arrive late, or candidate
              schedules collide. Every minor change triggers a ripple effect across the entire drive.
            </p>

            <div className="rounded-md border border-soft-border bg-warm-ivory p-4 mt-6">
              <p className="font-heading text-xs font-semibold uppercase tracking-wider text-charcoal">
                Typical Campus Scale
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-left">
                <div>
                  <span className="font-mono text-lg font-bold text-charcoal">300+</span>
                  <p className="text-xs text-slate-gray font-body">Candidate Trials</p>
                </div>
                <div>
                  <span className="font-mono text-lg font-bold text-charcoal">45</span>
                  <p className="text-xs text-slate-gray font-body">Technical Panels</p>
                </div>
                <div>
                  <span className="font-mono text-lg font-bold text-charcoal">12</span>
                  <p className="text-xs text-slate-gray font-body">Interview Rooms</p>
                </div>
                <div>
                  <span className="font-mono text-lg font-bold text-charcoal">3 Rounds</span>
                  <p className="text-xs text-slate-gray font-body">Coding, Tech, HR</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 5 Practical Problems List */}
          <div className="lg:col-span-7 space-y-3.5">
            {frictionPoints.map((point, index) => {
              const Icon = point.icon;
              return (
                <div
                  key={point.id}
                  className="rounded-md border border-soft-border bg-[#FDFCFB] p-4 sm:p-5 hover:bg-white hover:border-slate-gray/30 transition-colors text-left"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#ECEAE4] text-charcoal">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-slate-gray">
                          0{index + 1}
                        </span>
                        <h3 className="font-heading text-sm sm:text-base font-semibold text-charcoal">
                          {point.title}
                        </h3>
                      </div>
                      <p className="font-body text-xs sm:text-sm text-slate-gray leading-relaxed">
                        {point.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
