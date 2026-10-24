import * as React from "react";
import { Cpu, CalendarCheck, UserCheck, Layers, RefreshCw, Award } from "lucide-react";
import { MonoBadge } from "@/components/ui/typography";

export const CapabilitiesSection: React.FC = () => {
  return (
    <section id="capabilities" className="py-16 sm:py-24 bg-warm-ivory">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-3 text-left">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-cobalt">
            Platform Features
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-charcoal leading-tight">
            Designed specifically for placement coordination.
          </h2>
          <p className="font-body text-base text-slate-gray leading-relaxed">
            Standard calendar applications and spreadsheets lack domain understanding for multi-round
            evaluations. Slotify is engineered around the specific dynamics of campus hiring drives.
          </p>
        </div>

        {/* Asymmetric Varied Layout */}
        <div className="mt-12 space-y-6">
          {/* Top Row: Two Primary Feature Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
            {/* Feature 1 */}
            <div className="rounded-lg border border-soft-border bg-white p-6 sm:p-8 shadow-card flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-pale-blue text-muted-cobalt">
                    <Cpu className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <MonoBadge>Hard & Soft Solvers</MonoBadge>
                </div>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-charcoal">
                  Constraint-based schedule generation
                </h3>
                <p className="font-body text-sm text-slate-gray leading-relaxed">
                  Instead of manual slot guessing, the system checks millions of possible interviewer-candidate-room
                  combinations to produce timetable proposals that satisfy mandatory sequencing and venue rules.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-soft-border/70 flex items-center justify-between text-xs text-slate-gray font-mono">
                <span>Invariants: Zero Room Clashes</span>
                <span className="text-success-green font-semibold">Verified</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="rounded-lg border border-soft-border bg-white p-6 sm:p-8 shadow-card flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-success-green/10 text-success-green">
                    <RefreshCw className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <MonoBadge>Real-time Recovery</MonoBadge>
                </div>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-charcoal">
                  Cancellation recovery and proposed rescheduling
                </h3>
                <p className="font-body text-sm text-slate-gray leading-relaxed">
                  When an interviewer is called away or a candidate withdraws, the platform identifies eligible
                  backups and presents the coordinator with isolated, low-disruption schedule adjustments.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-soft-border/70 flex items-center justify-between text-xs text-slate-gray font-mono">
                <span>Impact: Localized Rerouting</span>
                <span className="text-charcoal font-semibold">Non-Cascading</span>
              </div>
            </div>
          </div>

          {/* Bottom Row: 4 Focused Capabilities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {/* Feature 3 */}
            <div className="rounded-lg border border-soft-border bg-white p-5 shadow-card space-y-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-[#ECEAE4] text-charcoal">
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
              </div>
              <h4 className="font-heading text-sm sm:text-base font-semibold text-charcoal">
                Candidate self-booking
              </h4>
              <p className="font-body text-xs text-slate-gray leading-relaxed">
                Eligible students choose from valid time windows that match their qualification tier, preventing scheduling overreach.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-lg border border-soft-border bg-white p-5 shadow-card space-y-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-[#ECEAE4] text-charcoal">
                <UserCheck className="h-4 w-4" aria-hidden="true" />
              </div>
              <h4 className="font-heading text-sm sm:text-base font-semibold text-charcoal">
                Interviewer workload visibility
              </h4>
              <p className="font-body text-xs text-slate-gray leading-relaxed">
                Live metrics show completed, scheduled, and remaining evaluations per panelist to maintain equitable interview load.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-lg border border-soft-border bg-white p-5 shadow-card space-y-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-[#ECEAE4] text-charcoal">
                <Layers className="h-4 w-4" aria-hidden="true" />
              </div>
              <h4 className="font-heading text-sm sm:text-base font-semibold text-charcoal">
                Multi-round coordination
              </h4>
              <p className="font-body text-xs text-slate-gray leading-relaxed">
                Maintains strict prerequisite gates between coding rounds, technical interviews, and behavioral assessments.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-lg border border-soft-border bg-white p-5 shadow-card space-y-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-[#ECEAE4] text-charcoal">
                <Award className="h-4 w-4" aria-hidden="true" />
              </div>
              <h4 className="font-heading text-sm sm:text-base font-semibold text-charcoal">
                Evaluation and progression
              </h4>
              <p className="font-body text-xs text-slate-gray leading-relaxed">
                Standardized feedback forms enable coordinators to advance candidates immediately to next-round booking pools.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
