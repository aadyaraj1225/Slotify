import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import { useCoordinator } from "@/context/coordinator-context";
import { cn } from "@/lib/utils";

export interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const location = useLocation();

  const { drives, selectedDriveId, setSelectedDriveId, conflicts } = useCoordinator();

  const navigationItems = [
    { label: "Overview", path: "/coordinator/overview" },
    { label: "Recruitment Drives", path: "/coordinator/drives" },
    { label: "Candidates", path: "/coordinator/candidates" },
    { label: "Interviewers", path: "/coordinator/interviewers" },
    { label: "Rooms & Availability", path: "/coordinator/rooms" },
    { label: "Schedule", path: "/coordinator/schedule" },
  ];

  const secondaryItems = [
    { label: "Evaluations", path: "/coordinator/evaluations" },
    { label: "Settings", path: "/coordinator/settings" },
  ];

  const currentNav = navigationItems.find((item) =>
    location.pathname.startsWith(item.path)
  ) || secondaryItems.find((item) => location.pathname.startsWith(item.path)) || navigationItems[0];

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
        {/* Brand Wordmark Header */}
        <div className="flex h-20 items-center justify-between px-8 border-b border-[#252525]">
          <Link to="/coordinator/overview" className="flex items-center gap-3 text-left">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-electric-lime text-deep-black font-mono font-black text-base shadow-[2px_2px_0px_#F542A6]">
              S
            </div>
            <div>
              <span className="font-heading text-xl font-bold tracking-tight text-white block leading-none">
                Slotify
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-gray">
                Coordinator Console
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded p-1 text-muted-gray hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Primary Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-6 py-8 text-left" aria-label="Primary Navigation">
          <div className="px-3 pb-3 text-[10px] font-mono uppercase tracking-widest text-muted-gray">
            Workspace
          </div>
          {navigationItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
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
                <span>{item.label}</span>
                {item.label === "Schedule" && conflicts.length > 0 && (
                  <span className="rounded-full bg-hot-pink px-2 py-0.5 font-mono text-[10px] text-white font-bold">
                    {conflicts.length}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-8 px-3 pb-3 text-[10px] font-mono uppercase tracking-widest text-muted-gray">
            Configuration
          </div>
          {secondaryItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3.5 py-2.5 text-xs font-mono uppercase tracking-wider transition-all",
                  isActive
                    ? "bg-hot-pink text-white font-bold"
                    : "text-muted-gray hover:text-white hover:bg-[#252525]"
                )}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Return to Public Website */}
        <div className="border-t border-[#252525] p-6">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-mono uppercase tracking-wider text-muted-gray hover:text-white hover:bg-[#252525] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Public Website</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex flex-1 flex-col overflow-hidden min-h-screen">
        {/* Top Navigation Bar: Clean & High Contrast */}
        <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b-2 border-deep-black bg-white px-6 sm:px-10 lg:px-14">
          {/* Left: Section Label */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded p-1.5 text-deep-black hover:bg-black/5 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <span className="font-heading text-lg font-bold text-deep-black uppercase tracking-wide">
              {currentNav.label}
            </span>
          </div>

          {/* Right: Scope Selector & Coordinator Identity */}
          <div className="flex items-center gap-4">
            {/* Drive Selector */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-slate-gray font-mono uppercase">Scope:</span>
              <select
                id="drive-selector"
                value={selectedDriveId}
                onChange={(e) => setSelectedDriveId(e.target.value)}
                className="h-10 rounded-lg border-2 border-deep-black bg-white px-3 text-xs font-mono text-deep-black focus:outline-none focus:ring-2 focus:ring-electric-lime"
              >
                <option value="all">All Drives Combined</option>
                {drives.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 rounded-lg border-2 border-deep-black bg-white px-3 py-1.5 hover:bg-[#FAF9F5] transition-colors focus-visible:outline-none shadow-[2px_2px_0px_#101010]"
                aria-expanded={profileOpen}
              >
                <span className="text-xs font-mono font-bold text-deep-black">
                  Dr. Vikram Sethi
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-deep-black" aria-hidden="true" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-xl border-2 border-deep-black bg-white p-5 shadow-[4px_4px_0px_#101010] z-50 text-left space-y-3">
                  <div>
                    <span className="inline-block rounded-full bg-electric-lime px-2.5 py-0.5 font-mono text-[10px] text-deep-black font-bold border border-deep-black/30">
                      Placement Lead
                    </span>
                    <p className="font-heading font-bold text-sm text-deep-black mt-1.5">
                      Dr. Vikram Sethi
                    </p>
                    <p className="font-mono text-xs text-slate-gray">
                      v.sethi@campus.edu
                    </p>
                  </div>
                  <div className="border-t border-[#E4E3DD] pt-2 text-xs text-slate-gray space-y-1">
                    <p>Department: Computer Science</p>
                    <p>Role: Head Coordinator</p>
                  </div>
                  <div className="border-t border-[#E4E3DD] pt-2">
                    <Link
                      to="/coordinator/settings"
                      onClick={() => setProfileOpen(false)}
                      className="block text-xs font-mono text-hot-pink font-bold hover:underline"
                    >
                      Workspace Settings
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Content Pane with Warm Off-White Background */}
        <main className="flex-1 overflow-y-auto bg-warm-offwhite">
          {children}
        </main>
      </div>
    </div>
  );
};
