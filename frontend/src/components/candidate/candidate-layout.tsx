import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Bell,
  Calendar,
  Clock,
  Compass,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { useCandidate } from "@/context/candidate-context";
import { cn } from "@/lib/utils";

export interface CandidateLayoutProps {
  children: React.ReactNode;
}

export const CandidateLayout: React.FC<CandidateLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();

  const {
    activeCandidate,
    allCandidates,
    setActiveCandidateId,
    unreadNotificationCount,
  } = useCandidate();

  const navigationItems = [
    { label: "Overview", path: "/candidate/overview", icon: Compass },
    { label: "My Interviews", path: "/candidate/interviews", icon: Calendar },
    { label: "Available Slots", path: "/candidate/available-slots", icon: Clock },
    {
      label: "Notifications",
      path: "/candidate/notifications",
      icon: Bell,
      badge: unreadNotificationCount > 0 ? unreadNotificationCount : undefined,
    },
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
          <Link to="/candidate/overview" className="flex items-center gap-3 text-left">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-hot-pink text-white font-mono font-black text-base shadow-[2px_2px_0px_#D7FF35]">
              C
            </div>
            <div>
              <span className="font-heading text-xl font-black tracking-tight text-white block leading-none">
                Slotify
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-gray">
                Candidate Portal
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

        {/* Candidate Profile / Demo Switcher Strip */}
        <div className="p-6 border-b-2 border-deep-black/40 bg-deep-black/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded bg-white text-deep-black font-mono font-bold flex items-center justify-center border-2 border-deep-black shadow-[2px_2px_0px_#D7FF35]">
              {activeCandidate.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <span className="font-heading text-sm font-bold text-white block truncate">
                {activeCandidate.name}
              </span>
              <span className="font-mono text-[11px] text-muted-gray block truncate">
                {activeCandidate.rollNo}
              </span>
            </div>
          </div>

          {/* Quick Demo Candidate Switcher */}
          <div className="mt-3">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-muted-gray mb-1 text-left">
              Switch Demo Candidate:
            </label>
            <select
              value={activeCandidate.id}
              onChange={(e) => setActiveCandidateId(e.target.value)}
              className="w-full h-8 rounded border-2 border-deep-black bg-near-black px-2 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-electric-lime"
            >
              {allCandidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.rollNo})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-6 py-6 text-left" aria-label="Candidate Navigation">
          <div className="px-3 pb-3 text-[10px] font-mono uppercase tracking-widest text-muted-gray">
            Portal Menu
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
                    ? "bg-electric-lime text-deep-black font-bold shadow-[2px_2px_0px_#101010]"
                    : "text-muted-gray hover:text-white hover:bg-[#252525]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="rounded bg-hot-pink px-2 py-0.5 font-mono text-[10px] text-white font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Return to Public Website & Coordinator Switch */}
        <div className="border-t-2 border-deep-black p-6 space-y-2">
          <Link
            to="/coordinator/overview"
            className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-mono uppercase tracking-wider text-muted-gray hover:text-white hover:bg-[#252525] transition-colors"
          >
            <span>Coordinator Mode</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
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
                Applied Role
              </span>
              <p className="font-heading font-black text-sm text-deep-black truncate max-w-xs sm:max-w-md">
                {activeCandidate.appliedRole}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/candidate/notifications"
              className="relative p-2 rounded border-2 border-deep-black bg-warm-offwhite text-deep-black hover:bg-electric-lime transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded bg-hot-pink text-white font-mono text-[9px] font-bold flex items-center justify-center border border-deep-black">
                  {unreadNotificationCount}
                </span>
              )}
            </Link>

            <div className="hidden sm:flex items-center gap-2.5 pl-4 border-l-2 border-deep-black/10">
              <div className="h-8 w-8 rounded bg-electric-lime border-2 border-deep-black text-deep-black font-mono font-bold flex items-center justify-center text-xs">
                {activeCandidate.name.charAt(0)}
              </div>
              <div className="text-left">
                <span className="font-heading text-xs font-bold text-deep-black block leading-none">
                  {activeCandidate.name}
                </span>
                <span className="font-mono text-[10px] text-slate-gray">
                  {activeCandidate.rollNo}
                </span>
              </div>
            </div>
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
