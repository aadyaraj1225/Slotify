import * as React from "react";
import { Cpu, ShieldCheck, Users, AlertTriangle } from "lucide-react";

export const CapabilitiesSection: React.FC = () => {
  return (
    <section id="features" className="py-24 sm:py-32 bg-deep-black text-white border-b border-[#252525]">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 text-left">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-electric-lime/60 bg-electric-lime/10 px-4 py-1 text-xs font-mono font-medium text-electric-lime">
            <span>CORE INVARIANTS</span>
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Engineered for campus hiring constraints.
          </h2>
          <p className="font-body text-base text-muted-gray leading-relaxed">
            Generic calendar apps fail because they ignore prerequisite rounds, interviewer daily quotas, and room turnover. Slotify is built around placement realities.
          </p>
        </div>

        {/* Bold Asymmetrical Feature Composition */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Feature 1: Large Featured Block (Constraint Engine) */}
          <div className="lg:col-span-7 rounded-2xl border-2 border-[#252525] bg-near-black p-8 sm:p-10 shadow-[6px_6px_0px_#F542A6] flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-hot-pink text-white font-mono font-black text-xl shadow-[2px_2px_0px_#FFFFFF]">
                  <Cpu className="h-6 w-6" aria-hidden="true" />
                </div>
                <span className="font-mono text-xs text-hot-pink uppercase tracking-widest px-3 py-1 rounded-full border border-hot-pink/40 bg-hot-pink/10">
                  Deterministic Solver
                </span>
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white">
                Constraint-based schedule generation
              </h3>
              <p className="font-body text-base text-muted-gray leading-relaxed">
                Evaluates millions of possible candidate-interviewer-room permutations simultaneously. It guarantees valid multi-stage sequence prerequisites and zero concurrent candidate bookings.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#252525] flex items-center justify-between font-mono text-xs text-muted-gray">
              <span>Mathematical Invariant:</span>
              <span className="text-electric-lime font-bold">100% Conflict-Free</span>
            </div>
          </div>

          {/* Feature 2: Buffer Protection */}
          <div className="lg:col-span-5 rounded-2xl border-2 border-[#252525] bg-near-black p-8 sm:p-10 shadow-[6px_6px_0px_#D7FF35] flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-electric-lime text-deep-black font-mono font-black text-xl shadow-[2px_2px_0px_#101010]">
                  <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                </div>
                <span className="font-mono text-xs text-electric-lime uppercase tracking-widest px-3 py-1 rounded-full border border-electric-lime/40 bg-electric-lime/10">
                  Buffer Guard
                </span>
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white">
                Mandatory venue cleaning intervals
              </h3>
              <p className="font-body text-base text-muted-gray leading-relaxed">
                Enforces strict 15-minute buffers between consecutive sessions in the same venue to prevent room contention and panel fatigue.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#252525] flex items-center justify-between font-mono text-xs text-muted-gray">
              <span>Venue Safety:</span>
              <span className="text-white font-bold">Automated Spacing</span>
            </div>
          </div>

          {/* Feature 3: Workload Balancing */}
          <div className="lg:col-span-6 rounded-2xl border-2 border-[#252525] bg-near-black p-8 sm:p-10 shadow-[6px_6px_0px_#73D0F4] flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-blue text-deep-black font-mono font-black text-xl shadow-[2px_2px_0px_#FFFFFF]">
                  <Users className="h-6 w-6" aria-hidden="true" />
                </div>
                <span className="font-mono text-xs text-sky-blue uppercase tracking-widest px-3 py-1 rounded-full border border-sky-blue/40 bg-sky-blue/10">
                  Panel Safeguard
                </span>
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
                Equitable evaluator load balancing
              </h3>
              <p className="font-body text-sm sm:text-base text-muted-gray leading-relaxed">
                Daily slot limits prevent popular technical leads from facing 6 consecutive evaluation hours while others sit idle.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#252525] flex items-center justify-between font-mono text-xs text-muted-gray">
              <span>Workload Cap:</span>
              <span className="text-sky-blue font-bold">Max Quota Respected</span>
            </div>
          </div>

          {/* Feature 4: Real-time Conflict Inspector */}
          <div className="lg:col-span-6 rounded-2xl border-2 border-[#252525] bg-near-black p-8 sm:p-10 shadow-[6px_6px_0px_#FFC857] flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning-amber text-deep-black font-mono font-black text-xl shadow-[2px_2px_0px_#101010]">
                  <AlertTriangle className="h-6 w-6" aria-hidden="true" />
                </div>
                <span className="font-mono text-xs text-warning-amber uppercase tracking-widest px-3 py-1 rounded-full border border-warning-amber/40 bg-warning-amber/10">
                  Live Recovery
                </span>
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
                Immediate invariant clash inspection
              </h3>
              <p className="font-body text-sm sm:text-base text-muted-gray leading-relaxed">
                When panel availability abruptly changes or students cancel, isolated notices identify the precise invariant breached.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#252525] flex items-center justify-between font-mono text-xs text-muted-gray">
              <span>Recovery Impact:</span>
              <span className="text-warning-amber font-bold">Isolated Adjustment</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
