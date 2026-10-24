import * as React from "react";
import { Link } from "react-router-dom";
import { PageContainer } from "@/components/ui/page-container";
import { PageTitle, SectionHeading, BodyText, SecondaryText, MonoBadge } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, Layers, ShieldCheck, CheckCircle2 } from "lucide-react";

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
            <span className="rounded bg-pale-blue px-2 py-0.5 font-mono text-xs text-muted-cobalt font-semibold border border-pale-blue-border">
              Phase 2 Implementation Notice
            </span>
            <MonoBadge>Entry Point</MonoBadge>
          </div>

          <PageTitle>Getting Started with Slotify</PageTitle>

          <BodyText className="text-slate-gray">
            Live coordinator authentication, student account registration, and active drive configuration
            are scheduled for implementation in Phase 3 alongside the FastAPI backend and Google OR-Tools
            constraint solver.
          </BodyText>
        </div>

        {/* Current Available Features */}
        <div className="space-y-4">
          <SectionHeading className="text-lg">What You Can Explore Right Now</SectionHeading>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="hover:border-slate-gray/40 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 rounded bg-pale-blue text-muted-cobalt">
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-base">Schedule Workspace</CardTitle>
                </div>
                <CardDescription>
                  Explore the multi-day interview calendar and slot inspector.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SecondaryText size="xs">
                  Interact with real interview mockups across multiple tracks, examine room buffers,
                  and review conflict notices.
                </SecondaryText>
                <Link to="/#preview" className="block">
                  <Button variant="primary" size="sm" className="w-full justify-center">
                    View Schedule Preview
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
                  <CardTitle className="text-base">Design System</CardTitle>
                </div>
                <CardDescription>
                  Inspect the accessible UI primitives and design tokens.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SecondaryText size="xs">
                  Browse button states, form controls, Radix UI selects, status indicator badges,
                  and color contrast matrices.
                </SecondaryText>
                <Link to="/showcase" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-center">
                    Explore Component Showcase
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
              Coming in Subsequent Phases
            </h3>
          </div>
          <div className="space-y-2 text-xs text-slate-gray font-body">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-slate-gray" aria-hidden="true" />
              <span>Placement coordinator login & recruitment drive creator.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-slate-gray" aria-hidden="true" />
              <span>Interviewer availability intake and maximum daily load configuration.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-slate-gray" aria-hidden="true" />
              <span>Student self-booking portal with live slot confirmations.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-slate-gray" aria-hidden="true" />
              <span>FastAPI backend powered by Google OR-Tools constraint satisfaction algorithms.</span>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
