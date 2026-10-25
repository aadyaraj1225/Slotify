import * as React from "react";

export const WorkflowSection: React.FC = () => {
  const steps = [
    {
      num: "01",
      badge: "INTAKE & LIMITS",
      title: "Register Drive Scope",
      description:
        "Input candidates, panel expertise domains, spatial venue limits, and max daily interview load quotas.",
    },
    {
      num: "02",
      badge: "CONSTRAINT ENGINE",
      title: "Evaluate Invariants",
      description:
        "The solver calculates mathematically valid pairings, enforcing mandatory 15-minute cleaning buffers and zero candidate double-bookings.",
    },
    {
      num: "03",
      badge: "LIVE COORDINATION",
      title: "Lock Conflict-Free Grid",
      description:
        "Coordinators review the verified timetable, inspect real-time invariant notices, and handle last-minute adjustments gracefully.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-warm-offwhite border-b border-[#E4E3DD] text-deep-black">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 text-left">
        <div className="max-w-2xl space-y-4">
          <h2 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-deep-black leading-tight">
            How Slotify delivers zero clashes.
          </h2>
          <p className="font-body text-base text-slate-gray leading-relaxed">
            From initial campus registration to verified live timetables, the constraint pipeline replaces chaotic spreadsheets with deterministic scheduling.
          </p>
        </div>

        {/* 3 Bold Graphic Step Columns */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.num}
              className="rounded-2xl border-2 border-deep-black bg-white p-8 shadow-[4px_4px_0px_#101010] flex flex-col justify-between hover:shadow-[4px_4px_0px_#F542A6] transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-4xl font-extrabold text-deep-black">
                    {step.num}
                  </span>
                </div>
                <h3 className="font-heading text-xl font-bold text-deep-black pt-2">
                  {step.title}
                </h3>
                <p className="font-body text-sm text-slate-gray leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
