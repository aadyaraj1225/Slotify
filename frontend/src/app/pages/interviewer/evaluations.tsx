import * as React from "react";

export const InterviewerEvaluationsPage: React.FC = () => {
  const previousEvaluations = [
    {
      id: "ev-1",
      candidate: "Aarav Patel",
      rollNo: "CS21B042",
      role: "Software Engineer (Backend)",
      round: "Round 1: Data Structures & Algorithms",
      score: "4.8 / 5.0",
      status: "Advanced",
      feedback: "Demonstrated solid grasp of red-black tree balancing and amortized time bounds.",
    },
    {
      id: "ev-2",
      candidate: "Priya Nair",
      rollNo: "EC21B019",
      role: "Software Engineer (Distributed Systems)",
      round: "Round 2: Distributed Systems Architecture",
      score: "4.5 / 5.0",
      status: "Advanced",
      feedback: "Exceptional breakdown of linearizability versus eventual consistency in multi-master setups.",
    },
  ];

  return (
    <div className="space-y-10 sm:space-y-12 px-6 sm:px-10 lg:px-14 py-8 sm:py-12 max-w-5xl mx-auto text-left">
      {/* Header */}
      <div className="border-b-2 border-deep-black pb-8">
        <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tight text-deep-black">
          Completed Evaluations
        </h1>
        <p className="font-body text-base text-slate-gray mt-2 max-w-2xl">
          Historical assessment records, rubric scores, and technical recommendations you submitted.
        </p>
      </div>

      <div className="space-y-4">
        {previousEvaluations.map((ev) => (
          <div
            key={ev.id}
            className="rounded-2xl border-2 border-deep-black bg-white p-6 sm:p-7 shadow-[4px_4px_0px_#101010] space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-heading text-base font-bold text-deep-black">
                    {ev.candidate}
                  </span>
                  <span className="font-mono text-xs font-bold text-deep-black px-2 py-0.5 rounded bg-warm-offwhite border border-deep-black">
                    {ev.rollNo}
                  </span>
                </div>
                <p className="font-body text-xs text-slate-gray mt-1">
                  {ev.round} &middot; {ev.role}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-3 py-1 rounded bg-sky-blue text-deep-black font-bold border border-deep-black">
                  {ev.score}
                </span>
                <span className="font-mono text-xs px-3 py-1 rounded bg-electric-lime text-deep-black font-bold border border-deep-black">
                  {ev.status}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-warm-offwhite p-4 text-xs text-deep-black font-body leading-relaxed border-2 border-deep-black">
              <span className="font-mono text-[10px] font-bold uppercase text-slate-gray block mb-1">
                Submitted Feedback:
              </span>
              {ev.feedback}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
