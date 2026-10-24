import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Layers } from "lucide-react";

export const CallToAction: React.FC = () => {
  return (
    <section id="cta" className="py-16 sm:py-24 bg-warm-ivory">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-charcoal leading-tight">
            Make interview scheduling easier to coordinate.
          </h2>

          <p className="font-body text-base sm:text-lg text-slate-gray leading-relaxed max-w-2xl mx-auto">
            Slotify is being developed to help placement coordinators build resilient, conflict-free interview
            timetables across candidates, specialized panels, and university venues.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/get-started" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto justify-center">
                <span>Get started</span>
                <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
              </Button>
            </Link>

            <Link to="/showcase" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto justify-center">
                <Layers className="h-4 w-4 mr-2" aria-hidden="true" />
                <span>Explore Design System</span>
              </Button>
            </Link>
          </div>

          <p className="font-body text-xs text-slate-gray pt-4">
            Phase 2 implementation. Constraint solver engine and coordinator accounts scheduled for Phase 3.
          </p>
        </div>
      </div>
    </section>
  );
};
