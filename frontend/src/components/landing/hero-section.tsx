import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, User, MapPin, ArrowRight, Check } from "lucide-react";

export const HeroSection: React.FC = () => {
  const scrollToHowItWorks = () => {
    const el = document.getElementById("how-it-works");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="overview" className="relative bg-deep-black text-white pt-20 pb-28 sm:pt-28 sm:pb-36 border-b border-[#252525] overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-16 items-center">
          {/* Left Column: Headline and Actions */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-hot-pink/60 bg-hot-pink/10 px-4 py-1 text-xs font-mono font-medium text-hot-pink">
              <span>CAMPUS RECRUITMENT ENGINE</span>
            </div>

            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05]">
              Interview scheduling.<br />
              <span className="text-electric-lime">Without the chaos.</span>
            </h1>

            <p className="font-body text-base sm:text-lg text-muted-gray leading-relaxed max-w-xl">
              Coordinate campus candidates, faculty panels, and interview venues with zero double bookings.
              Deterministic constraint scheduling purpose-built for placement coordinators.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link to="/coordinator/overview">
                <Button variant="primary" size="lg" className="w-full sm:w-auto justify-center">
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="lg"
                onClick={scrollToHowItWorks}
                className="justify-center border border-[#333333] hover:border-sky-blue text-white"
              >
                How It Works
              </Button>
            </div>

            {/* Quick Metrics */}
            <div className="pt-8 border-t border-[#252525] grid grid-cols-3 gap-6 text-left">
              <div>
                <p className="font-mono text-2xl sm:text-3xl font-bold text-electric-lime">0</p>
                <p className="font-mono text-xs text-muted-gray mt-1 uppercase">Clashes</p>
              </div>
              <div>
                <p className="font-mono text-2xl sm:text-3xl font-bold text-hot-pink">100%</p>
                <p className="font-mono text-xs text-muted-gray mt-1 uppercase">Automated</p>
              </div>
              <div>
                <p className="font-mono text-2xl sm:text-3xl font-bold text-sky-blue">15m</p>
                <p className="font-mono text-xs text-muted-gray mt-1 uppercase">Buffer Guard</p>
              </div>
            </div>
          </div>

          {/* Right Column: Stylized Schedule Matrix (Retro-Digital Visual) */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border-2 border-[#252525] bg-near-black p-6 sm:p-8 shadow-[6px_6px_0px_#D7FF35] text-left space-y-6">
              {/* Matrix Console Header */}
              <div className="flex items-center justify-between border-b border-[#252525] pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-electric-lime" />
                  <span className="font-mono text-xs uppercase tracking-wider text-white">
                    Live Timetable Matrix
                  </span>
                </div>
                <span className="font-mono text-[11px] text-hot-pink bg-hot-pink/10 px-2.5 py-0.5 rounded border border-hot-pink/30">
                  Day 1 Active
                </span>
              </div>

              {/* Slot Blocks */}
              <div className="space-y-3 font-body">
                {/* Slot 1: Confirmed with Electric Lime Accent */}
                <div className="rounded-xl border border-[#333333] bg-[#141414] p-4 hover:border-electric-lime/80 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-white">Aarav Patel</span>
                      <span className="font-mono text-[10px] text-muted-gray px-1.5 py-0.5 rounded bg-[#222222]">
                        CS21B042
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-electric-lime flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Confirmed
                    </span>
                  </div>
                  <p className="text-xs text-muted-gray mt-1 font-mono">
                    Round 1: Algorithms &amp; Data Structures
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-gray pt-2 border-t border-[#222222]">
                    <span className="flex items-center gap-1 font-mono text-white">
                      <Clock className="h-3 w-3 text-electric-lime" /> 09:30 &ndash; 10:15
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-gray" /> Dr. Vikram Sethi
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-gray" /> Hall 3, Block B
                    </span>
                  </div>
                </div>

                {/* Slot 2: Selected with Hot Pink Accent */}
                <div className="rounded-xl border border-hot-pink/70 bg-[#1a1217] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-white">Priya Nair</span>
                      <span className="font-mono text-[10px] text-muted-gray px-1.5 py-0.5 rounded bg-[#222222]">
                        EC21B019
                      </span>
                      <span className="font-mono text-[10px] uppercase bg-hot-pink text-white px-1.5 py-0.5 rounded">
                        Next
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-hot-pink">
                      Pending Panel
                    </span>
                  </div>
                  <p className="text-xs text-muted-gray mt-1 font-mono">
                    Round 2: Distributed Systems Architecture
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-gray pt-2 border-t border-[#301c27]">
                    <span className="flex items-center gap-1 font-mono text-white">
                      <Clock className="h-3 w-3 text-hot-pink" /> 10:30 &ndash; 11:15
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-gray" /> Ananya Deshmukh
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-gray" /> Conf Room 4
                    </span>
                  </div>
                </div>

                {/* Slot 3: Sky Blue Accent */}
                <div className="rounded-xl border border-[#333333] bg-[#141414] p-4 hover:border-sky-blue/80 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-white">Karan Verma</span>
                      <span className="font-mono text-[10px] text-muted-gray px-1.5 py-0.5 rounded bg-[#222222]">
                        CS21B088
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-sky-blue flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Confirmed
                    </span>
                  </div>
                  <p className="text-xs text-muted-gray mt-1 font-mono">
                    Round 1: System Design Deliberation
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-gray pt-2 border-t border-[#222222]">
                    <span className="flex items-center gap-1 font-mono text-white">
                      <Clock className="h-3 w-3 text-sky-blue" /> 11:30 &ndash; 12:15
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-gray" /> Rajesh Kulkarni
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-gray" /> Hall 3, Block B
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Footer */}
              <div className="bg-[#121212] px-4 py-2.5 rounded-lg border border-[#252525] flex items-center justify-between text-[11px] font-mono">
                <span className="text-muted-gray">Mandatory 15m Cleaning Buffer:</span>
                <span className="text-electric-lime font-bold">Respected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
