import * as React from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  MapPin,
  User,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useCandidate } from "@/context/candidate-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import type { AvailableBookingSlot } from "@/types/candidate";

export const CandidateAvailableSlotsPage: React.FC = () => {
  const { availableSlots, activeCandidate, bookSlot, myInterviews } = useCandidate();

  const [selectedSlot, setSelectedSlot] = React.useState<AvailableBookingSlot | null>(null);
  const [confirmingSlot, setConfirmingSlot] = React.useState<AvailableBookingSlot | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [bookingResult, setBookingResult] = React.useState<{ success: boolean; message: string } | null>(null);

  // Filter state
  const [selectedDate, setSelectedDate] = React.useState<string>("all");

  const dates = Array.from(new Set(availableSlots.map((s) => s.date))).sort();

  const filteredSlots = availableSlots.filter((slot) => {
    return selectedDate === "all" || slot.date === selectedDate;
  });

  const handleConfirmBooking = async () => {
    if (!confirmingSlot) return;
    setIsSubmitting(true);
    try {
      const res = await bookSlot(confirmingSlot);
      setBookingResult(res);
      setConfirmingSlot(null);
      setSelectedSlot(null);
    } catch {
      setBookingResult({
        success: false,
        message: "Failed to confirm booking due to an unexpected client state.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 sm:space-y-12 px-6 sm:px-10 lg:px-14 py-8 sm:py-12 max-w-6xl mx-auto text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-6 border-b-2 border-deep-black pb-8">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tight text-deep-black">
            Available Slots
          </h1>
          <p className="font-body text-base text-slate-gray mt-2 max-w-2xl">
            Select an open interview slot for your current stage. All available timings adhere to solver buffer rules.
          </p>
        </div>

        <Link to="/candidate/interviews">
          <Button variant="outline" size="md" className="gap-2 text-xs font-bold border-2 border-deep-black">
            <span>View My Bookings</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Booking Feedback Result */}
      {bookingResult && (
        <div
          className={`rounded-2xl border-2 border-deep-black p-6 shadow-[4px_4px_0px_#101010] flex items-start gap-4 ${
            bookingResult.success ? "bg-electric-lime" : "bg-[#FF6262]/20"
          }`}
        >
          {bookingResult.success ? (
            <CheckCircle2 className="h-6 w-6 text-deep-black shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-error-red shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <h4 className="font-heading font-black text-sm text-deep-black">
              {bookingResult.success ? "Reservation Confirmed" : "Booking Invariant Notice"}
            </h4>
            <p className="font-body text-xs text-deep-black leading-relaxed">
              {bookingResult.message}
            </p>
            {bookingResult.success && (
              <div className="pt-2">
                <Link to="/candidate/interviews">
                  <Button variant="secondary" size="sm" className="text-xs font-bold bg-deep-black text-white">
                    Go to My Interviews
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Date Filter Bar */}
      {dates.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-gray uppercase mr-2">Filter Date:</span>
          <button
            type="button"
            onClick={() => setSelectedDate("all")}
            className={`rounded px-3 py-1.5 text-xs font-mono border-2 border-deep-black transition-all ${
              selectedDate === "all"
                ? "bg-deep-black text-electric-lime font-bold shadow-[2px_2px_0px_#D7FF35]"
                : "bg-white text-deep-black hover:bg-warm-offwhite"
            }`}
          >
            All Dates ({availableSlots.length})
          </button>
          {dates.map((dateStr) => {
            const count = availableSlots.filter((s) => s.date === dateStr).length;
            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => setSelectedDate(dateStr)}
                className={`rounded px-3 py-1.5 text-xs font-mono border-2 border-deep-black transition-all ${
                  selectedDate === dateStr
                    ? "bg-deep-black text-electric-lime font-bold shadow-[2px_2px_0px_#D7FF35]"
                    : "bg-white text-deep-black hover:bg-warm-offwhite"
                }`}
              >
                {dateStr} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Available Slots Grid */}
      {filteredSlots.length === 0 ? (
        <div className="rounded-2xl border-2 border-deep-black bg-white p-12 text-center shadow-[4px_4px_0px_#101010] space-y-4">
          <div className="h-12 w-12 rounded-xl bg-warm-offwhite border-2 border-deep-black text-slate-gray mx-auto flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-heading text-lg font-bold text-deep-black">
              No open slots available
            </h3>
            <p className="font-body text-xs text-slate-gray">
              All interview slots for your stage have either been filled or coordinator schedules are currently being compiled.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSlots.map((slot) => {
            const isSelected = selectedSlot?.id === slot.id;
            // Check if user has an overlapping interview
            const isClashing = myInterviews.some(
              (i) => i.date === slot.date && i.startTime === slot.startTime && i.status !== "cancelled"
            );

            return (
              <div
                key={slot.id}
                onClick={() => !isClashing && setSelectedSlot(slot)}
                className={`rounded-2xl border-2 p-6 flex flex-col justify-between transition-all cursor-pointer ${
                  isClashing
                    ? "border-deep-black/30 bg-[#F2F2F2] opacity-60 cursor-not-allowed"
                    : isSelected
                    ? "border-deep-black bg-white shadow-[4px_4px_0px_#D7FF35] ring-2 ring-electric-lime"
                    : "border-deep-black bg-white shadow-[4px_4px_0px_#101010] hover:shadow-[4px_4px_0px_#F542A6]"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-deep-black px-2 py-0.5 rounded bg-warm-offwhite border border-deep-black">
                      {slot.date}
                    </span>
                    <span className="font-mono text-xs text-slate-gray">
                      {slot.durationMinutes} mins
                    </span>
                  </div>

                  <div>
                    <h3 className="font-heading text-lg font-black text-deep-black">
                      {slot.startTime} &ndash; {slot.endTime}
                    </h3>
                    <p className="font-body text-xs text-slate-gray mt-1 font-medium">
                      {slot.roundName}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono text-deep-black pt-2 border-t-2 border-deep-black/10">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="h-3.5 w-3.5 text-slate-gray shrink-0" />
                      <span className="truncate">{slot.roomName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <User className="h-3.5 w-3.5 text-slate-gray shrink-0" />
                      <span className="truncate">{slot.interviewerName}</span>
                    </div>
                  </div>

                  {isClashing && (
                    <div className="rounded bg-error-red/10 border border-error-red p-2 text-[10px] font-mono text-error-red font-bold">
                      Clashes with an existing booking
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-3">
                  <Button
                    variant={isSelected ? "primary" : "outline"}
                    size="sm"
                    disabled={isClashing}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isClashing) setConfirmingSlot(slot);
                    }}
                    className={`w-full text-xs font-bold border-2 border-deep-black ${
                      isSelected ? "bg-electric-lime text-deep-black" : ""
                    }`}
                  >
                    {isClashing ? "Unavailable (Clash)" : isSelected ? "Confirm This Slot" : "Select Slot"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmingSlot && (
        <Dialog open={true} onOpenChange={() => setConfirmingSlot(null)}>
          <DialogContent maxWidth="md" onClose={() => setConfirmingSlot(null)}>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-hot-pink" />
                <DialogTitle>Confirm Interview Slot</DialogTitle>
              </div>
              <DialogDescription>
                Confirm your interview schedule for {confirmingSlot.roundName}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4 text-xs font-body text-deep-black border-t-2 border-deep-black">
              <div className="rounded-xl border-2 border-deep-black bg-warm-offwhite p-4 space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-slate-gray">Candidate:</span>
                  <span className="font-bold text-deep-black">{activeCandidate.name} ({activeCandidate.rollNo})</span>
                </div>
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-slate-gray">Round:</span>
                  <span className="font-bold text-deep-black">{confirmingSlot.roundName}</span>
                </div>
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-slate-gray">Date:</span>
                  <span className="font-bold text-deep-black">{confirmingSlot.date}</span>
                </div>
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-slate-gray">Timing:</span>
                  <span className="font-bold text-deep-black">{confirmingSlot.startTime} &ndash; {confirmingSlot.endTime}</span>
                </div>
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-slate-gray">Venue:</span>
                  <span className="font-bold text-deep-black">{confirmingSlot.roomName}</span>
                </div>
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-slate-gray">Panel:</span>
                  <span className="font-bold text-deep-black">{confirmingSlot.interviewerName}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-gray font-mono">
                Note: In this client demonstration, confirming immediately updates your active schedule in local storage without requiring server round-trips.
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmingSlot(null)}
                disabled={isSubmitting}
                className="border-2 border-deep-black font-bold text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="font-bold text-xs bg-electric-lime text-deep-black"
              >
                {isSubmitting ? "Locking in slot..." : "Confirm & Lock Slot"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
