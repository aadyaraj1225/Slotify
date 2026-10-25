import * as React from "react";
import { Link } from "react-router-dom";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#252525] bg-deep-black text-white py-12 text-left">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#252525]">
          {/* Brand section */}
          <div className="space-y-1.5 max-w-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-electric-lime text-deep-black font-mono font-black text-xs border border-deep-black shadow-[2px_2px_0px_#F542A6]">
                S
              </div>
              <span className="font-heading text-lg font-black tracking-tight text-white">
                Slotify
              </span>
            </div>
            <p className="font-body text-xs text-muted-gray leading-relaxed">
              A smarter way to coordinate campus recruitment interviews.
            </p>
          </div>

          {/* Navigation section */}
          <nav className="flex flex-wrap items-center gap-6 text-xs font-mono uppercase tracking-wider text-muted-gray">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <Link to="/login" className="hover:text-electric-lime transition-colors">
              Sign In
            </Link>
            <Link to="/signup" className="text-electric-lime hover:underline font-bold">
              Get Started
            </Link>
          </nav>
        </div>

        {/* Bottom section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-muted-gray/70">
          <div>
            &copy; 2026 Slotify. All rights reserved.
          </div>
          <div>
            Deterministic interview scheduling for campus recruitment.
          </div>
        </div>
      </div>
    </footer>
  );
};
