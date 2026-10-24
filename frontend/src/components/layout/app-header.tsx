import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export const AppHeader: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: "Overview", path: "/" },
    { label: "Design System Showcase", path: "/showcase" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-soft-border bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-muted-cobalt text-white">
            <Calendar className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-base font-bold tracking-tight text-charcoal">
                Slotify
              </span>
              <span className="hidden sm:inline-block rounded bg-[#ECEAE4] px-1.5 py-0.5 font-mono text-[11px] text-slate-gray">
                Phase 1 Foundation
              </span>
            </div>
            <p className="text-xs text-slate-gray font-body hidden md:block">
              The Ancient One's Trials: Campus Recruitment Scheduler
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "rounded px-3 py-1.5 text-xs sm:text-sm font-medium font-body transition-colors",
                  isActive
                    ? "bg-pale-blue text-muted-cobalt font-semibold"
                    : "text-slate-gray hover:text-charcoal hover:bg-[#ECEAE4]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="hidden lg:flex items-center pl-3 border-l border-soft-border text-xs text-slate-gray">
            <Layers className="h-3.5 w-3.5 mr-1 text-slate-gray" aria-hidden="true" />
            <span>Design Tokens Active</span>
          </div>
        </nav>
      </div>
    </header>
  );
};
