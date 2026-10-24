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
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-soft-border pb-5">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-charcoal">
            Candidate Evaluations & Progression
          </h1>
          <p className="font-body text-xs sm:text-sm text-slate-gray mt-1">
            Panelist evaluation scores, interview rubric feedback, and candidate advancement gates.
          </p>
        </div>
      </div>

      {/* Evaluations Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-soft-border bg-white p-4 shadow-subtle">
          <span className="font-mono text-xs text-slate-gray uppercase">Evaluations Logged</span>
          <p className="font-heading text-2xl font-bold text-charcoal mt-1">12</p>
          <span className="text-[11px] text-slate-gray font-body">across 3 active drives</span>
        </div>
        <div className="rounded-lg border border-soft-border bg-white p-4 shadow-subtle">
          <span className="font-mono text-xs text-slate-gray uppercase">Passed to Next Round</span>
          <p className="font-heading text-2xl font-bold text-success-green mt-1">9</p>
          <span className="text-[11px] text-slate-gray font-body">eligible for self-booking</span>
        </div>
        <div className="rounded-lg border border-soft-border bg-white p-4 shadow-subtle">
          <span className="font-mono text-xs text-slate-gray uppercase">Deliberation Holds</span>
          <p className="font-heading text-2xl font-bold text-warning-amber mt-1">3</p>
          <span className="text-[11px] text-slate-gray font-body">pending panel consensus</span>
        </div>
      </div>

      {/* Evaluations Feed */}
      <div className="space-y-4">
        <h2 className="font-heading text-base font-bold text-charcoal">
          Recent Panel Scorecards
        </h2>

        <div className="space-y-3">
          {sampleEvaluations.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-soft-border bg-white p-5 shadow-card space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-sm sm:text-base font-bold text-charcoal">
                      {item.candidateName}
                    </span>
                    <span className="font-mono text-xs text-slate-gray px-1.5 py-0.2 rounded bg-warm-ivory">
                      {item.rollNo}
                    </span>
                  </div>
                  <p className="font-body text-xs text-slate-gray mt-0.5">
                    {item.round} (Evaluator: {item.evaluator})
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="font-mono text-xs px-2.5 py-1 rounded bg-pale-blue text-muted-cobalt font-bold border border-pale-blue-border">
                    {item.score}
                  </span>
                  <span
                    className={`font-mono text-xs px-2.5 py-1 rounded border font-semibold ${
                      item.status === "passed"
                        ? "bg-success-green/10 text-success-green border-success-green/30"
                        : "bg-warning-amber/10 text-warning-amber border-warning-amber/30"
                    }`}
                  >
                    {item.recommendation}
                  </span>
                </div>
              </div>

              <div className="rounded bg-warm-ivory p-3 text-xs text-charcoal font-body leading-relaxed border border-soft-border">
                <span className="font-semibold block font-heading text-[11px] text-slate-gray uppercase mb-1">
                  Evaluator Comments:
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
