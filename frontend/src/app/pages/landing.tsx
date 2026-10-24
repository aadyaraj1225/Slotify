import * as React from "react";
import { HeroSection } from "@/components/landing/hero-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { ApproachSection } from "@/components/landing/approach-section";
import { WorkflowSection } from "@/components/landing/workflow-section";
import { CapabilitiesSection } from "@/components/landing/capabilities-section";
import { SchedulePreview } from "@/components/landing/schedule-preview";
import { CallToAction } from "@/components/landing/call-to-action";

export const LandingPage: React.FC = () => {
  // Handle in-page hash on initial page load if direct link e.g. /#preview
  React.useEffect(() => {
    if (window.location.hash) {
      const element = document.querySelector(window.location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, []);

  return (
    <div className="w-full">
      <HeroSection />
      <ProblemSection />
      <ApproachSection />
      <WorkflowSection />
      <CapabilitiesSection />
      <SchedulePreview />
      <CallToAction />
    </div>
  );
};
