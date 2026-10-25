import * as React from "react";
import { HeroSection } from "@/components/landing/hero-section";
import { WorkflowSection } from "@/components/landing/workflow-section";
import { CapabilitiesSection } from "@/components/landing/capabilities-section";
import { SchedulePreview } from "@/components/landing/schedule-preview";

export const LandingPage: React.FC = () => {
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
      <WorkflowSection />
      <CapabilitiesSection />
      <SchedulePreview />
    </div>
  );
};
