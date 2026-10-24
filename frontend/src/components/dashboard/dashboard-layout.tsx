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
    <div className="flex min-h-screen bg-[#F7F6F2] text-[#202321] font-body antialiased">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-charcoal/20 backdrop-blur-[2px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Spacious, Minimal Editorial Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#E4E3DD]/80 bg-[#FAF9F5] transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Wordmark Header */}
        <div className="flex h-20 items-center justify-between px-8 border-b border-[#E4E3DD]/60">
          <Link to="/coordinator/overview" className="flex flex-col text-left group">
            <span className="font-heading text-2xl font-normal tracking-tight text-charcoal">
              Slotify
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-gray mt-0.5">
              Campus Recruitment
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded p-1 text-slate-gray hover:text-charcoal lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Primary Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-6 py-8 text-left" aria-label="Primary Navigation">
          <div className="px-3 pb-3 text-[10px] font-mono uppercase tracking-widest text-slate-gray/70">
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
                  "flex items-center justify-between rounded-lg px-3.5 py-2.5 text-[13px] transition-colors",
                  isActive
                    ? "bg-[#E9EEFC] text-[#3559C7] font-medium"
                    : "text-slate-gray hover:text-charcoal hover:bg-[#F2EFE9]"
                )}
              >
                <span>{item.label}</span>
                {item.label === "Schedule" && conflicts.length > 0 && (
                  <span className="rounded-full bg-[#FDF0F0] px-2 py-0.5 font-mono text-[10px] text-error-red border border-error-red/20">
                    {conflicts.length}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-8 px-3 pb-3 text-[10px] font-mono uppercase tracking-widest text-slate-gray/70">
            Preferences
          </div>
          {secondaryItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3.5 py-2.5 text-[13px] transition-colors",
                  isActive
                    ? "bg-[#E9EEFC] text-[#3559C7] font-medium"
                    : "text-slate-gray hover:text-charcoal hover:bg-[#F2EFE9]"
                )}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Return to Public Website */}
        <div className="border-t border-[#E4E3DD]/60 p-6">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-gray hover:text-charcoal hover:bg-[#F2EFE9] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Return to Public Website</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex flex-1 flex-col overflow-hidden min-h-screen">
        {/* Top Navigation Bar: Minimal & Open */}
        <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-[#E4E3DD]/80 bg-[#FAF9F5]/90 backdrop-blur-sm px-6 sm:px-10 lg:px-14">
          {/* Left: Section Label */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded p-1.5 text-slate-gray hover:bg-[#F2EFE9] hover:text-charcoal lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <span className="font-heading text-sm font-medium text-charcoal">
              {currentNav.label}
            </span>
          </div>

          {/* Right: Scope Selector & Coordinator Identity */}
          <div className="flex items-center gap-4">
            {/* Drive Selector */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-slate-gray font-mono">Scope:</span>
              <select
                id="drive-selector"
                value={selectedDriveId}
                onChange={(e) => setSelectedDriveId(e.target.value)}
                className="h-9 rounded-lg border border-[#E4E3DD] bg-white px-3 text-xs text-charcoal focus:outline-none focus:border-muted-cobalt transition-colors"
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
                className="flex items-center gap-2.5 rounded-lg border border-[#E4E3DD] bg-white px-3 py-1.5 hover:bg-[#FAF9F5] transition-colors focus-visible:outline-none"
                aria-expanded={profileOpen}
              >
                <span className="text-xs font-medium text-charcoal">
                  Dr. Vikram Sethi
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-gray" aria-hidden="true" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-xl border border-[#E4E3DD] bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] z-50 text-left space-y-3">
                  <div>
                    <span className="inline-block rounded-full bg-[#E9EEFC] px-2.5 py-0.5 font-mono text-[10px] text-[#3559C7]">
                      Coordinator
                    </span>
                    <p className="font-heading font-medium text-sm text-charcoal mt-1.5">
                      Dr. Vikram Sethi
                    </p>
                    <p className="font-mono text-xs text-slate-gray">
                      v.sethi@campus.edu
                    </p>
                  </div>
                  <div className="border-t border-[#E4E3DD]/60 pt-2 text-xs text-slate-gray space-y-1">
                    <p>Department: Computer Science</p>
                    <p>Role: Head Placement Coordinator</p>
                  </div>
                  <div className="border-t border-[#E4E3DD]/60 pt-2">
                    <Link
                      to="/coordinator/settings"
                      onClick={() => setProfileOpen(false)}
                      className="block text-xs font-medium text-[#3559C7] hover:underline"
                    >
                      Workspace Settings
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Content Pane with Generous Whitespace */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
