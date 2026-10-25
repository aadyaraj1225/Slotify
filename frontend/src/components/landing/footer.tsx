import * as React from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#252525] bg-deep-black text-white py-12 text-left">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-electric-lime text-deep-black font-mono font-bold text-sm shadow-[2px_2px_0px_#F542A6]">
            S
          </div>
          <div>
            <span className="font-heading text-lg font-bold tracking-tight text-white block leading-none">
              Slotify
            </span>
            <span className="font-mono text-[10px] text-muted-gray uppercase tracking-wider">
              Deterministic Interview Scheduling
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs font-mono uppercase tracking-wider text-muted-gray">
          <a href="#how-it-works" className="hover:text-electric-lime transition-colors">
            How it Works
          </a>
          <a href="#features" className="hover:text-hot-pink transition-colors">
            Features
          </a>
          <Link to="/login" className="hover:text-sky-blue transition-colors">
            Portal Sign In
          </Link>
          <a
            href="https://github.com/aadyaraj1225/Slotify"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <span>GitHub</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="text-xs font-mono text-muted-gray/70">
          &copy; 2025 Slotify. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
