import type { ReactNode } from "react";
import type { SlotStatus } from "@/config/tokens";

export type { SlotStatus };

export type ButtonVariant = "primary" | "secondary" | "outline" | "destructive" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface InterviewSlot {
  id: string;
  candidateName: string;
  candidateRoll: string;
  roundName: string;
  panelist: string;
  room: string;
  startTime: string;
  endTime: string;
  status: SlotStatus;
  conflictReason?: string;
}

export interface ComponentDocumentation {
  name: string;
  description: string;
  props: Array<{
    name: string;
    type: string;
    defaultValue?: string;
    description: string;
  }>;
}

export interface LayoutProps {
  children: ReactNode;
  className?: string;
}
