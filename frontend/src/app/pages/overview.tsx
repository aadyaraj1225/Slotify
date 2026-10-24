import * as React from "react";
import { Link } from "react-router-dom";
import { PageContainer } from "@/components/ui/page-container";
import { PageTitle, SectionHeading, BodyText, SecondaryText, MonoBadge } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { CheckCircle2, ArrowRight, ShieldCheck, Palette, Type, Component } from "lucide-react";

export const OverviewPage: React.FC = () => {
  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Header Hero Section */}
        <div className="rounded-lg border border-soft-border bg-white p-6 sm:p-8 shadow-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded bg-success-green/10 px-2 py-0.5 text-xs font-medium text-success-green border border-success-green/30">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Phase 1 Foundation Complete
                </span>
                <MonoBadge>v0.1.0</MonoBadge>
              </div>
              <PageTitle>Slotify: The Ancient One's Trials</PageTitle>
              <BodyText className="text-slate-gray">
                A constraint-based recruitment interview scheduling platform designed for high-throughput
                campus recruitment drives. Built with a light-first design system, accessible UI primitives,
                and centralized design tokens.
              </BodyText>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link to="/showcase">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  <span>Explore Design System</span>
                  <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Foundation Pillars */}
        <div>
          <SectionHeading className="mb-4">Phase 1 Architecture Pillars</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 rounded bg-pale-blue text-muted-cobalt">
                    <Palette className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-base">Approved Palette</CardTitle>
                </div>
                <CardDescription>
                  10 exact foundation colors mapped to semantic CSS variables.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SecondaryText size="sm">
                  Warm Ivory (#F7F6F2) background, crisp White (#FFFFFF) surfaces, Charcoal (#202321) text,
                  and Muted Cobalt (#3559C7) accents ensure high contrast and readable scheduling data.
                </SecondaryText>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 rounded bg-pale-blue text-muted-cobalt">
                    <Type className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-base">Typography Pair</CardTitle>
                </div>
                <CardDescription>
                  Plus Jakarta Sans headings paired with DM Sans interface body.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SecondaryText size="sm">
                  Delivers structural hierarchy across interview matrices, panel allocations, and candidate
                  timetables without decorative distractions or legibility degradation.
                </SecondaryText>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 rounded bg-pale-blue text-muted-cobalt">
                    <Component className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-base">Accessible Primitives</CardTitle>
                </div>
                <CardDescription>
                  WAI-ARIA compliant controls styled strictly for Slotify.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SecondaryText size="sm">
                  Buttons, form inputs, Radix UI selects, panels, and status badges built with keyboard
                  navigation, clear focus rings, and multi-channel status representation.
                </SecondaryText>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Status System Summary */}
        <div className="rounded-lg border border-soft-border bg-white p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-heading text-base font-semibold text-charcoal">
                Scheduling Status Taxonomy
              </h3>
              <SecondaryText size="xs">
                Status indicators combine clear labels, semantic tints, and icons to avoid color-only communication.
              </SecondaryText>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusIndicator status="confirmed" />
              <StatusIndicator status="pending" />
              <StatusIndicator status="conflict" />
              <StatusIndicator status="cancelled" />
            </div>
          </div>
        </div>

        {/* Phase Roadmap Note */}
        <div className="rounded-lg border border-soft-border bg-[#ECEAE4]/40 p-5 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-muted-cobalt shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <h4 className="font-heading font-medium text-sm text-charcoal">
              Phase 1 Scope Boundary
            </h4>
            <SecondaryText size="xs">
              Backend algorithms (FastAPI, Google OR-Tools constraint solver), database integrations,
              and candidate booking mutations are reserved for Phase 2. This codebase establishes the
              design system and component architecture.
            </SecondaryText>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
