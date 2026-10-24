import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Button } from "@/components/ui/button";
import { Clock, User, MapPin } from "lucide-react";
import type { InterviewSlot } from "@/types";

export interface InterviewSlotCardProps {
  slot: InterviewSlot;
  onSelectSlot?: (id: string) => void;
  isSelected?: boolean;
}

export const InterviewSlotCard: React.FC<InterviewSlotCardProps> = ({
  slot,
  onSelectSlot,
  isSelected = false,
}) => {
  return (
    <Card
      className={`transition-all ${
        isSelected
          ? "border-muted-cobalt bg-pale-blue/30 shadow-subtle ring-1 ring-muted-cobalt"
          : "hover:border-[#C4C2BA]"
      }`}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-heading font-semibold text-sm sm:text-base text-charcoal">
                {slot.candidateName}
              </span>
              <span className="font-mono text-xs text-slate-gray px-1.5 py-0.5 rounded bg-[#ECEAE4]">
                {slot.candidateRoll}
              </span>
            </div>
            <p className="text-xs text-slate-gray font-body font-medium">
              {slot.roundName}
            </p>
          </div>
          <StatusIndicator status={slot.status} size="sm" />
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-soft-border/70 text-xs text-slate-gray">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-gray shrink-0" aria-hidden="true" />
            <span className="font-mono text-charcoal">{slot.startTime} - {slot.endTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-slate-gray shrink-0" aria-hidden="true" />
            <span className="truncate">{slot.panelist}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-slate-gray shrink-0" aria-hidden="true" />
            <span className="truncate">{slot.room}</span>
          </div>
        </div>

        {slot.conflictReason && (
          <div className="mt-3 rounded bg-error-red/10 border border-error-red/20 px-3 py-1.5 text-xs text-error-red font-body">
            <span className="font-semibold">Constraint Notice:</span> {slot.conflictReason}
          </div>
        )}

        <div className="mt-4 flex items-center justify-end gap-2 pt-2">
          {onSelectSlot && (
            <Button
              variant={isSelected ? "primary" : "outline"}
              size="sm"
              onClick={() => onSelectSlot(slot.id)}
            >
              {isSelected ? "Selected Slot" : "Select Slot"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
