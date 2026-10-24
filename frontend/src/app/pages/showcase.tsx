import * as React from "react";
import { PageContainer } from "@/components/ui/page-container";
import {
  PageTitle,
  SectionHeading,
  SubsectionHeading,
  BodyText,
  SecondaryText,
  FieldLabel,
  MonoBadge,
} from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Panel } from "@/components/ui/card";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Divider } from "@/components/ui/divider";
import { InterviewSlotCard } from "@/components/common/interview-slot-card";
import { ConstraintAlert } from "@/components/common/constraint-alert";
import { COLOR_TOKENS } from "@/config/tokens";
import type { InterviewSlot } from "@/types";
import { Calendar } from "lucide-react";

export const ShowcasePage: React.FC = () => {
  const [selectedSlotId, setSelectedSlotId] = React.useState<string>("slot-1");
  const [demoInput, setDemoInput] = React.useState<string>("Rohan Sharma");
  const [demoTrack, setDemoTrack] = React.useState<string>("swe");

  const sampleSlots: InterviewSlot[] = [
    {
      id: "slot-1",
      candidateName: "Aarav Patel",
      candidateRoll: "CS21B042",
      roundName: "Technical Round 1: Algorithms & Data Structures",
      panelist: "Dr. Vikram Sethi (Algorithms Lead)",
      room: "Hall 3, Block B",
      startTime: "09:30 AM",
      endTime: "10:15 AM",
      status: "confirmed",
    },
    {
      id: "slot-2",
      candidateName: "Priya Nair",
      candidateRoll: "EC21B019",
      roundName: "Technical Round 2: Distributed Systems",
      panelist: "Ananya Deshmukh (Principal Architect)",
      room: "Conference Room 4",
      startTime: "10:30 AM",
      endTime: "11:15 AM",
      status: "pending",
    },
    {
      id: "slot-3",
      candidateName: "Karan Verma",
      candidateRoll: "CS21B088",
      roundName: "System Design Assessment",
      panelist: "Rajesh Kulkarni (Engineering Director)",
      room: "Hall 3, Block B",
      startTime: "10:30 AM",
      endTime: "11:15 AM",
      status: "conflict",
      conflictReason: "Double booking detected with Hall 3, Block B for Dr. Sethi's session buffer.",
    },
    {
      id: "slot-4",
      candidateName: "Meera Sen",
      candidateRoll: "EE21B064",
      roundName: "Behavioral and Culture Alignment",
      panelist: "Sunita Rao (People Operations)",
      room: "Interview Cabin 2",
      startTime: "11:30 AM",
      endTime: "12:00 PM",
      status: "cancelled",
    },
  ];

  return (
    <PageContainer>
      <div className="space-y-12">
        {/* Showcase Intro Header */}
        <div className="space-y-2 border-b border-soft-border pb-6">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-cobalt bg-pale-blue px-2 py-0.5 rounded font-semibold">
              Development Showcase
            </span>
            <span className="text-xs text-slate-gray font-body">
              Route: /showcase (Accessible for design audit and regression testing)
            </span>
          </div>
          <PageTitle>Slotify Design System and UI Showcase</PageTitle>
          <BodyText className="text-slate-gray max-w-3xl">
            This showcase demonstrates the foundational design tokens, accessible UI primitives,
            and realistic interview scheduling components for Slotify: The Ancient One's Trials.
          </BodyText>
        </div>

        {/* SECTION 1: Approved Color Palette */}
        <section className="space-y-6" id="colors">
          <div>
            <SectionHeading>1. Approved Color Palette</SectionHeading>
            <SecondaryText size="sm">
              All 10 foundation colors are configured as semantic tokens. Contrast ratios meet WCAG AA standards.
            </SecondaryText>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {COLOR_TOKENS.map((token) => (
              <div
                key={token.name}
                className="rounded-md border border-soft-border bg-white p-3 shadow-subtle flex flex-col justify-between"
              >
                <div>
                  <div
                    className="h-16 w-full rounded border border-soft-border/70 mb-3 shadow-inner"
                    style={{ backgroundColor: token.hex }}
                    aria-label={`Color sample for ${token.name}`}
                  />
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-semibold text-xs text-charcoal">
                      {token.name}
                    </span>
                    <span className="font-mono text-[11px] text-slate-gray">
                      {token.hex}
                    </span>
                  </div>
                  <div className="mt-1">
                    <MonoBadge className="text-[10px] py-0 px-1">
                      {token.semanticRole}
                    </MonoBadge>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-slate-gray font-body leading-tight">
                  {token.purpose}
                </p>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* SECTION 2: Typography Hierarchy */}
        <section className="space-y-6" id="typography">
          <div>
            <SectionHeading>2. Typography Hierarchy</SectionHeading>
            <SecondaryText size="sm">
              Pairing Plus Jakarta Sans for structural display headings with DM Sans for dense interface tables and body copy.
            </SecondaryText>
          </div>

          <div className="rounded-md border border-soft-border bg-white p-6 shadow-card space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-baseline border-b border-soft-border/60 pb-4">
              <span className="font-mono text-xs text-slate-gray">PageTitle (h1)</span>
              <div className="md:col-span-3">
                <PageTitle>Slotify: The Ancient One's Trials</PageTitle>
                <SecondaryText size="xs" className="mt-1">Plus Jakarta Sans / Bold / 28px - 32px</SecondaryText>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-baseline border-b border-soft-border/60 pb-4">
              <span className="font-mono text-xs text-slate-gray">SectionHeading (h2)</span>
              <div className="md:col-span-3">
                <SectionHeading>Technical Interview Round Allocation Matrix</SectionHeading>
                <SecondaryText size="xs" className="mt-1">Plus Jakarta Sans / Semibold / 20px - 24px</SecondaryText>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-baseline border-b border-soft-border/60 pb-4">
              <span className="font-mono text-xs text-slate-gray">SubsectionHeading (h3)</span>
              <div className="md:col-span-3">
                <SubsectionHeading>Panelist Availability Constraints for Block A</SubsectionHeading>
                <SecondaryText size="xs" className="mt-1">Plus Jakarta Sans / Semibold / 16px - 18px</SecondaryText>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-baseline border-b border-soft-border/60 pb-4">
              <span className="font-mono text-xs text-slate-gray">BodyText (base)</span>
              <div className="md:col-span-3">
                <BodyText>
                  The Ancient One enforces strict scheduling invariants: every candidate must complete
                  preliminary algorithmic trials before progressing to system design deliberations.
                </BodyText>
                <SecondaryText size="xs" className="mt-1">DM Sans / Regular / 14px - 16px</SecondaryText>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-baseline border-b border-soft-border/60 pb-4">
              <span className="font-mono text-xs text-slate-gray">SecondaryText (sm)</span>
              <div className="md:col-span-3">
                <SecondaryText>
                  Candidate verified by student placement coordinators. Check room buffer time before assigning panel.
                </SecondaryText>
                <SecondaryText size="xs" className="mt-1">DM Sans / Regular / 12px - 14px / Slate Gray</SecondaryText>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-baseline">
              <span className="font-mono text-xs text-slate-gray">MonoBadge / Code</span>
              <div className="md:col-span-3 flex items-center gap-2">
                <MonoBadge>CONSTR_OVERLAP_PREVENT_01</MonoBadge>
                <MonoBadge>ROOM_HALL_3_BUFFER_15M</MonoBadge>
                <SecondaryText size="xs">JetBrains Mono / Medium / 12px</SecondaryText>
              </div>
            </div>
          </div>
        </section>

        <Divider />

        {/* SECTION 3: Buttons */}
        <section className="space-y-6" id="buttons">
          <div>
            <SectionHeading>3. Button Variants and Interaction States</SectionHeading>
            <SecondaryText size="sm">
              Standardized dimensions, high-contrast hover states, and accessible focus outlines.
            </SecondaryText>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Variants</CardTitle>
                <CardDescription>Primary, Secondary, Outline, Destructive, and Ghost.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary">
                    <Calendar className="h-4 w-4 mr-1.5" aria-hidden="true" />
                    Confirm Schedule
                  </Button>
                  <Button variant="secondary">
                    View Timetable
                  </Button>
                  <Button variant="outline">
                    Edit Parameters
                  </Button>
                  <Button variant="destructive">
                    Release Slot
                  </Button>
                  <Button variant="ghost">
                    Cancel Action
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sizes & States</CardTitle>
                <CardDescription>Small, Medium, Large, Disabled, and Loading.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" size="sm">Small (h-8)</Button>
                  <Button variant="primary" size="md">Medium (h-10)</Button>
                  <Button variant="primary" size="lg">Large (h-11)</Button>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-soft-border/60">
                  <Button variant="primary" disabled>Disabled Primary</Button>
                  <Button variant="outline" disabled>Disabled Outline</Button>
                  <Button variant="primary" isLoading>Processing</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Divider />

        {/* SECTION 4: Inputs and Selects */}
        <section className="space-y-6" id="form-controls">
          <div>
            <SectionHeading>4. Form Controls: Inputs and Selects</SectionHeading>
            <SecondaryText size="sm">
              Accessible form fields with explicit label associations, helper copy, and validation feedback.
            </SecondaryText>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Input States</CardTitle>
                <CardDescription>Standard, with helper, error state, and disabled.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Candidate Full Name"
                  placeholder="e.g. Rohan Sharma"
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  helperText="Enter the name as registered on campus placement portal."
                />

                <Input
                  label="Enrollment Roll Number"
                  placeholder="e.g. CS21B042"
                  error="Roll number must match standard campus format CS##B###."
                  defaultValue="CS-INVALID"
                />

                <Input
                  label="Interview Room Designation (Read Only)"
                  value="Auditorium Hall B (Locked by Admin)"
                  disabled
                  helperText="Room reallocation requires coordinator credentials."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Select Dropdowns</CardTitle>
                <CardDescription>Accessible Radix UI select components customized for Slotify.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SelectField
                  label="Recruitment Track"
                  placeholder="Select technical track..."
                  value={demoTrack}
                  onValueChange={setDemoTrack}
                  helperText="Defines the interview panel questions and time constraints."
                  options={[
                    { value: "swe", label: "Software Engineering (Core)" },
                    { value: "data", label: "Data Science & Machine Learning" },
                    { value: "systems", label: "Systems Architecture & DevOps" },
                    { value: "security", label: "Information Security & Cryptography" },
                  ]}
                />

                <SelectField
                  label="Interview Session Buffer"
                  placeholder="Select buffer..."
                  defaultValue="15m"
                  options={[
                    { value: "10m", label: "10 minutes buffer between rounds" },
                    { value: "15m", label: "15 minutes standard evaluation break" },
                    { value: "30m", label: "30 minutes panelist debrief" },
                  ]}
                />

                <SelectField
                  label="Evaluation Rubric"
                  placeholder="Select rubric..."
                  error="Evaluation rubric selection is mandatory before initiating scheduling."
                  options={[
                    { value: "rubric-1", label: "Standard Algorithmic Scoring (1 - 5)" },
                    { value: "rubric-2", label: "System Design Comprehensive Matrix" },
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </section>

        <Divider />

        {/* SECTION 5: Status Indicators & Alerts */}
        <section className="space-y-6" id="status-system">
          <div>
            <SectionHeading>5. Status Indicators and Constraint Alerts</SectionHeading>
            <SecondaryText size="sm">
              Multi-channel indicators: color, background tint, icon, and textual status to ensure accessibility.
            </SecondaryText>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status Indicator Variants</CardTitle>
                <CardDescription>Confirmed, Pending, Conflict, and Cancelled.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2.5 rounded bg-warm-ivory border border-soft-border">
                    <span className="text-xs font-medium text-charcoal">Confirmed Interview</span>
                    <StatusIndicator status="confirmed" />
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded bg-warm-ivory border border-soft-border">
                    <span className="text-xs font-medium text-charcoal">Awaiting Panel Response</span>
                    <StatusIndicator status="pending" />
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded bg-warm-ivory border border-soft-border">
                    <span className="text-xs font-medium text-charcoal">Time / Room Overlap</span>
                    <StatusIndicator status="conflict" />
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded bg-warm-ivory border border-soft-border">
                    <span className="text-xs font-medium text-charcoal">Cancelled by Candidate</span>
                    <StatusIndicator status="cancelled" />
                  </div>
                </div>

                <div className="pt-2 border-t border-soft-border/60">
                  <FieldLabel className="mb-2">Compact Dot Format (No Icon)</FieldLabel>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusIndicator status="confirmed" showIcon={false} size="sm" />
                    <StatusIndicator status="pending" showIcon={false} size="sm" />
                    <StatusIndicator status="conflict" showIcon={false} size="sm" />
                    <StatusIndicator status="cancelled" showIcon={false} size="sm" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Constraint Notice Panels</CardTitle>
                <CardDescription>Alert panels for scheduler feedback and conflict warnings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ConstraintAlert
                  type="warning"
                  title="Panelist Workload Threshold"
                  description="Dr. Sethi has reached 4 consecutive 45-minute evaluations without a mandatory rest interval."
                  constraintKey="MAX_HOURS_PER_PANELIST"
                />
                <ConstraintAlert
                  type="error"
                  title="Spatial Room Collision"
                  description="Hall 3, Block B is scheduled for simultaneous sessions at 10:30 AM."
                  constraintKey="EXCLUSIVE_ROOM_ASSIGNMENT"
                />
                <ConstraintAlert
                  type="info"
                  title="Scheduler Solver Note"
                  description="Automatic assignment engine respects candidate track prerequisites and lunch breaks."
                  constraintKey="SOLVER_OR_TOOLS_DEFAULT"
                />
              </CardContent>
            </Card>
          </div>
        </section>

        <Divider />

        {/* SECTION 6: Realistic Scheduling Composite Example */}
        <section className="space-y-6" id="composite-showcase">
          <div>
            <SectionHeading>6. Realistic Interview Scheduling Composites</SectionHeading>
            <SecondaryText size="sm">
              Demonstrating the integrated UI primitives in real-world recruitment scheduling scenarios.
            </SecondaryText>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-semibold text-sm text-charcoal">
                  Candidate Interview Slots: Batch 2026
                </h4>
                <span className="text-xs text-slate-gray font-mono">
                  4 Records Loaded
                </span>
              </div>

              <div className="space-y-3">
                {sampleSlots.map((slot) => (
                  <InterviewSlotCard
                    key={slot.id}
                    slot={slot}
                    isSelected={selectedSlotId === slot.id}
                    onSelectSlot={setSelectedSlotId}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-heading font-semibold text-sm text-charcoal">
                Active Slot Inspector
              </h4>
              <Panel variant="bordered" className="space-y-4">
                {selectedSlotId ? (
                  (() => {
                    const activeSlot = sampleSlots.find((s) => s.id === selectedSlotId);
                    if (!activeSlot) return null;
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-heading font-semibold text-sm text-charcoal">
                            Selected Detail
                          </span>
                          <StatusIndicator status={activeSlot.status} size="sm" />
                        </div>

                        <div className="space-y-2 text-xs font-body">
                          <div>
                            <span className="text-slate-gray block">Candidate:</span>
                            <span className="font-semibold text-charcoal">{activeSlot.candidateName}</span>
                            <span className="ml-2 font-mono text-slate-gray">({activeSlot.candidateRoll})</span>
                          </div>

                          <div>
                            <span className="text-slate-gray block">Round Name:</span>
                            <span className="text-charcoal">{activeSlot.roundName}</span>
                          </div>

                          <div>
                            <span className="text-slate-gray block">Interviewer:</span>
                            <span className="text-charcoal">{activeSlot.panelist}</span>
                          </div>

                          <div>
                            <span className="text-slate-gray block">Time Window:</span>
                            <span className="font-mono text-charcoal">{activeSlot.startTime} - {activeSlot.endTime}</span>
                          </div>

                          <div>
                            <span className="text-slate-gray block">Assigned Location:</span>
                            <span className="text-charcoal">{activeSlot.room}</span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-soft-border/70 flex flex-col gap-2">
                          <Button variant="primary" size="sm" className="w-full">
                            Confirm Time Window
                          </Button>
                          <Button variant="outline" size="sm" className="w-full">
                            Request Time Swap
                          </Button>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <SecondaryText size="xs">
                    Select any interview slot card to review its scheduling attributes and constraint validations.
                  </SecondaryText>
                )}
              </Panel>
            </div>
          </div>
        </section>

        {/* Navigation Return */}
        <div className="pt-6 border-t border-soft-border flex items-center justify-between">
          <SecondaryText size="xs">
            Slotify: The Ancient One's Trials (Phase 1 Frontend Foundation)
          </SecondaryText>
          <Button variant="outline" size="sm" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Return to Top
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};
