import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CallToAction: React.FC = () => {
  return (
    <section className="py-20 bg-deep-black text-white text-left border-t-2 border-deep-black">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="rounded-2xl border-2 border-[#333333] bg-near-black p-8 sm:p-12 shadow-[6px_6px_0px_#D7FF35] flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h2 className="font-heading text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Ready to eliminate recruitment day clashes?
            </h2>
            <p className="font-body text-sm sm:text-base text-muted-gray leading-relaxed">
              Start configuring recruitment drives, managing room capacities, and assigning faculty interview panels with mathematical certainty.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <Link to="/signup">
              <Button variant="primary" size="lg" className="w-full sm:w-auto justify-center bg-electric-lime text-deep-black font-bold border-2 border-deep-black shadow-[3px_3px_0px_#101010]">
                <span>Get Started Now</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto justify-center border border-[#333333] text-white hover:border-white">
                <span>Sign In to Portal</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
