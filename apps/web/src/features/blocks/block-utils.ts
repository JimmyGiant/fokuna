import type { BlockDto, BlockRhythm, BlockTimerConfig } from "@fokuna/api-contracts";
import type { IconName } from "@fokuna/icons";
import type { BlockCardMeta, BlockTone } from "@fokuna/ui";

export type BlockSourceKind = "own" | "goal" | "template";

/** Edit-rail capacity — Figma `C - Desktop - Blocks` shows 12 slots (filled + empty). */
export const MAX_BLOCK_RAIL = 12;

const toneByToken: Record<string, BlockTone> = {
  "category.coral": "coral",
  "category.teal": "teal",
  "category.blue": "blue",
  "category.purple": "purple",
  "category.pink": "pink",
  "category.gold": "gold",
};

const timerLabel: Record<BlockTimerConfig["kind"], string> = {
  none: "",
  pomodoro: "Pomodoro",
  countdown: "Countdown",
  stopwatch: "Stoppuhr",
  clock: "Uhrzeit",
};

const rhythmLabel = (rhythm: BlockRhythm | null | undefined): string | null => {
  if (!rhythm || rhythm.kind === "none") return null;
  if (rhythm.kind === "daily") return "Täglich";
  if (rhythm.kind === "weekly") return `${rhythm.count}/Wo.`;
  if (rhythm.kind === "monthly") return `${rhythm.count}/Mo.`;
  if (rhythm.kind === "yearly") return `${rhythm.count}/J.`;
  return null;
};

const musicLabel = (musicId: string | null | undefined): string | null => {
  if (!musicId || musicId === "none") return null;
  const labels: Record<string, string> = {
    ambient: "Ambient",
    woods: "Woods",
    chill: "Chill",
    acoustic: "Acoustic",
    energy: "Energy",
    "white-noise": "White Noise",
    "random-mix": "Random Mix",
    "total-eclipse": "Total Eclipse",
  };
  return labels[musicId] ?? musicId;
};

export function blockTone(block: BlockDto): BlockTone {
  return toneByToken[block.colorToken ?? ""] ?? "teal";
}

export function blockIcon(block: BlockDto): IconName {
  return (block.icon as IconName | null) ?? "focus-target";
}

export function formatDurationLabel(minutes: number): string {
  if (minutes === 60) return "1 Std";
  if (minutes === 75) return "1:15 Std";
  if (minutes === 90) return "1:30 Std";
  if (minutes > 60 && minutes % 60 === 0) return `${minutes / 60} Std`;
  return `${minutes} min`;
}

export function blockSourceKind(block: BlockDto): BlockSourceKind {
  if (block.goalId) return "goal";
  if (block.isPreset || block.isTemplate) return "template";
  return "own";
}

export function blockMetaTags(block: BlockDto): BlockCardMeta[] {
  const meta: BlockCardMeta[] = [];
  const rhythm = rhythmLabel(block.rhythm);
  if (rhythm) {
    meta.push({
      id: "rhythm",
      label: rhythm,
      icon: rhythm === "Täglich" ? "refresh" : "calendar",
    });
  }
  const timer = block.timerConfig?.kind ? timerLabel[block.timerConfig.kind] : "";
  if (timer) {
    meta.push({
      id: "timer",
      label: timer,
      icon: block.timerConfig?.kind === "pomodoro" ? "clock-alert" : "clock",
    });
  }
  const music = musicLabel(block.focusConfig?.musicId);
  if (music) {
    meta.push({ id: "music", label: music, icon: "music" });
  }
  return meta;
}

/** Rest placements this week for goal badges — interim from rhythm until calendar planning exists. */
export function blockWeekBadge(block: BlockDto): number | undefined {
  if (!block.goalId || !block.rhythm || block.rhythm.kind === "none") return undefined;
  if (block.rhythm.kind === "weekly") return block.rhythm.count;
  if (block.rhythm.kind === "daily") return Math.min(7, block.rhythm.count * 7);
  return block.rhythm.count;
}

