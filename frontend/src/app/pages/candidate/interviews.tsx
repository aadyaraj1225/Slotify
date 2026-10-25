import * as React from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ArrowRight,
  Download,
  AlertTriangle,
} from "lucide-react";
import { useCandidate } from "@/context/candidate-context";
import { useCoordinator } from "@/context/coordinator-context";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import type { ScheduledInterview } from "@/types/coordinator";

export const CandidateInterviewsPage: React.FC = () => {
  const { myInterviews, activeCandidate, cancelInterview } = useCandidate();
  const { rooms, interviewers, drives } = useCoordinator();

  const [selectedInterview, setSelectedInterview] = React.useState<ScheduledInterview | null>(null);
  const [cancellingInterview, setCancellingInterview] = React.useState<ScheduledInterview | null>(null);
  const [cancelFeedback, setCancelFeedback] = React.useState<string | null>(null);

  const handleCancel = async () => {
    if (!cancellingInterview) return;
    const res = await cancelInterview(cancellingInterview.id);
    setCancelFeedback(res.message);
    setCancellingInterview(null);
    setSelectedInterview(null);
    setTimeout(() => setCancelFeedback(null), 3500);
  };

  const handleDownloadInvite = (itv: ScheduledInterview) => {
    const room = rooms.find((r) => r.id === itv.roomId);
    const drive = drives.find((d) => d.id === itv.driveId);
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Slotify//Candidate Interview//EN",
      "BEGIN:VEVENT",
      `SUMMARY:Slotify Interview: ${drive?.name || "Campus Drive"}`,
      `DESCRIPTION:Interview session for ${activeCandidate.name} (${activeCandidate.rollNo})`,
      `LOCATION:${room?.name || "Campus Venue"}`,
      `DTSTART:${itv.date.replace(/-/g, "")}T${itv.startTime.replace(":", "")}00`,
      `DTEND:${itv.date.replace(/-/g, "")}T${itv.endTime.replace(":", "")}00`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-${itv.id}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10 sm:space-y-12 px-6 sm:px-10 lg:px-14 py-8 sm:py-12 max-w-6xl mx-auto text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-6 border-b-2 border-deep-black pb-8">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tight text-deep-black">
            My Interviews
          </h1>
          <p className="font-body text-base text-slate-gray mt-2 max-w-2xl">
            Confirmed sessions, venue assignments, and calendar downloads for your recruitment trials.
          </p>
        </div>

        <Link to="/candidate/available-slots">
          <Button variant="primary" size="md" className="gap-2 text-xs font-bold">
            <span>Book New Slot</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Cancel Feedback Banner */}
      {cancelFeedback && (
        <div className="rounded-xl border-2 border-deep-black bg-electric-lime p-4 text-xs font-bold text-deep-black shadow-[4px_4px_0px_#101010]">
          {cancelFeedback}
        </div>
      )}

      {/* Interviews List */}
      {myInterviews.length === 0 ? (
        <div className="rounded-2xl border-2 border-deep-black bg-white p-12 text-center shadow-[4px_4px_0px_#101010] space-y-4">
          <div className="h-12 w-12 rounded-xl bg-warm-offwhite border-2 border-deep-black text-slate-gray mx-auto flex items-center justify-center">
            <Calendar className="h-6 w-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-heading text-lg font-bold text-deep-black">
              No interview sessions registered
            </h3>
            <p className="font-body text-xs text-slate-gray">
              You haven't reserved or been assigned any interview sessions yet. Check the Available Slots page to self-book.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/candidate/available-slots">
              <Button variant="primary" size="md" className="gap-2 text-xs font-bold">
                <span>Browse Available Slots</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {myInterviews.map((itv) => {
            const room = rooms.find((r) => r.id === itv.roomId);
            const interviewer = interviewers.find((i) => i.id === itv.interviewerId);
            const drive = drives.find((d) => d.id === itv.driveId);
            const round = drive?.rounds.find((r) => r.id === itv.roundId);

            return (
              <div
                key={itv.id}
                className="rounded-2xl border-2 border-deep-black bg-white p-6 sm:p-7 shadow-[4px_4px_0px_#101010] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-[4px_4px_0px_#F542A6] transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <StatusIndicator status={itv.status} size="sm" />
                    <span className="font-mono text-xs text-slate-gray">
                      Session #{itv.id}
                    </span>
                    <span className="font-mono text-xs font-bold text-deep-black bg-warm-offwhite px-2 py-0.5 rounded border border-deep-black">
                      {drive?.name || "Campus Drive"}
                    </span>
                  </div>

                  <h3 className="font-heading text-xl font-bold text-deep-black">
                    {round?.name || activeCandidate.currentStage}
                  </h3>

                  <div className="flex flex-wrap items-center gap-5 text-xs font-mono text-deep-black pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-slate-gray" />
                      <span>{itv.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-slate-gray" />
                      <span>{itv.startTime} &ndash; {itv.endTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-slate-gray" />
                      <span>{room?.name || "Venue Assigned"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="h-4 w-4 text-slate-gray" />
                      <span>{interviewer?.name || "Panel Assigned"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedInterview(itv)}
                    className="text-xs font-bold border-2 border-deep-black"
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadInvite(itv)}
                    className="text-xs font-bold border-2 border-deep-black gap-1.5"
                    title="Download .ics Calendar Invite"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Calendar</span>
                  </Button>
                  {itv.status !== "cancelled" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCancellingInterview(itv)}
                      className="text-xs font-bold border-2 border-error-red text-error-red hover:bg-[#FF6262]/10"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {selectedInterview && (
        <Dialog open={true} onOpenChange={() => setSelectedInterview(null)}>
          <DialogContent maxWidth="md" onClose={() => setSelectedInterview(null)}>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <DialogTitle>Interview Session Details</DialogTitle>
                <StatusIndicator status={selectedInterview.status} size="sm" />
              </div>
              <DialogDescription>
                Session Reference: {selectedInterview.id}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4 text-xs font-body text-deep-black border-t-2 border-deep-black">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase text-slate-gray block">Position / Role</span>
                <p className="font-bold text-sm text-deep-black mt-0.5">{activeCandidate.appliedRole}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase text-slate-gray block">Date</span>
                  <p className="font-mono text-sm font-bold text-deep-black mt-0.5">{selectedInterview.date}</p>
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase text-slate-gray block">Time Window</span>
                  <p className="font-mono text-sm font-bold text-deep-black mt-0.5">
                    {selectedInterview.startTime} &ndash; {selectedInterview.endTime}
                  </p>
                </div>
              </div>

              <div>
                <span className="font-mono text-[10px] font-bold uppercase text-slate-gray block">Assigned Venue</span>
                <p className="font-medium text-sm text-deep-black mt-0.5">
                  {rooms.find((r) => r.id === selectedInterview.roomId)?.name || "Academic Complex"}
                </p>
              </div>

              <div>
                <span className="font-mono text-[10px] font-bold uppercase text-slate-gray block">Panel Evaluator</span>
                <p className="font-medium text-sm text-deep-black mt-0.5">
                  {interviewers.find((i) => i.id === selectedInterview.interviewerId)?.name || "Faculty Lead"}
                </p>
              </div>

              <div className="rounded-lg bg-warm-offwhite p-3 border-2 border-deep-black text-[11px] text-slate-gray font-mono">
                Mandatory Buffer: 15-minute gap enforced between sessions for room turnaround.
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadInvite(selectedInterview)}
                className="gap-1.5 border-2 border-deep-black font-bold text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Save to Calendar</span>
              </Button>
              <Button variant="primary" size="sm" onClick={() => setSelectedInterview(null)} className="font-bold text-xs">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmation Dialog for Cancellation */}
      {cancellingInterview && (
        <Dialog open={true} onOpenChange={() => setCancellingInterview(null)}>
          <DialogContent maxWidth="sm" onClose={() => setCancellingInterview(null)}>
            <DialogHeader>
              <div className="flex items-center gap-2 text-error-red">
                <AlertTriangle className="h-5 w-5" />
                <DialogTitle>Cancel Interview Reservation?</DialogTitle>
              </div>
              <DialogDescription>
                Release slot {cancellingInterview.id} scheduled on {cancellingInterview.date} at {cancellingInterview.startTime}.
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 text-xs text-slate-gray leading-relaxed font-body">
              Are you sure you want to cancel this interview? Once released, the time slot will immediately become open to other candidates in this recruitment round.
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancellingInterview(null)}
                className="border-2 border-deep-black font-bold text-xs"
              >
                Keep Booking
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancel}
                className="font-bold text-xs bg-error-red text-white hover:bg-error-red/90"
              >
                Confirm Cancellation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
