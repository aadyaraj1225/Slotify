import * as React from "react";
import { AppHeader } from "./app-header";

export interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <AppHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-soft-border bg-white py-6">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between px-4 sm:px-6 lg:px-8 text-xs text-slate-gray font-body gap-2">
          <div>
            <span className="font-semibold text-charcoal">Slotify</span>: The Ancient One's Trials
            (Constraint-Based Recruitment Scheduler)
          </div>
          <div>Phase 1: Project Setup and Design System (Light-First Architecture)</div>
        </div>
      </footer>
    </div>
  );
};
