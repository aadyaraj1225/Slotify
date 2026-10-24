import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  UserCheck,
  DoorOpen,
  Calendar,
  FileCheck,
  Settings,
  Bell,
  Menu,
  X,
  ChevronDown,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useCoordinator } from "@/context/coordinator-context";
import { cn } from "@/lib/utils";

export interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [notificationOpen, setNotificationOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const location = useLocation();

  const { drives, selectedDriveId, setSelectedDriveId, conflicts } = useCoordinator();

  const navigationItems = [
    { label: "Overview", path: "/coordinator/overview", icon: LayoutDashboard },
    { label: "Recruitment Drives", path: "/coordinator/drives", icon: Briefcase },
    { label: "Candidates", path: "/coordinator/candidates", icon: Users },
    { label: "Interviewers", path: "/coordinator/interviewers", icon: UserCheck },
    { label: "Rooms & Availability", path: "/coordinator/rooms", icon: DoorOpen },
    { label: "Schedule", path: "/coordinator/schedule", icon: Calendar },
    { label: "Evaluations", path: "/coordinator/evaluations", icon: FileCheck },
    { label: "Settings", path: "/coordinator/settings", icon: Settings },
  ];

  const currentNav = navigationItems.find((item) =>
    location.pathname.startsWith(item.path)
  ) || navigationItems[0];

  return (
    <div className="flex min-h-screen bg-warm-ivory text-foreground font-body antialiased">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-charcoal/30 backdrop-blur-[2px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Understated Editorial Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-soft-border/90 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center justify-between border-b border-[#F0EFEB] px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted-cobalt text-white shadow-none">
              <Calendar className="h-4 w-4 stroke-[1.75]" aria-hidden="true" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-heading text-base font-bold tracking-tight text-charcoal leading-none">
                Slotify
              </span>
              <span className="font-body text-[11px] text-slate-gray mt-0.5">
                Coordinator Workspace
              </span>
            </div>
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

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6 text-left" aria-label="Sidebar">
          <div className="pb-3 text-[11px] font-medium uppercase tracking-wider text-slate-gray/80 px-3 font-heading">
            Navigation
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
                  "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium font-body transition-all",
                  isActive
                    ? "bg-pale-blue text-muted-cobalt font-semibold"
                    : "text-slate-gray hover:bg-[#F5F4F0] hover:text-charcoal"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 stroke-[1.6]",
                    isActive ? "text-muted-cobalt" : "text-slate-gray"
                  )}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
                {item.label === "Schedule" && conflicts.length > 0 && (
                  <span className="ml-auto rounded-full bg-error-red/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-error-red border border-error-red/20">
                    {conflicts.length}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Return to Public Website */}
        <div className="border-t border-[#F0EFEB] p-4">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-gray hover:bg-[#F5F4F0] hover:text-charcoal transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Return to Website</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 flex h-18 w-full items-center justify-between border-b border-soft-border/90 bg-white/95 backdrop-blur-sm px-6 sm:px-8 lg:px-10">
          {/* Left: Page Title / Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded p-1.5 text-slate-gray hover:bg-warm-ivory hover:text-charcoal lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="flex items-center gap-2 text-sm font-heading">
              <span className="text-slate-gray hidden sm:inline">Workspace</span>
              <span className="text-slate-gray/40 hidden sm:inline">/</span>
              <span className="font-semibold text-charcoal">{currentNav.label}</span>
            </div>
          </div>

          {/* Right: Active Drive Selector, Notifications & Profile */}
          <div className="flex items-center gap-4">
            {/* Recruitment Drive Selector */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs text-slate-gray font-body">Scope:</span>
              <select
                id="drive-selector"
                value={selectedDriveId}
                onChange={(e) => setSelectedDriveId(e.target.value)}
                className="h-8 rounded-md border border-soft-border bg-[#FDFCFB] px-3 text-xs font-medium text-charcoal focus:outline-none focus:ring-1 focus:ring-muted-cobalt"
              >
                <option value="all">All Drives Combined</option>
                {drives.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Notification Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationOpen(!notificationOpen);
                  setProfileOpen(false);
                }}
                className="relative rounded-full p-2 text-slate-gray hover:bg-warm-ivory hover:text-charcoal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-muted-cobalt"
                aria-label="Notifications"
                aria-expanded={notificationOpen}
              >
                <Bell className="h-4 w-4 stroke-[1.6]" aria-hidden="true" />
                {conflicts.length > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error-red" />
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {notificationOpen && (
                <div className="absolute right-0 mt-3 w-80 rounded-xl border border-soft-border bg-white p-5 shadow-elevated z-50 text-left">
                  <div className="flex items-center justify-between border-b border-[#F0EFEB] pb-3 mb-3">
                    <span className="font-heading text-xs font-bold text-charcoal">
                      Coordinator Alerts
                    </span>
                    <span className="font-mono text-[10px] text-slate-gray">
                      Active Invariants
                    </span>
                  </div>
                  <div className="space-y-2.5 max-h-64 overflow-y-auto">
                    {conflicts.length === 0 ? (
                      <p className="text-xs text-slate-gray py-2">No active scheduling conflicts detected.</p>
                    ) : (
                      conflicts.map((conf) => (
                        <div
                          key={conf.id}
                          className="rounded-lg border border-error-red/20 bg-error-red/5 p-3 text-xs text-charcoal"
                        >
                          <div className="flex items-center gap-1.5 text-error-red font-semibold mb-1">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            <span>{conf.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-gray leading-relaxed">
                            {conf.description}
                          </p>
                        </div>
                      ))
                    )}
                    <div className="rounded-lg border border-soft-border bg-warm-ivory/60 p-3 text-xs">
                      <div className="flex items-center gap-1.5 text-success-green font-semibold mb-1">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span>System Verification Passed</span>
                      </div>
                      <p className="text-[11px] text-slate-gray leading-relaxed">
                        All room capacity parameters match academic block fire safety regulations.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationOpen(false);
                }}
                className="flex items-center gap-2.5 rounded-lg border border-soft-border bg-white px-3 py-1.5 hover:bg-warm-ivory transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-muted-cobalt"
                aria-expanded={profileOpen}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-pale-blue text-muted-cobalt font-mono text-[11px] font-bold">
                  VS
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold font-heading text-charcoal leading-tight">
                    Dr. Vikram Sethi
                  </span>
                  <span className="text-[10px] text-slate-gray font-body leading-tight">
                    Placement Lead
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-slate-gray stroke-[1.6]" aria-hidden="true" />
              </button>

              {/* Profile Dropdown Panel */}
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-xl border border-soft-border bg-white p-5 shadow-elevated z-50 text-left space-y-3">
                  <div>
                    <span className="inline-block rounded bg-pale-blue px-2 py-0.5 font-mono text-[10px] text-muted-cobalt font-semibold border border-pale-blue-border">
                      Coordinator Profile
                    </span>
                    <p className="font-heading font-bold text-sm text-charcoal mt-1.5">
                      Dr. Vikram Sethi
                    </p>
                    <p className="font-mono text-xs text-slate-gray">
                      v.sethi@campus.edu
                    </p>
                  </div>
                  <div className="border-t border-[#F0EFEB] pt-2 text-xs text-slate-gray font-body space-y-1">
                    <p>Department: Computer Science & Engineering</p>
                    <p>Role: Head Placement Coordinator</p>
                  </div>
                  <div className="border-t border-[#F0EFEB] pt-2">
                    <Link
                      to="/coordinator/settings"
                      onClick={() => setProfileOpen(false)}
                      className="block text-xs font-medium text-muted-cobalt hover:underline"
                    >
                      Workspace Settings & Demo Reset
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Content Pane with Generous Padding */}
        <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};
