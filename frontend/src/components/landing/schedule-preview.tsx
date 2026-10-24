import * as React from "react";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Button } from "@/components/ui/button";
import { Clock, User, MapPin, AlertCircle, Filter, Calendar as CalendarIcon, Check } from "lucide-react";
import type { SlotStatus } from "@/config/tokens";

interface PreviewSlot {
  id: string;
  time: string;
  candidate: string;
  roll: string;
  round: string;
  interviewer: string;
  room: string;
  status: SlotStatus;
  hasConflict?: boolean;
  conflictDetails?: string;
  day: number;
  track: string;
}

export const SchedulePreview: React.FC = () => {
  const [selectedDay, setSelectedDay] = React.useState<number>(1);
  const [selectedTrack, setSelectedTrack] = React.useState<string>("all");
  const [activeSlotId, setActiveSlotId] = React.useState<string>("slot-101");

  const previewSlots: PreviewSlot[] = [
    {
      id: "slot-101",
      day: 1,
      track: "software",
      time: "09:30 - 10:15",
      candidate: "Aarav Patel",
      roll: "CS21B042",
      round: "Technical Round 1: Algorithms & Data Structures",
      interviewer: "Dr. Vikram Sethi (Algorithms Lead)",
      room: "Hall 3, Block B",
      status: "confirmed",
    },
    {
      id: "slot-102",
      day: 1,
      track: "software",
      time: "10:30 - 11:15",
      candidate: "Priya Nair",
      roll: "EC21B019",
      round: "Technical Round 2: Distributed Systems",
      interviewer: "Ananya Deshmukh (Principal Architect)",
      room: "Conference Room 4",
      status: "pending",
    },
    {
      id: "slot-103",
      day: 1,
      track: "systems",
      time: "11:30 - 12:15",
      candidate: "Karan Verma",
      roll: "CS21B088",
      round: "System Design Assessment",
      interviewer: "Rajesh Kulkarni (Engineering Director)",
      room: "Hall 3, Block B",
      status: "conflict",
      hasConflict: true,
      conflictDetails: "Room contention: Hall 3 requires 15m cleaning & panel switch buffer.",
    },
    {
      id: "slot-104",
      day: 1,
      track: "data",
      time: "02:00 - 02:45",
      candidate: "Meera Sen",
      roll: "EE21B064",
      round: "Machine Learning & Stats Evaluation",
      interviewer: "Dr. Arvind Swaminathan (Data Science Lead)",
      room: "Lab 2, Ground Floor",
      status: "confirmed",
    },
    {
      id: "slot-201",
      day: 2,
      track: "software",
      time: "09:30 - 10:15",
      candidate: "Rohan Gupta",
      roll: "CS21B011",
      round: "Technical Round 2: Concurrent Programming",
      interviewer: "Suresh Menon (Tech Lead)",
      room: "Cabin A, Tech Wing",
      status: "confirmed",
    },
    {
      id: "slot-202",
      day: 2,
      track: "systems",
      time: "10:30 - 11:15",
      candidate: "Tanvi Kulkarni",
      roll: "CS21B099",
      round: "Behavioral & Culture Alignment",
      interviewer: "Sunita Rao (People Operations)",
      room: "Meeting Room 1",
      status: "confirmed",
    },
    {
      id: "slot-301",
      day: 3,
      track: "all",
      time: "10:00 - 11:00",
      candidate: "Nikhil Joshi",
      roll: "ME21B035",
      round: "Final Executive Deliberation",
      interviewer: "Harish Iyer (VP Engineering)",
      room: "Boardroom A",
      status: "pending",
    },
  ];

  const filteredSlots = previewSlots.filter((slot) => {
    const matchesDay = slot.day === selectedDay;
    const matchesTrack = selectedTrack === "all" || slot.track === selectedTrack || slot.track === "all";
    return matchesDay && matchesTrack;
  });

  const activeSlot = previewSlots.find((s) => s.id === activeSlotId) || previewSlots[0];

  return (
    <section id="preview" className="py-20 sm:py-28 bg-white border-b border-[#E4E3DD]/80">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 text-left">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs uppercase tracking-wider text-slate-gray">
                Interactive Schedule Workspace
              </span>
              <span className="rounded-full bg-warm-ivory px-2.5 py-0.5 font-mono text-[10px] text-slate-gray border border-[#E4E3DD]">
                Demo Sandbox
              </span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-normal tracking-tight text-charcoal leading-tight">
              A clear view of every room and panel.
            </h2>
            <p className="font-body text-base text-slate-gray leading-relaxed">
              Explore this preview of the coordinator scheduling workspace. Filter by drive day or technical
              track, inspect interview pairings, and review constraint notices.
            </p>
          </div>

          {/* Day Selector Buttons */}
          <div className="flex items-center gap-1.5 rounded-xl border border-[#E4E3DD]/80 p-1.5 bg-[#FAF9F5]">
            {[1, 2, 3].map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`rounded-lg px-4 py-2 text-xs font-mono transition-colors ${
                  selectedDay === day
                    ? "bg-white text-charcoal shadow-sm border border-[#E4E3DD] font-medium"
                    : "text-slate-gray hover:text-charcoal"
                }`}
              >
                Day {day}
              </button>
            ))}
          </div>
        </div>

        {/* Workspace Container */}
        <div className="mt-12 rounded-2xl border border-[#E4E3DD]/80 bg-[#FAF9F5] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Top Filter and Status Toolbar */}
          <div className="border-b border-[#E4E3DD]/80 bg-white px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-slate-gray flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-slate-gray/70" aria-hidden="true" />
                Track:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "all", label: "All Tracks" },
                  { id: "software", label: "Software Engineering" },
                  { id: "systems", label: "Systems & DevOps" },
                  { id: "data", label: "Data Science" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTrack(t.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-body transition-colors ${
                      selectedTrack === t.id
                        ? "bg-pale-blue text-muted-cobalt font-medium"
                        : "text-slate-gray hover:text-charcoal hover:bg-[#FAF9F5]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-gray font-mono">
              <CalendarIcon className="h-3.5 w-3.5 text-slate-gray/70" aria-hidden="true" />
              <span>Drive: Campus Recruitment Autumn 2026</span>
            </div>
          </div>

          {/* Main Workspace Body: Slots Table + Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E4E3DD]/80">
            {/* Left 8 Columns: Timetable Stream */}
            <div className="lg:col-span-8 p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-gray font-mono mb-2">
                <span>Showing {filteredSlots.length} Scheduled Slots</span>
                <span>Click slot to inspect details</span>
              </div>

              {filteredSlots.length === 0 ? (
                <div className="rounded-xl border border-[#E4E3DD] bg-white p-12 text-center text-slate-gray font-body text-xs">
                  No interview slots scheduled for Day {selectedDay} in this track.
                </div>
              ) : (
                filteredSlots.map((slot) => {
                  const isSelected = activeSlot.id === slot.id;
                  return (
                    <div
                      key={slot.id}
                      onClick={() => setActiveSlotId(slot.id)}
                      className={`cursor-pointer rounded-xl border p-5 transition-all text-left ${
                        isSelected
                          ? "border-muted-cobalt bg-pale-blue/40 ring-1 ring-muted-cobalt/40"
                          : slot.hasConflict
                          ? "border-error-red/40 bg-[#FDF0F0]/50 hover:border-error-red/60"
                          : "border-[#E4E3DD]/80 bg-white hover:border-slate-gray/40 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="font-heading text-sm font-medium text-charcoal">
                              {slot.candidate}
                            </span>
                            <span className="font-mono text-xs text-slate-gray px-2 py-0.5 rounded bg-warm-ivory border border-[#E4E3DD]">
                              {slot.roll}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] font-mono uppercase bg-muted-cobalt text-white px-2 py-0.5 rounded-full font-normal">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="font-body text-xs text-slate-gray mt-1">
                            {slot.round}
                          </p>
                        </div>
                        <StatusIndicator status={slot.status} size="sm" />
                      </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-gray pt-3 border-t border-[#E4E3DD]/60">
                        <div className="flex items-center gap-2 font-mono text-charcoal font-medium text-[11px]">
                          <Clock className="h-3.5 w-3.5 text-slate-gray/70 shrink-0" aria-hidden="true" />
                          <span>{slot.time}</span>
                        </div>
                        <div className="flex items-center gap-2 truncate text-xs">
                          <User className="h-3.5 w-3.5 text-slate-gray/70 shrink-0" aria-hidden="true" />
                          <span className="truncate">{slot.interviewer}</span>
                        </div>
                        <div className="flex items-center gap-2 truncate text-xs">
                          <MapPin className="h-3.5 w-3.5 text-slate-gray/70 shrink-0" aria-hidden="true" />
                          <span className="truncate">{slot.room}</span>
                        </div>
                      </div>

                      {slot.hasConflict && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-error-red font-body bg-white rounded-lg px-3 py-1.5 border border-error-red/30">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span>{slot.conflictDetails}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Right 4 Columns: Inspector Sidecar */}
            <div className="lg:col-span-4 p-6 sm:p-8 bg-white space-y-6">
              <div className="flex items-center justify-between border-b border-[#E4E3DD]/80 pb-4">
                <h4 className="font-heading text-base font-medium text-charcoal">
                  Slot Inspector
                </h4>
                <StatusIndicator status={activeSlot.status} size="sm" />
              </div>

              <div className="space-y-4 text-xs font-body">
                <div>
                  <span className="text-slate-gray block uppercase font-mono text-[10px]">
                    Candidate
                  </span>
                  <p className="font-heading font-medium text-sm text-charcoal mt-1">
                    {activeSlot.candidate}
                  </p>
                  <p className="font-mono text-slate-gray text-xs mt-0.5">{activeSlot.roll}</p>
                </div>

                <div>
                  <span className="text-slate-gray block uppercase font-mono text-[10px]">
                    Interview Round
                  </span>
                  <p className="font-medium text-charcoal mt-1">
                    {activeSlot.round}
                  </p>
                </div>

                <div>
                  <span className="text-slate-gray block uppercase font-mono text-[10px]">
                    Assigned Panelist
                  </span>
                  <p className="font-medium text-charcoal mt-1">
                    {activeSlot.interviewer}
                  </p>
                </div>

                <div>
                  <span className="text-slate-gray block uppercase font-mono text-[10px]">
                    Interview Venue &amp; Time
                  </span>
                  <p className="font-medium text-charcoal mt-1">
                    {activeSlot.room}
                  </p>
                  <p className="font-mono text-slate-gray text-xs mt-0.5">{activeSlot.time}</p>
                </div>

                {activeSlot.hasConflict && (
                  <div className="rounded-xl bg-[#FDF0F0] border border-error-red/30 p-4 text-xs text-error-red">
                    <p className="font-medium">Constraint Invariant Violation</p>
                    <p className="mt-1 leading-relaxed text-[11px]">{activeSlot.conflictDetails}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#E4E3DD]/80 space-y-2.5">
                <Button variant="primary" size="sm" className="w-full justify-center py-2.5 text-xs">
                  <Check className="h-3.5 w-3.5 mr-2" aria-hidden="true" />
                  Approve Allocation
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-center py-2.5 text-xs">
                  Adjust Slot Parameters
                </Button>
              </div>

              <div className="rounded-xl bg-[#FAF9F5] p-4 text-[11px] text-slate-gray font-body border border-[#E4E3DD]">
                <span className="font-medium text-charcoal block mb-0.5">Prototype Mode</span>
                Changes in this preview demonstrate user interaction states and do not modify external databases.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
