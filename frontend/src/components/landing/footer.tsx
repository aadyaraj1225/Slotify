import * as React from "react";
import { Link } from "react-router-dom";
import { Calendar, ExternalLink } from "lucide-react";

const CURRENT_YEAR = 2026;

export const Footer: React.FC = () => {
  const pageSections = [
    { label: "Overview", href: "#overview" },
    { label: "The Problem", href: "#problem" },
    { label: "Approach", href: "#approach" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Capabilities", href: "#capabilities" },
    { label: "Preview", href: "#preview" },
  ];

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="border-t border-soft-border bg-white py-12 text-left">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand & Mission */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-muted-cobalt text-white">
                <Calendar className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="font-heading text-base font-bold tracking-tight text-charcoal">
                Slotify
              </span>
              <span className="font-mono text-[11px] text-slate-gray px-1.5 py-0.2 rounded bg-warm-ivory border border-soft-border">
                The Ancient One's Trials
              </span>
            </div>
            <p className="font-body text-xs sm:text-sm text-slate-gray leading-relaxed max-w-sm">
              A constraint-based interview scheduling platform for university recruitment coordinators.
              Designed to balance interviewer workloads, prevent room collisions, and handle cancellations cleanly.
            </p>
          </div>

          {/* Page Section Navigation */}
          <div className="md:col-span-4 space-y-2">
            <p className="font-heading text-xs font-semibold uppercase tracking-wider text-charcoal">
              Platform Sections
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-body">
              {pageSections.map((section) => (
                <a
                  key={section.label}
                  href={section.href}
                  onClick={(e) => handleAnchorClick(e, section.href)}
                  className="text-slate-gray hover:text-charcoal transition-colors py-0.5"
                >
                  {section.label}
                </a>
              ))}
            </div>
          </div>

          {/* Engineering & Source Links */}
          <div className="md:col-span-3 space-y-2">
            <p className="font-heading text-xs font-semibold uppercase tracking-wider text-charcoal">
              Repository & Design
            </p>
            <div className="space-y-1.5 text-xs font-body">
              <a
                href="https://github.com/aadyaraj1225/Slotify"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-slate-gray hover:text-charcoal transition-colors"
              >
                <span>GitHub Repository</span>
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
              <Link
                to="/coordinator/overview"
                className="block text-slate-gray hover:text-charcoal transition-colors"
              >
                Coordinator Dashboard
              </Link>
              <Link
                to="/showcase"
                className="block text-slate-gray hover:text-charcoal transition-colors"
              >
                Design System Showcase
              </Link>
              <Link
                to="/overview"
                className="block text-slate-gray hover:text-charcoal transition-colors"
              >
                Phase 1 Overview
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="mt-12 pt-6 border-t border-soft-border/70 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-gray font-body gap-2">
          <p>&copy; {CURRENT_YEAR} Slotify. Campus Recruitment Interview Scheduling Platform.</p>
          <p className="font-mono text-[11px]">Phase 2: Complete Landing Page & Navigation Foundation</p>
        </div>
      </div>
    </footer>
  );
};
