import * as React from "react";
import { Clock, MapPin, FileText } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useCoordinator } from "@/context/coordinator-context";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export const InterviewerInterviewsPage: React.FC = () => {
  const { user } = useAuth();
  const { interviewers, interviews, candidates, rooms, drives } = useCoordinator();

  const currentInterviewer = interviewers.find(
    (i) => i.email.toLowerCase() === user?.email.toLowerCase()
  ) || interviewers[0];

  const assignedInterviews = interviews.filter((i) => i.interviewerId === currentInterviewer.id);
  const [evaluatingSession, setEvaluatingSession] = React.useState<any | null>(null);
  const [score, setScore] = React.useState("4.5");
  const [recommendation, setRecommendation] = React.useState("Advance to Next Round");
  const [feedback, setFeedback] = React.useState("");
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  const handleSubmitScorecard = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setEvaluatingSession(null);
      setFeedback("");
    }, 2000);
  };

  return (
    <div className="space-y-10 sm:space-y-12 px-6 sm:px-10 lg:px-14 py-8 sm:py-12 max-w-6xl mx-auto text-left">
      {/* Header */}
      <div className="border-b-2 border-deep-black pb-8">
        <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tight text-deep-black">
          Assigned Interviews
        </h1>
        <p className="font-body text-base text-slate-gray mt-2 max-w-2xl">
          Conduct interviews and submit technical scorecards for your assigned student candidates.
        </p>
      </div>

      {assignedInterviews.length === 0 ? (
        <div className="rounded-2xl border-2 border-deep-black bg-white p-12 text-center shadow-[4px_4px_0px_#101010] space-y-4">
          <p className="font-body text-xs text-slate-gray">
            No student candidates currently assigned to your panel.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignedInterviews.map((session) => {
            const candidate = candidates.find((c) => c.id === session.candidateId);
            const room = rooms.find((r) => r.id === session.roomId);
            const drive = drives.find((d) => d.id === session.driveId);

            return (
              <div
                key={session.id}
                className="rounded-2xl border-2 border-deep-black bg-white p-6 sm:p-7 shadow-[4px_4px_0px_#101010] flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <StatusIndicator status={session.status} size="sm" />
                    <span className="font-mono text-xs text-slate-gray">
                      Session #{session.id}
                    </span>
                    <span className="font-mono text-xs font-bold text-deep-black bg-warm-offwhite px-2 py-0.5 rounded border border-deep-black">
                      {drive?.name}
                    </span>
                  </div>

                  <h3 className="font-heading text-xl font-bold text-deep-black">
                    {candidate?.name || "Student"} ({candidate?.rollNo})
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-deep-black pt-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-slate-gray" />
                      <span>{session.date} &middot; {session.startTime} &ndash; {session.endTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-slate-gray" />
                      <span>{room?.name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setEvaluatingSession(session)}
                    className="gap-1.5 text-xs font-bold"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Submit Evaluation</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Scorecard Submission Modal */}
      {evaluatingSession && (
        <Dialog open={true} onOpenChange={() => setEvaluatingSession(null)}>
          <DialogContent maxWidth="md" onClose={() => setEvaluatingSession(null)}>
            <DialogHeader>
              <DialogTitle>Interview Evaluation Rubric</DialogTitle>
              <DialogDescription>
                Submit assessment for Session #{evaluatingSession.id}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitScorecard} className="space-y-4 pt-4 text-xs font-body text-deep-black border-t-2 border-deep-black">
              {savedSuccess ? (
                <div className="rounded-xl border-2 border-deep-black bg-electric-lime p-5 text-center font-bold font-mono">
                  Scorecard registered! Deliberation metrics updated.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] uppercase font-bold text-slate-gray mb-1">
                        Technical Score (1 - 5)
                      </label>
                      <input
                        type="text"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        className="w-full h-10 rounded border-2 border-deep-black px-3 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase font-bold text-slate-gray mb-1">
                        Recommendation
                      </label>
                      <select
                        value={recommendation}
                        onChange={(e) => setRecommendation(e.target.value)}
                        className="w-full h-10 rounded border-2 border-deep-black px-3 font-mono text-xs"
                      >
                        <option>Advance to Next Round</option>
                        <option>Strong Hire</option>
                        <option>Requires Second Opinion</option>
                        <option>Reject</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase font-bold text-slate-gray mb-1">
                      Evaluator Observations &amp; Technical Feedback
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="e.g. Demonstrated exceptional algorithmic problem solving in dynamic programming..."
                      className="w-full rounded border-2 border-deep-black p-3 font-body text-xs focus:outline-none focus:ring-1 focus:ring-electric-lime"
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => setEvaluatingSession(null)}
                      className="border-2 border-deep-black font-bold text-xs"
                    >
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" type="submit" className="font-bold text-xs">
                      Submit Scorecard
                    </Button>
                  </DialogFooter>
                </>
              )}
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