export function musicLabelFromBlock(block: BlockDto): string | null {
  return musicLabel(block.focusConfig?.musicId);
}

export const BLOCK_COLOR_OPTIONS: Array<{ token: string; tone: BlockTone; label: string }> = [
  { token: "category.coral", tone: "coral", label: "Coral" },
  { token: "category.teal", tone: "teal", label: "Teal" },
  { token: "category.blue", tone: "blue", label: "Blau" },
  { token: "category.purple", tone: "purple", label: "Lila" },
  { token: "category.pink", tone: "pink", label: "Pink" },
  { token: "category.gold", tone: "gold", label: "Gold" },
];

export const BLOCK_ICON_OPTIONS: Array<{ id: IconName; label: string }> = [
  { id: "newspaper", label: "Buch" },
  { id: "moon", label: "Mond" },
  { id: "focus-target", label: "Ziel" },
  { id: "fork-spoon", label: "Essen" },
  { id: "balance", label: "Balance" },
  { id: "envelope", label: "Post" },
  { id: "notes", label: "Notizen" },
  { id: "settings-sliders", label: "Regler" },
  { id: "circle-check", label: "Check" },
  { id: "calendar", label: "Kalender" },
  { id: "star", label: "Stern" },
  { id: "tennis", label: "Sport" },
];

export const DURATION_PRESETS = [
  { minutes: 15, label: "15 min" },
  { minutes: 30, label: "30 min" },
  { minutes: 45, label: "45 min" },
  { minutes: 60, label: "1 Std" },
  { minutes: 75, label: "1:15 Std" },
  { minutes: 90, label: "1:30 Std" },
] as const;

export const POMODORO_PRESETS = [
  { id: "schnelles-denken", label: "Schnelles Denken", detail: "5 min · 1 min · 10 min" },
  { id: "steuererklaerung", label: "Steuererklärung", detail: "25 min · 1 min · 10 min" },
  { id: "zehner-pomo", label: "Zehner Pomo", detail: "10 min · 5 min · 10 min" },
  { id: "deep-work", label: "Deep Work", detail: "20 min · 5 min · 10 min" },
  { id: "meditation", label: "Meditation", detail: "25 min · 5 min · 15 min" },
] as const;

export const MUSIC_OPTIONS: ReadonlyArray<{
  id: string;
  label: string;
  icon?: IconName;
}> = [
  { id: "none", label: "Keine Musik" },
  { id: "random-mix", label: "Random Mix", icon: "shuffle" },
  { id: "total-eclipse", label: "Total Eclipse", icon: "play-circle" },
  { id: "woods", label: "Woods", icon: "play-circle" },
  { id: "ambient", label: "Ambient", icon: "play-circle" },
  { id: "chill", label: "Chill", icon: "play-circle" },
  { id: "acoustic", label: "Acoustic", icon: "play-circle" },
  { id: "energy", label: "Energy", icon: "play-circle" },
  { id: "white-noise", label: "White Noise", icon: "play-circle" },
];

/** Fokusmodus-Hintergrund Farben — Figma radial gradients (center → edge). */
export const BACKGROUND_COLORS = [
  {
    id: "teal",
    label: "Teal",
    gradient: "radial-gradient(circle at center, #2cb1af 0%, #1d8a88 100%)",
  },
  {
    id: "purple",
    label: "Purple",
    gradient: "radial-gradient(circle at center, #8870d7 0%, #695b98 100%)",
  },
  {
    id: "blue",
    label: "Blue",
    gradient: "radial-gradient(circle at center, #6183b9 0%, #516d99 100%)",
  },
  {
    id: "pink",
    label: "Pink",
    gradient: "radial-gradient(circle at center, #c95f94 0%, #a8567f 100%)",
  },
  {
    id: "gold",
    label: "Gold",
    gradient: "radial-gradient(circle at center, #d6c181 0%, #988e6e 100%)",
  },
  {
    id: "charcoal",
    label: "Anthrazit",
    gradient: "radial-gradient(circle at center, #5d5d5d 0%, #3d3d3d 100%)",
  },
] as const;
