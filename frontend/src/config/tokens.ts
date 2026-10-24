/**
 * Slotify Design Tokens and Theme Configuration
 * Foundation Phase 1
 */

export const PALETTE = {
  warmIvory: "#F7F6F2",
  white: "#FFFFFF",
  charcoal: "#202321",
  slateGray: "#626A70",
  mutedCobalt: "#3559C7",
  mutedCobaltHover: "#2B49A8",
  mutedCobaltActive: "#233D8D",
  paleBlue: "#E9EEFC",
  paleBlueBorder: "#C8D7F9",
  softBorder: "#E4E3DD",
  successGreen: "#26734D",
  successGreenSubtle: "#EAF4EE",
  warningAmber: "#996515",
  warningAmberSubtle: "#FDF6E7",
  errorRed: "#B93838",
  errorRedSubtle: "#FDF0F0",
} as const;

export interface ColorToken {
  name: string;
  hex: string;
  purpose: string;
  semanticRole: string;
  category: "core" | "state" | "accent";
}

export const COLOR_TOKENS: ColorToken[] = [
  {
    name: "Warm Ivory",
    hex: PALETTE.warmIvory,
    purpose: "Main background surface across the application",
    semanticRole: "background",
    category: "core",
  },
  {
    name: "White",
    hex: PALETTE.white,
    purpose: "Panels, cards, modal dialogs, and content surfaces",
    semanticRole: "surface",
    category: "core",
  },
  {
    name: "Charcoal",
    hex: PALETTE.charcoal,
    purpose: "Main text, high-priority headings, and primary data",
    semanticRole: "foreground",
    category: "core",
  },
  {
    name: "Slate Gray",
    hex: PALETTE.slateGray,
    purpose: "Secondary text, metadata, field labels, and timestamps",
    semanticRole: "muted-foreground",
    category: "core",
  },
  {
    name: "Muted Cobalt",
    hex: PALETTE.mutedCobalt,
    purpose: "Primary buttons, active interactive states, and focus rings",
    semanticRole: "primary",
    category: "accent",
  },
  {
    name: "Pale Blue",
    hex: PALETTE.paleBlue,
    purpose: "Selected interview slots, subtle row highlights, and active tabs",
    semanticRole: "accent",
    category: "accent",
  },
  {
    name: "Soft Border",
    hex: PALETTE.softBorder,
    purpose: "Restrained dividers, panel borders, and input outlines",
    semanticRole: "border",
    category: "core",
  },
  {
    name: "Success Green",
    hex: PALETTE.successGreen,
    purpose: "Confirmed interview slots and verified candidate status",
    semanticRole: "success",
    category: "state",
  },
  {
    name: "Warning Amber",
    hex: PALETTE.warningAmber,
    purpose: "Pending confirmations, tight interview gaps, and panel limits",
    semanticRole: "warning",
    category: "state",
  },
  {
    name: "Error Red",
    hex: PALETTE.errorRed,
    purpose: "Schedule conflicts, room overbooking, and validation errors",
    semanticRole: "destructive",
    category: "state",
  },
];

export const TYPOGRAPHY = {
  headings: {
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    weights: {
      bold: 700,
      semibold: 600,
      medium: 500,
    },
  },
  body: {
    fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
    },
  },
  mono: {
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
    weights: {
      regular: 400,
      medium: 500,
    },
  },
} as const;

export const STATUS_CONFIG = {
  confirmed: {
    label: "Confirmed",
    color: PALETTE.successGreen,
    bg: PALETTE.successGreenSubtle,
    border: "#B2DEC4",
    description: "Slot finalized with confirmed interviewer and candidate attendance",
  },
  pending: {
    label: "Pending",
    color: PALETTE.warningAmber,
    bg: PALETTE.warningAmberSubtle,
    border: "#F1DCAC",
    description: "Awaiting interviewer acceptance or candidate response",
  },
  conflict: {
    label: "Conflict",
    color: PALETTE.errorRed,
    bg: PALETTE.errorRedSubtle,
    border: "#F5C2C2",
    description: "Constraint violation: overlapping times or room contention",
  },
  cancelled: {
    label: "Cancelled",
    color: PALETTE.slateGray,
    bg: "#EFEFEA",
    border: PALETTE.softBorder,
    description: "Slot was released or session was cancelled",
  },
} as const;

export type SlotStatus = keyof typeof STATUS_CONFIG;
