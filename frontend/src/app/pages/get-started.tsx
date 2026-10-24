import * as React from "react";
import { Link } from "react-router-dom";
import { PageContainer } from "@/components/ui/page-container";
import { PageTitle, SectionHeading, BodyText, SecondaryText, MonoBadge } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, Layers, ShieldCheck, CheckCircle2, LayoutDashboard, ArrowRight } from "lucide-react";

export const GetStartedPage: React.FC = () => {
  return (
    <PageContainer size="narrow">
      <div className="space-y-8 text-left py-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-gray hover:text-charcoal transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Return to Landing Page</span>
        </Link>

        {/* Header Notice */}
        <div className="rounded-lg border border-soft-border bg-white p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center gap-2">
            <span className="rounded bg-success-green/10 text-success-green px-2 py-0.5 font-mono text-xs font-semibold border border-success-green/30">
              Phase 3 Live: Coordinator Dashboard
            </span>
            <MonoBadge>Active Workspace</MonoBadge>
          </div>

          <PageTitle>Enter the Placement Coordinator Workspace</PageTitle>

          <BodyText className="text-slate-gray">
            The Coordinator Dashboard is now live. Placement teams can configure recruitment drives, manage
            candidate rosters, inspect panel workloads, and run the simulated constraint schedule generator.
          </BodyText>

          <div className="pt-2">
            <Link to="/coordinator/overview">
              <Button variant="primary" size="lg" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span>Launch Coordinator Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Workspace Feature Cards */}
        <div className="space-y-4">
          <SectionHeading className="text-lg">Dashboard Capabilities Available Now</SectionHeading>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="hover:border-slate-gray/40 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 rounded bg-pale-blue text-muted-cobalt">
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-base">Schedule & Generator</CardTitle>
                </div>
                <CardDescription>
                  Timetable matrix, conflict inspection, and generator routine.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SecondaryText size="xs">
                  Run the demo constraint scheduler to allocate unassigned students and review room buffer warnings.
                </SecondaryText>
                <Link to="/coordinator/schedule" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-center">
                    Open Schedule Workspace
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:border-slate-gray/40 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 rounded bg-pale-blue text-muted-cobalt">
                    <Layers className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-base">Recruitment Drives</CardTitle>
                </div>
                <CardDescription>
                  Configure multi-round evaluation pipelines.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SecondaryText size="xs">
                  Create new company drives, add sequential rounds (Coding, Technical, HR), and track active status.
                </SecondaryText>
                <Link to="/coordinator/drives" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-center">
                    Manage Drives
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Roadmap Next Steps */}
        <div className="rounded-lg border border-soft-border bg-[#ECEAE4]/50 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-muted-cobalt" aria-hidden="true" />
            <h3 className="font-heading font-semibold text-sm text-charcoal">
              Phase 4 Architecture (Upcoming)
            </h3>
          </div>
          <div className="space-y-2 text-xs text-slate-gray font-body">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-slate-gray" aria-hidden="true" />
              <span>FastAPI backend integration with Google OR-Tools constraint satisfaction engine.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-slate-gray" aria-hidden="true" />
              <span>Student self-booking portal and live real-time slot selection.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-slate-gray" aria-hidden="true" />
              <span>Production database persistence and multi-tenant university deployment.</span>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
