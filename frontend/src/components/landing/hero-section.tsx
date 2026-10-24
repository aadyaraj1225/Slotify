import * as React from "react";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Clock, User, MapPin, ArrowRight } from "lucide-react";

export const HeroSection: React.FC = () => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="overview" className="relative pt-16 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-center">
          {/* Left Column: Value Proposition and Actions */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-pale-blue/60 px-3.5 py-1 text-xs font-mono text-muted-cobalt border border-pale-blue-border/70">
              <span>Campus Recruitment Scheduling Platform</span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-charcoal leading-[1.08]">
              Every interview, in the right place.
            </h1>

            <p className="font-body text-base sm:text-lg text-slate-gray leading-relaxed max-w-xl">
              Coordinate candidates, interviewers, rooms, and time slots in one calm, spacious workspace.
              Slotify helps placement teams build mathematically conflict-free interview schedules and respond gracefully when plans change.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => scrollToSection("preview")}
                className="justify-center px-6 py-3"
              >
                <span>Explore Platform</span>
                <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollToSection("how-it-works")}
                className="justify-center px-6 py-3"
              >
                View Workflow
              </Button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-8 border-t border-[#E4E3DD]/80 grid grid-cols-3 gap-6 text-left">
              <div>
                <p className="font-heading text-2xl sm:text-3xl font-normal text-charcoal">100%</p>
                <p className="font-body text-xs text-slate-gray mt-1">Conflict Prevention</p>
              </div>
              <div>
                <p className="font-heading text-2xl sm:text-3xl font-normal text-charcoal">3 Tracks</p>
                <p className="font-body text-xs text-slate-gray mt-1">Multi-Round Sequencing</p>
              </div>
              <div>
                <p className="font-heading text-2xl sm:text-3xl font-normal text-charcoal">Zero Gaps</p>
                <p className="font-body text-xs text-slate-gray mt-1">Optimized Panel Load</p>
              </div>
            </div>
          </div>

          {/* Right Column: Realistic Product Preview Surface */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-[#E4E3DD]/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
              {/* Workspace Header Strip */}
              <div className="border-b border-[#E4E3DD]/80 bg-[#FAF9F5]/80 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-success-green" />
                  <span className="font-heading text-xs font-medium text-charcoal">
                    Recruitment Drive: Day 1 Matrix
                  </span>
                </div>
                <span className="font-mono text-[11px] text-slate-gray px-2.5 py-0.5 rounded-full bg-warm-ivory border border-[#E4E3DD]">
                  Slot Capacity: 24 / 24
                </span>
              </div>

              {/* Mini Schedule Grid Mockup */}
              <div className="p-6 space-y-4">
                {/* Slot Item 1 */}
                <div className="rounded-xl border border-[#E4E3DD]/80 bg-[#FAF9F5]/30 p-4 hover:border-slate-gray/40 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-xs font-medium text-charcoal">
                          Aarav Patel
                        </span>
                        <span className="font-mono text-[10px] text-slate-gray px-1.5 py-0.5 rounded bg-warm-ivory border border-[#E4E3DD]">
                          CS21B042
                        </span>
                      </div>
                      <p className="font-body text-[11px] text-slate-gray mt-1">
                        Round 1: Data Structures &amp; Algorithms
                      </p>
                    </div>
                    <StatusIndicator status="confirmed" size="sm" />
                  </div>
                  <div className="mt-3 flex items-center gap-5 text-[11px] text-slate-gray font-body pt-2.5 border-t border-[#E4E3DD]/60">
                    <span className="flex items-center gap-1.5 font-mono text-charcoal font-medium">
                      <Clock className="h-3.5 w-3.5 text-slate-gray/70" aria-hidden="true" />
                      09:30 &ndash; 10:15
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-gray/70" aria-hidden="true" />
                      Dr. Vikram Sethi
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-gray/70" aria-hidden="true" />
                      Hall 3, Block B
                    </span>
                  </div>
                </div>

                {/* Slot Item 2 */}
                <div className="rounded-xl border border-pale-blue-border/80 bg-pale-blue/30 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-xs font-medium text-charcoal">
                          Priya Nair
                        </span>
                        <span className="font-mono text-[10px] text-slate-gray px-1.5 py-0.5 rounded bg-white border border-pale-blue-border">
                          EC21B019
                        </span>
                        <span className="text-[10px] font-mono uppercase bg-muted-cobalt text-white px-1.5 py-0.5 rounded-full">
                          Selected
                        </span>
                      </div>
                      <p className="font-body text-[11px] text-slate-gray mt-1">
                        Round 2: Distributed Systems Architecture
                      </p>
                    </div>
                    <StatusIndicator status="pending" size="sm" />
                  </div>
                  <div className="mt-3 flex items-center gap-5 text-[11px] text-slate-gray font-body pt-2.5 border-t border-pale-blue-border/60">
                    <span className="flex items-center gap-1.5 font-mono text-muted-cobalt font-medium">
                      <Clock className="h-3.5 w-3.5 text-muted-cobalt" aria-hidden="true" />
                      10:30 &ndash; 11:15
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-gray/70" aria-hidden="true" />
                      Ananya Deshmukh
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-gray/70" aria-hidden="true" />
                      Conference Room 4
                    </span>
                  </div>
                </div>

                {/* Slot Item 3 */}
                <div className="rounded-xl border border-[#E4E3DD]/80 bg-[#FAF9F5]/30 p-4 hover:border-slate-gray/40 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-xs font-medium text-charcoal">
                          Karan Verma
                        </span>
                        <span className="font-mono text-[10px] text-slate-gray px-1.5 py-0.5 rounded bg-warm-ivory border border-[#E4E3DD]">
                          CS21B088
                        </span>
                      </div>
                      <p className="font-body text-[11px] text-slate-gray mt-1">
                        Round 2: System Design Deliberation
                      </p>
                    </div>
                    <StatusIndicator status="confirmed" size="sm" />
                  </div>
                  <div className="mt-3 flex items-center gap-5 text-[11px] text-slate-gray font-body pt-2.5 border-t border-[#E4E3DD]/60">
                    <span className="flex items-center gap-1.5 font-mono text-charcoal font-medium">
                      <Clock className="h-3.5 w-3.5 text-slate-gray/70" aria-hidden="true" />
                      11:30 &ndash; 12:15
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-gray/70" aria-hidden="true" />
                      Rajesh Kulkarni
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-gray/70" aria-hidden="true" />
                      Hall 3, Block B
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Notification */}
              <div className="bg-[#FAF9F5] px-6 py-3 border-t border-[#E4E3DD]/80 flex items-center justify-between text-[11px] text-slate-gray font-body">
                <span>Buffer Invariant: 15-minute rest preserved across all tracks</span>
                <span className="font-mono font-normal text-charcoal">Constraint Status: Valid</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
