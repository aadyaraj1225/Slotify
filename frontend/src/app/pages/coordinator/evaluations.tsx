import * as React from "react";

export const EvaluationsPage: React.FC = () => {
  const sampleEvaluations = [
    {
      id: "eval-1",
      candidateName: "Aarav Patel",
      rollNo: "CS21B042",
      round: "Round 1: Algorithms & Data Structures",
      evaluator: "Dr. Vikram Sethi",
      score: "4.8 / 5.0",
      recommendation: "Strong Hire (Advance to Systems Architecture)",
      status: "passed",
      feedback: "Exceptional dynamic programming decomposition. Solved graph optimization problem within 25 minutes.",
    },
    {
      id: "eval-2",
      candidateName: "Priya Nair",
      rollNo: "EC21B019",
      round: "Round 2: Distributed Systems Architecture",
      evaluator: "Ananya Deshmukh",
      score: "4.5 / 5.0",
      recommendation: "Hire (Advance to HR & Behavioral)",
      status: "passed",
      feedback: "Solid grasp of Raft consensus and Byzantine fault tolerance. Clear communication on CAP trade-offs.",
    },
    {
      id: "eval-3",
      candidateName: "Karan Verma",
      rollNo: "CS21B088",
      round: "Round 1: Algorithms & Data Structures",
      evaluator: "Rajesh Kulkarni",
      score: "3.2 / 5.0",
      recommendation: "Hold (Requires Second Technical Opinion)",
      status: "hold",
      feedback: "Good grasp of basic trees, but struggled with concurrent hashmap lock synchronization.",
    },
  ];

  return (
    <div className="px-6 sm:px-10 lg:px-14 py-8 sm:py-12 max-w-7xl mx-auto space-y-10 text-left">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-6 border-b-2 border-deep-black pb-8">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-slate-gray block mb-1">
            Deliberation &amp; Outcomes
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-tight text-deep-black">
            Evaluations &amp; Progression
          </h1>
          <p className="font-body text-sm text-slate-gray mt-1.5 max-w-xl">
            Panelist evaluation scores, interview rubric feedback, and candidate advancement gates.
          </p>
        </div>
      </div>

      {/* Evaluations Summary Strip */}
      <div className="rounded-xl border-2 border-deep-black bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#101010]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:divide-x-2 divide-deep-black/10">
          <div className="space-y-1">
            <span className="font-mono text-[11px] text-slate-gray uppercase tracking-wider font-bold block">Evaluations Logged</span>
            <p className="font-heading text-3xl sm:text-4xl font-black text-deep-black pt-1">12</p>
            <span className="text-xs text-slate-gray font-body block pt-0.5">Across 3 active drives</span>
          </div>
          <div className="space-y-1 sm:pl-8">
            <span className="font-mono text-[11px] text-slate-gray uppercase tracking-wider font-bold block">Passed to Next Round</span>
            <p className="font-heading text-3xl sm:text-4xl font-black text-success-green pt-1">9</p>
            <span className="text-xs text-slate-gray font-body block pt-0.5">Eligible for self-booking</span>
          </div>
          <div className="space-y-1 sm:pl-8">
            <span className="font-mono text-[11px] text-slate-gray uppercase tracking-wider font-bold block">Deliberation Holds</span>
            <p className="font-heading text-3xl sm:text-4xl font-black text-warning-amber pt-1">3</p>
            <span className="text-xs text-slate-gray font-body block pt-0.5">Pending panel consensus</span>
          </div>
        </div>
      </div>

      {/* Evaluations Feed */}
      <div className="space-y-5">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-slate-gray block mb-1">
            Feedback Archive
          </span>
          <h2 className="font-heading text-lg font-bold text-deep-black">
            Recent Panel Scorecards
          </h2>
        </div>

        <div className="space-y-4">
          {sampleEvaluations.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border-2 border-deep-black bg-white p-6 sm:p-7 shadow-[4px_4px_0px_#101010] space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-heading text-base font-bold text-deep-black">
                      {item.candidateName}
                    </span>
                    <span className="font-mono text-xs font-bold text-deep-black px-2 py-0.5 rounded bg-warm-offwhite border border-deep-black">
                      {item.rollNo}
                    </span>
                  </div>
                  <p className="font-body text-xs text-slate-gray mt-1">
                    {item.round} &middot; Evaluator: {item.evaluator}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="font-mono text-xs px-3 py-1 rounded bg-electric-lime text-deep-black font-bold border border-deep-black shadow-[2px_2px_0px_#101010]">
                    {item.score}
                  </span>
                  <span
                    className={`font-mono text-[11px] font-bold px-3 py-1 rounded border-2 border-deep-black ${
                      item.status === "passed"
                        ? "bg-[#70D6A0]/30 text-deep-black"
                        : "bg-[#FFC857]/30 text-deep-black"
                    }`}
                  >
                    {item.recommendation}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-warm-offwhite p-4 text-xs text-deep-black font-body leading-relaxed border-2 border-deep-black">
                <span className="font-mono text-[10px] font-bold uppercase text-slate-gray block mb-1">
                  Evaluator Observations:
                </span>
                {item.feedback}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
