import * as React from "react";

export const ProblemSection: React.FC = () => {
  return (
    <section className="py-20 bg-white border-b-2 border-deep-black text-deep-black text-left">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-hot-pink">
              The Campus Reality
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-black tracking-tight text-deep-black leading-tight">
              Spreadsheets fail when recruitment day arrives.
            </h2>
            <p className="font-body text-base text-slate-gray leading-relaxed">
              Recruitment drives are not simple calendar bookings. Hundreds of students must interview across multiple sequential rounds with specialized faculty panels, limited physical rooms, and strict time limits.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-xl border-2 border-deep-black bg-warm-offwhite p-6 shadow-[3px_3px_0px_#101010] space-y-2">
              <h3 className="font-heading text-lg font-bold text-deep-black">
                Panel Burnout &amp; Imbalance
              </h3>
              <p className="font-body text-xs text-slate-gray leading-relaxed">
                Without hard workload caps, popular interviewers face 6 consecutive hours while other qualified panelists sit idle.
              </p>
            </div>

            <div className="rounded-xl border-2 border-deep-black bg-warm-offwhite p-6 shadow-[3px_3px_0px_#101010] space-y-2">
              <h3 className="font-heading text-lg font-bold text-deep-black">
                Prerequisite Violations
              </h3>
              <p className="font-body text-xs text-slate-gray leading-relaxed">
                Candidates book Round 2 systems design before passing Round 1 coding foundations, wasting evaluator time.
              </p>
            </div>

            <div className="rounded-xl border-2 border-deep-black bg-warm-offwhite p-6 shadow-[3px_3px_0px_#101010] space-y-2">
              <h3 className="font-heading text-lg font-bold text-deep-black">
                Physical Room Contention
              </h3>
              <p className="font-body text-xs text-slate-gray leading-relaxed">
                Zero turnaround intervals mean overlapping student sessions in the same physical cabin and constant delays.
              </p>
            </div>

            <div className="rounded-xl border-2 border-deep-black bg-warm-offwhite p-6 shadow-[3px_3px_0px_#101010] space-y-2">
              <h3 className="font-heading text-lg font-bold text-deep-black">
                Double Booked Students
              </h3>
              <p className="font-body text-xs text-slate-gray leading-relaxed">
                Concurrent evaluation rounds scheduled at identical times leave candidates stranded and placement teams scrambling.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
