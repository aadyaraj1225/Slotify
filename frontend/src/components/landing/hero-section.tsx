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
    <section id="overview" className="relative pt-12 pb-16 sm:pt-16 sm:pb-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Value Proposition and Actions */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 rounded bg-pale-blue px-2.5 py-1 text-xs font-semibold font-heading text-muted-cobalt border border-pale-blue-border">
              <span>Campus Recruitment Scheduling Platform</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-charcoal leading-[1.15]">
              Every interview, in the right place.
            </h1>

            <p className="font-body text-base sm:text-lg text-slate-gray leading-relaxed max-w-xl">
              Coordinate candidates, interviewers, rooms, and time slots in one organized workspace.
              Slotify helps placement teams build reliable interview schedules and respond when plans change.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => scrollToSection("preview")}
                className="justify-center"
              >
                <span>Explore Slotify</span>
                <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollToSection("how-it-works")}
                className="justify-center"
              >
                See how it works
              </Button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-6 border-t border-soft-border grid grid-cols-3 gap-4 text-left">
              <div>
                <p className="font-heading text-xl sm:text-2xl font-bold text-charcoal">100%</p>
                <p className="font-body text-xs text-slate-gray">Conflict Prevention</p>
              </div>
              <div>
                <p className="font-heading text-xl sm:text-2xl font-bold text-charcoal">3 Tracks</p>
                <p className="font-body text-xs text-slate-gray">Multi-Round Sequencing</p>
              </div>
              <div>
                <p className="font-heading text-xl sm:text-2xl font-bold text-charcoal">Zero Gaps</p>
                <p className="font-body text-xs text-slate-gray">Optimized Panel Load</p>
              </div>
            </div>
          </div>

          {/* Right Column: Realistic Product Preview Surface */}
          <div className="lg:col-span-6">
            <div className="rounded-lg border border-soft-border bg-white shadow-card overflow-hidden">
              {/* Workspace Header Strip */}
              <div className="border-b border-soft-border bg-[#FBFBFA] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-success-green" />
                  <span className="font-heading text-xs font-semibold text-charcoal">
                    Recruitment Drive: Day 1 Matrix
                  </span>
                </div>
                <span className="font-mono text-[11px] text-slate-gray px-2 py-0.5 rounded bg-[#ECEAE4]">
                  Slot Capacity: 24 / 24
                </span>
              </div>

              {/* Mini Schedule Grid Mockup */}
              <div className="p-4 sm:p-5 space-y-3">
                {/* Slot Item 1 */}
                <div className="rounded border border-soft-border bg-white p-3 hover:border-slate-gray/40 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-xs font-semibold text-charcoal">
                          Aarav Patel
                        </span>
                        <span className="font-mono text-[10px] text-slate-gray px-1.5 py-0.2 rounded bg-warm-ivory">
                          CS21B042
                        </span>
                      </div>
                      <p className="font-body text-[11px] text-slate-gray mt-0.5">
                        Round 1: Data Structures & Algorithms
                      </p>
                    </div>
                    <StatusIndicator status="confirmed" size="sm" />
                  </div>
                  <div className="mt-2.5 flex items-center gap-4 text-[11px] text-slate-gray font-body pt-2 border-t border-soft-border/50">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="h-3 w-3 text-slate-gray" aria-hidden="true" />
                      09:30 - 10:15
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 text-slate-gray" aria-hidden="true" />
                      Dr. Vikram Sethi
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-gray" aria-hidden="true" />
                      Hall 3, Block B
                    </span>
                  </div>
                </div>

                {/* Slot Item 2 */}
                <div className="rounded border border-pale-blue-border bg-pale-blue/40 p-3 ring-1 ring-muted-cobalt/30">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-xs font-semibold text-charcoal">
                          Priya Nair
                        </span>
                        <span className="font-mono text-[10px] text-slate-gray px-1.5 py-0.2 rounded bg-white">
                          EC21B019
                        </span>
                        <span className="text-[10px] font-mono uppercase bg-muted-cobalt text-white px-1 rounded">
                          Selected
                        </span>
                      </div>
                      <p className="font-body text-[11px] text-slate-gray mt-0.5">
                        Round 2: Distributed Systems Architecture
                      </p>
                    </div>
                    <StatusIndicator status="pending" size="sm" />
                  </div>
                  <div className="mt-2.5 flex items-center gap-4 text-[11px] text-slate-gray font-body pt-2 border-t border-soft-border/50">
                    <span className="flex items-center gap-1 font-mono text-muted-cobalt font-medium">
                      <Clock className="h-3 w-3 text-muted-cobalt" aria-hidden="true" />
                      10:30 - 11:15
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 text-slate-gray" aria-hidden="true" />
                      Ananya Deshmukh
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-gray" aria-hidden="true" />
                      Conference Room 4
                    </span>
                  </div>
                </div>

                {/* Slot Item 3 */}
                <div className="rounded border border-soft-border bg-white p-3 hover:border-slate-gray/40 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-xs font-semibold text-charcoal">
                          Karan Verma
                        </span>
                        <span className="font-mono text-[10px] text-slate-gray px-1.5 py-0.2 rounded bg-warm-ivory">
                          CS21B088
                        </span>
                      </div>
                      <p className="font-body text-[11px] text-slate-gray mt-0.5">
                        Round 2: System Design Deliberation
                      </p>
                    </div>
                    <StatusIndicator status="confirmed" size="sm" />
                  </div>
                  <div className="mt-2.5 flex items-center gap-4 text-[11px] text-slate-gray font-body pt-2 border-t border-soft-border/50">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="h-3 w-3 text-slate-gray" aria-hidden="true" />
                      11:30 - 12:15
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 text-slate-gray" aria-hidden="true" />
                      Rajesh Kulkarni
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-gray" aria-hidden="true" />
                      Hall 3, Block B
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Notification */}
              <div className="bg-warm-ivory px-4 py-2.5 border-t border-soft-border flex items-center justify-between text-[11px] text-slate-gray font-body">
                <span>Buffer Invariant: 15-minute rest preserved across all tracks</span>
                <span className="font-mono font-medium text-charcoal">Constraint Status: Valid</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
