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
    <div className="flex min-h-screen bg-warm-ivory text-foreground font-body">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-charcoal/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-soft-border bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-soft-border px-5">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-muted-cobalt text-white">
              <Calendar className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <span className="font-heading text-base font-bold tracking-tight text-charcoal leading-none block">
                Slotify
              </span>
              <span className="font-mono text-[10px] text-slate-gray">
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
        <nav className="flex-1 space-y-1 overflow-y-auto p-4 text-left" aria-label="Sidebar">
          <div className="pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-gray px-3 font-heading">
            Management
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
                  "flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium font-body transition-colors",
                  isActive
                    ? "bg-pale-blue text-muted-cobalt font-semibold shadow-subtle"
                    : "text-slate-gray hover:bg-[#ECEAE4] hover:text-charcoal"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-muted-cobalt" : "text-slate-gray"
                  )}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
                {item.label === "Schedule" && conflicts.length > 0 && (
                  <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-error-red px-1 font-mono text-[9px] font-bold text-white">
                    {conflicts.length}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Return to Public Website */}
        <div className="border-t border-soft-border p-4">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-gray hover:bg-[#ECEAE4] hover:text-charcoal transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Return to Website</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-soft-border bg-white px-4 sm:px-6 lg:px-8">
          {/* Left: Mobile Toggle & Page Title / Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded p-1.5 text-slate-gray hover:bg-[#ECEAE4] hover:text-charcoal lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-heading">
              <span className="text-slate-gray hidden sm:inline">Coordinator</span>
              <span className="text-slate-gray hidden sm:inline">/</span>
              <span className="font-bold text-charcoal">{currentNav.label}</span>
            </div>
          </div>

          {/* Right: Active Drive Selector, Notifications & Profile */}
          <div className="flex items-center gap-3">
            {/* Recruitment Drive Selector */}
            <div className="hidden md:flex items-center gap-2">
              <label htmlFor="drive-selector" className="text-xs text-slate-gray font-mono">
                Active Drive:
              </label>
              <select
                id="drive-selector"
                value={selectedDriveId}
                onChange={(e) => setSelectedDriveId(e.target.value)}
                className="h-8 rounded border border-soft-border bg-[#FDFCFB] px-2.5 text-xs font-medium text-charcoal focus:outline-none focus:ring-1 focus:ring-muted-cobalt"
              >
                <option value="all">All Recruitment Drives</option>
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
                className="relative rounded-full p-2 text-slate-gray hover:bg-[#ECEAE4] hover:text-charcoal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-muted-cobalt"
                aria-label="Notifications"
                aria-expanded={notificationOpen}
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
                {conflicts.length > 0 && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-error-red ring-2 ring-white" />
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-lg border border-soft-border bg-white p-4 shadow-elevated z-50 text-left">
                  <div className="flex items-center justify-between border-b border-soft-border pb-2 mb-3">
                    <span className="font-heading text-xs font-bold text-charcoal">
                      Coordinator Alerts
                    </span>
                    <span className="font-mono text-[10px] text-slate-gray">
                      Demo Feed
                    </span>
                  </div>
                  <div className="space-y-2.5 max-h-64 overflow-y-auto">
                    {conflicts.map((conf) => (
                      <div
                        key={conf.id}
                        className="rounded border border-error-red/20 bg-error-red/5 p-2.5 text-xs text-charcoal"
                      >
                        <div className="flex items-center gap-1.5 text-error-red font-semibold mb-1">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                          <span>{conf.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-gray leading-tight">
                          {conf.description}
                        </p>
                      </div>
                    ))}
                    <div className="rounded border border-soft-border bg-warm-ivory p-2.5 text-xs">
                      <div className="flex items-center gap-1.5 text-success-green font-semibold mb-1">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span>System Verification Passed</span>
                      </div>
                      <p className="text-[11px] text-slate-gray leading-tight">
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
                className="flex items-center gap-2 rounded-md border border-soft-border bg-white px-2.5 py-1.5 hover:bg-[#ECEAE4] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-muted-cobalt"
                aria-expanded={profileOpen}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-pale-blue text-muted-cobalt font-mono text-[11px] font-bold">
                  VS
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold font-heading text-charcoal leading-tight">
                    Dr. Vikram Sethi
                  </span>
                  <span className="text-[10px] text-slate-gray font-mono leading-tight">
                    Placement Coordinator
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-slate-gray" aria-hidden="true" />
              </button>

              {/* Profile Dropdown Panel */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-lg border border-soft-border bg-white p-4 shadow-elevated z-50 text-left space-y-3">
                  <div>
                    <span className="inline-block rounded bg-pale-blue px-2 py-0.5 font-mono text-[10px] text-muted-cobalt font-semibold border border-pale-blue-border">
                      Demo Coordinator Profile
                    </span>
                    <p className="font-heading font-bold text-sm text-charcoal mt-1">
                      Dr. Vikram Sethi
                    </p>
                    <p className="font-mono text-xs text-slate-gray">
                      v.sethi@campus.edu
                    </p>
                  </div>
                  <div className="border-t border-soft-border pt-2 text-xs text-slate-gray font-body space-y-1">
                    <p>Department: Computer Science & Engineering</p>
                    <p>Role: Head Placement Coordinator</p>
                  </div>
                  <div className="border-t border-soft-border pt-2">
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

        {/* Dynamic Content Pane */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};
