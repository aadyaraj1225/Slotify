/**
 * Slotify Design Tokens and Theme Configuration
 * Retro-Digital Visual Identity
 */

export const PALETTE = {
  deepBlack: "#101010",
  nearBlack: "#191919",
  hotPink: "#F542A6",
  electricLime: "#D7FF35",
  skyBlue: "#73D0F4",
  warmOffwhite: "#F7F5EE",
  white: "#FFFFFF",
  mutedGray: "#B8B8B8",
  successGreen: "#70D6A0",
  warningAmber: "#FFC857",
  errorRed: "#FF6262",

  // Legacy mappings for backward compatibility
  warmIvory: "#F7F5EE",
  charcoal: "#101010",
  slateGray: "#626A70",
  mutedCobalt: "#101010",
  mutedCobaltHover: "#191919",
  mutedCobaltActive: "#000000",
  paleBlue: "#EBF8FD",
  paleBlueBorder: "#73D0F4",
  softBorder: "#E4E3DD",
  successGreenSubtle: "#EBF9F1",
  warningAmberSubtle: "#FFF9EB",
  errorRedSubtle: "#FFF0F0",
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
    name: "Deep Black",
    hex: PALETTE.deepBlack,
    purpose: "Primary contrast anchor, major hero surfaces, and dark navigation",
    semanticRole: "dark-background",
    category: "core",
  },
  {
    name: "Near-Black Panel",
    hex: PALETTE.nearBlack,
    purpose: "Sidebar surfaces, secondary dark panels, and cards",
    semanticRole: "dark-surface",
    category: "core",
  },
  {
    name: "Electric Lime",
    hex: PALETTE.electricLime,
    purpose: "Primary interactive buttons, key actions, and active highlights",
    semanticRole: "primary",
    category: "accent",
  },
  {
    name: "Hot Pink",
    hex: PALETTE.hotPink,
    purpose: "Signature visual accents, badge highlights, and secondary emphasis",
    semanticRole: "signature",
    category: "accent",
  },
  {
    name: "Sky Blue",
    hex: PALETTE.skyBlue,
    purpose: "Secondary links, technical markers, and subtle highlights",
    semanticRole: "accent",
    category: "accent",
  },
  {
    name: "Warm Off-White",
    hex: PALETTE.warmOffwhite,
    purpose: "Readable workspace background and main application container",
    semanticRole: "background",
    category: "core",
  },
  {
    name: "White",
    hex: PALETTE.white,
    purpose: "Readable content cards, tables, and dialog surfaces",
    semanticRole: "surface",
    category: "core",
  },
  {
    name: "Muted Gray",
    hex: PALETTE.mutedGray,
    purpose: "Secondary borders, inactive tracks, and subtle text",
    semanticRole: "muted",
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
    semanticRole: "error",
    category: "state",
  },
];

export type SlotStatus = "confirmed" | "pending" | "conflict" | "cancelled";
