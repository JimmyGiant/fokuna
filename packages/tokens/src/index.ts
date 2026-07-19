import tokenDocument from "./tokens.json";

export const fokunaTokens = tokenDocument;

export const controlHeights = {
  sm: 28,
  md: 32,
  lg: 40,
  xl: 48,
} as const;

export const controlRadii = {
  sm: 9,
  md: 10,
  lg: 12,
  xl: 12,
} as const;

export const motionDurations = {
  fast: 120,
  default: 180,
  slow: 240,
} as const;

export type ControlSize = keyof typeof controlHeights;
export type FokunaTokenDocument = typeof tokenDocument;
