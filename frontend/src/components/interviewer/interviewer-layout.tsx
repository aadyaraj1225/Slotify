import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Calendar,
  Clock,
  Compass,
  ArrowLeft,
  FileCheck2,
  LogOut,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useCoordinator } from "@/context/coordinator-context";
import { cn } from "@/lib/utils";

export interface InterviewerLayoutProps {
  children: React.ReactNode;
}

export const InterviewerLayout: React.FC<InterviewerLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();

  const { user, logout } = useAuth();
  const { interviewers } = useCoordinator();

  // Find linked interviewer record
  const currentInterviewer = interviewers.find((i) => i.email.toLowerCase() === user?.email.toLowerCase()) || interviewers[0];

  const navigationItems = [
    { label: "Overview", path: "/interviewer/overview", icon: Compass },
    { label: "My Schedule", path: "/interviewer/schedule", icon: Calendar },
    { label: "Assigned Interviews", path: "/interviewer/interviews", icon: Clock },
    { label: "Availability", path: "/interviewer/availability", icon: UserCheck },
    { label: "Evaluations", path: "/interviewer/evaluations", icon: FileCheck2 },
  ];

  return (
    <div className="flex min-h-screen bg-warm-offwhite text-deep-black font-body antialiased">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-deep-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Near-Black Retro-Digital Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r-2 border-deep-black bg-near-black text-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between px-8 border-b-2 border-deep-black">
          <Link to="/interviewer/overview" className="flex items-center gap-3 text-left">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-sky-blue text-deep-black font-mono font-black text-base shadow-[2px_2px_0px_#D7FF35]">
              I
            </div>
            <div>
              <span className="font-heading text-xl font-black tracking-tight text-white block leading-none">
                Slotify
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-gray">
                Interviewer Panel
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded p-1 text-muted-gray hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Panelist Identity Strip */}
        <div className="p-6 border-b-2 border-deep-black/40 bg-deep-black/30 text-left">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded bg-sky-blue text-deep-black font-mono font-bold flex items-center justify-center border-2 border-deep-black shadow-[2px_2px_0px_#101010]">
              {user?.name.charAt(0) || "I"}
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-heading text-sm font-bold text-white block truncate">
                {user?.name || currentInterviewer.name}
              </span>
              <span className="font-mono text-[10px] text-muted-gray block truncate">
                {currentInterviewer.department}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-deep-black/60 flex items-center justify-between text-[11px] font-mono">
            <span className="text-muted-gray">Max Daily Load:</span>
            <span className="text-electric-lime font-bold">{currentInterviewer.maxDailyLoad} slots</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-6 py-6 text-left" aria-label="Interviewer Navigation">
          <div className="px-3 pb-3 text-[10px] font-mono uppercase tracking-widest text-muted-gray">
            Evaluation Hub
          </div>
          {navigationItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3.5 py-2.5 text-xs font-mono uppercase tracking-wider transition-all",
                  isActive
                    ? "bg-sky-blue text-deep-black font-bold shadow-[2px_2px_0px_#101010]"
                    : "text-muted-gray hover:text-white hover:bg-[#252525]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Sign Out & Return */}
        <div className="border-t-2 border-deep-black p-6 space-y-2">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-mono uppercase tracking-wider text-error-red hover:bg-[#FF6262]/10 transition-colors text-left"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-mono uppercase tracking-wider text-muted-gray hover:text-white hover:bg-[#252525] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Public Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex h-20 items-center justify-between border-b-2 border-deep-black bg-white px-6 sm:px-10">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded p-2 text-slate-gray hover:text-deep-black hover:bg-warm-offwhite lg:hidden border-2 border-deep-black"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="text-left">
              <span className="font-mono text-[11px] font-bold text-slate-gray uppercase tracking-wider">
                Panelist Mode
              </span>
              <p className="font-heading font-black text-sm text-deep-black truncate max-w-xs sm:max-w-md">
                Evaluations &amp; Technical Interviews
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={logout}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded border-2 border-deep-black font-mono text-xs font-bold hover:bg-warm-offwhite"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
