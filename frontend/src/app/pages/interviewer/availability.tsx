import * as React from "react";
import { Plus, Trash2, Clock, Calendar as CalendarIcon } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useCoordinator } from "@/context/coordinator-context";
import { Button } from "@/components/ui/button";

export const InterviewerAvailabilityPage: React.FC = () => {
  const { user } = useAuth();
  const { interviewers, addAvailability, removeAvailability } = useCoordinator();

  const currentInterviewer = interviewers.find(
    (i) => i.email.toLowerCase() === user?.email.toLowerCase()
  ) || interviewers[0];

  const [date, setDate] = React.useState("2026-11-10");
  const [startTime, setStartTime] = React.useState("09:00");
  const [endTime, setEndTime] = React.useState("12:00");
  const [savedNotice, setSavedNotice] = React.useState(false);

  const handleAddWindow = (e: React.FormEvent) => {
    e.preventDefault();
    addAvailability(currentInterviewer.id, {
      day: 1,
      date,
      startTime,
      endTime,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-10 sm:space-y-12 px-6 sm:px-10 lg:px-14 py-8 sm:py-12 max-w-5xl mx-auto text-left">
      {/* Header */}
      <div className="border-b-2 border-deep-black pb-8">
        <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tight text-deep-black">
          Availability Blocks
        </h1>
        <p className="font-body text-base text-slate-gray mt-2 max-w-2xl">
          Register times you are available for evaluation panels. The solver uses these windows when scheduling student rounds.
        </p>
      </div>

      {savedNotice && (
        <div className="rounded-xl border-2 border-deep-black bg-electric-lime p-4 text-xs font-bold font-mono text-deep-black">
          New evaluation block added and saved to local state.
        </div>
      )}

      {/* Add New Availability Form */}
      <div className="rounded-2xl border-2 border-deep-black bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#101010] space-y-6">
        <h2 className="font-heading text-lg font-bold text-deep-black">
          Register New Availability Window
        </h2>

        <form onSubmit={handleAddWindow} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-slate-gray mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-10 rounded border-2 border-deep-black bg-warm-offwhite px-3 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-slate-gray mb-1">
              Start Time
            </label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full h-10 rounded border-2 border-deep-black bg-warm-offwhite px-3 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-slate-gray mb-1">
              End Time
            </label>
            <input
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full h-10 rounded border-2 border-deep-black bg-warm-offwhite px-3 font-mono text-xs"
            />
          </div>

          <div>
            <Button type="submit" variant="primary" size="md" className="w-full justify-center gap-1.5 text-xs font-bold">
              <Plus className="h-4 w-4" />
              <span>Add Block</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Active Windows List */}
      <div className="space-y-4">
        <h2 className="font-heading text-xl font-bold text-deep-black">
          Registered Availability Blocks ({currentInterviewer.availability.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentInterviewer.availability.map((w) => (
            <div
              key={w.id}
              className="rounded-xl border-2 border-deep-black bg-white p-5 flex items-center justify-between shadow-[2px_2px_0px_#101010]"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-deep-black">
                  <CalendarIcon className="h-4 w-4 text-sky-blue" />
                  <span>{w.date}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-slate-gray">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{w.startTime} &ndash; {w.endTime}</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => removeAvailability(currentInterviewer.id, w.id)}
                className="border-2 border-error-red text-error-red hover:bg-[#FF6262]/10 p-2"
                aria-label="Remove window"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
