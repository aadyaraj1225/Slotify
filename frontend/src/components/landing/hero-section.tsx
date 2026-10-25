import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const HeroSection: React.FC = () => {
  return (
    <section id="overview" className="relative bg-deep-black text-white pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-[#252525] overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Headline and Actions */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
              Every interview, in the right place.
            </h1>

            <p className="font-body text-base sm:text-lg text-muted-gray leading-relaxed max-w-xl">
              Coordinate candidate availability, faculty evaluation panels, and physical campus rooms with zero clashes. A structured, constraint-based scheduling engine built for placement coordinators.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link to="/signup">
                <Button variant="primary" size="lg" className="w-full sm:w-auto justify-center bg-electric-lime text-deep-black border-2 border-deep-black shadow-[3px_3px_0px_#101010]">
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto justify-center border border-[#333333] hover:border-white text-white"
                >
                  <span>Sign In</span>
                </Button>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="pt-6 border-t border-[#252525] grid grid-cols-3 gap-6 text-left">
              <div>
                <p className="font-mono text-2xl font-bold text-electric-lime">0</p>
                <p className="font-mono text-xs text-muted-gray mt-0.5 uppercase">Clashes</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-hot-pink">100%</p>
                <p className="font-mono text-xs text-muted-gray mt-0.5 uppercase">Valid Rounds</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-sky-blue">15m</p>
                <p className="font-mono text-xs text-muted-gray mt-0.5 uppercase">Room Buffer</p>
              </div>
            </div>
          </div>

          {/* Right Column: Stylized Schedule Matrix */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border-2 border-[#252525] bg-near-black p-6 sm:p-7 shadow-[6px_6px_0px_#D7FF35] text-left space-y-5">
              <div className="flex items-center justify-between border-b border-[#252525] pb-3.5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-electric-lime" />
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    Live Venue Schedule Matrix
                  </span>
                </div>
                <span className="font-mono text-[11px] text-muted-gray">
                  Academic Complex B
                </span>
              </div>

              {/* Matrix Grid */}
              <div className="space-y-3 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg border-2 border-deep-black bg-white p-3 text-deep-black shadow-[2px_2px_0px_#101010]">
                    <div className="flex items-center justify-between text-[11px] mb-1 font-bold">
                      <span>Room 101</span>
                      <span className="text-electric-lime bg-deep-black px-1.5 py-0.5 rounded text-[10px]">LOCKED</span>
                    </div>
                    <p className="font-sans font-bold text-xs truncate">Aarav Patel</p>
                    <p className="text-[10px] text-slate-gray mt-0.5">09:30 &ndash; 10:15</p>
                  </div>

                  <div className="rounded-lg border-2 border-deep-black bg-white p-3 text-deep-black shadow-[2px_2px_0px_#101010]">
                    <div className="flex items-center justify-between text-[11px] mb-1 font-bold">
                      <span>Room 102</span>
                      <span className="text-electric-lime bg-deep-black px-1.5 py-0.5 rounded text-[10px]">LOCKED</span>
                    </div>
                    <p className="font-sans font-bold text-xs truncate">Priya Nair</p>
                    <p className="text-[10px] text-slate-gray mt-0.5">10:30 &ndash; 11:15</p>
                  </div>

                  <div className="rounded-lg border-2 border-deep-black bg-white p-3 text-deep-black shadow-[2px_2px_0px_#101010]">
                    <div className="flex items-center justify-between text-[11px] mb-1 font-bold">
                      <span>Cabin 3</span>
                      <span className="text-sky-blue bg-deep-black px-1.5 py-0.5 rounded text-[10px]">BUFFER</span>
                    </div>
                    <p className="font-sans font-bold text-xs truncate">Sanitization Gap</p>
                    <p className="text-[10px] text-slate-gray mt-0.5">11:15 &ndash; 11:30</p>
                  </div>
                </div>

                <div className="rounded-xl border border-[#252525] bg-deep-black p-4 space-y-2 text-[11px] text-muted-gray">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-white font-bold">Prerequisite Constraint Engine</span>
                    <span className="text-electric-lime font-bold">Zero Invariant Clashes</span>
                  </div>
                  <p className="font-sans text-xs leading-relaxed text-muted-gray">
                    Multi-stage candidate flow strictly enforces that students advance through technical evaluations in proper sequence before final deliberation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
