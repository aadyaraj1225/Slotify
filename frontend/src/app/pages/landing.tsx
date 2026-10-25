import * as React from "react";
import { HeroSection } from "@/components/landing/hero-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { WorkflowSection } from "@/components/landing/workflow-section";
import { CapabilitiesSection } from "@/components/landing/capabilities-section";
import { CallToAction } from "@/components/landing/cta-section";

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
      {/* 1. Hero */}
      <HeroSection />
      {/* 2. Problem Statement */}
      <ProblemSection />
      {/* 3. How It Works: 3-step workflow */}
      <WorkflowSection />
      {/* 4. Core Invariants / Features */}
      <CapabilitiesSection />
      {/* 5. Final Call To Action */}
      <CallToAction />
    </div>
  );
};
