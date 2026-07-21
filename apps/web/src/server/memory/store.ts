import type { TaskDto } from "@fokuna/api-contracts";
import { createId } from "@fokuna/domain";

import { ensureDemoSeedUser } from "./demo-auth";

export interface MemoryGoal {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  motivation: string | null;
  status: "draft" | "active" | "paused" | "completed" | "archived";
  imageUrl: string | null;
  onboardingStep: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryBlock {
  id: string;
  userId: string;
  goalId: string | null;
  categoryId: string | null;
  title: string;
  description: string | null;
  durationMinutes: number;
  icon: string | null;
  colorToken: string | null;
  isTemplate: boolean;
  isPreset: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryCalendarEntry {
  id: string;
  userId: string;
  source: "task" | "block" | "manual" | "google" | "microsoft";
  taskId: string | null;
  blockId: string | null;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  timezone: string;
  recurrenceRule: string | null;
}

export interface MemoryFocusSession {
  id: string;
  userId: string;
  taskId: string | null;
  blockId: string | null;
  status: "running" | "paused" | "completed" | "cancelled";
  plannedDurationSeconds: number;
  startedAt: string;
  pausedAt: string | null;
  accumulatedPauseSeconds: number;
  endedAt: string | null;
  isMinimized: boolean;
}

export interface MemoryJournalTemplate {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  isDefault: boolean;
  checkInElements: unknown[];
  checkOutElements: unknown[];
}

export interface MemoryJournalEntry {
  id: string;
  userId: string;
  templateId: string | null;
  kind: "check_in" | "check_out";
  entryDate: string;
  answers: Record<string, unknown>;
  mood: number | null;
  energy: number | null;
}

export interface MemoryIntegration {
  id: string;
  userId: string;
  provider: "google_calendar" | "microsoft_calendar" | "accuweather" | "stripe";
  status: "disconnected" | "connecting" | "connected" | "error" | "syncing";
  lastError: string | null;
  lastSyncedAt: string | null;
}

interface MemoryStore {
  tasks: Map<string, TaskDto>;
  goals: Map<string, MemoryGoal>;
  blocks: Map<string, MemoryBlock>;
  calendarEntries: Map<string, MemoryCalendarEntry>;
  focusSessions: Map<string, MemoryFocusSession>;
  journalTemplates: Map<string, MemoryJournalTemplate>;
  journalEntries: Map<string, MemoryJournalEntry>;
  integrations: Map<string, MemoryIntegration>;
}

const globalStore = globalThis as typeof globalThis & {
  __fokunaMemoryStore?: MemoryStore;
};

function createStore(): MemoryStore {
  const store: MemoryStore = {
    tasks: new Map(),
    goals: new Map(),
    blocks: new Map(),
    calendarEntries: new Map(),
    focusSessions: new Map(),
    journalTemplates: new Map(),
    journalEntries: new Map(),
    integrations: new Map(),
  };

  const demoUser = ensureDemoSeedUser();
  const now = new Date().toISOString();

  const goalId = createId("goal");
  store.goals.set(goalId, {
    id: goalId,
    userId: demoUser.id,
    title: "Website Launch",
    description: "Produktseite und Onboarding fertigstellen",
    motivation: "Klarer Launch-Fokus",
    status: "active",
    imageUrl: null,
    onboardingStep: null,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  });

  const taskA = createId("task");
  store.tasks.set(taskA, {
    id: taskA,
    userId: demoUser.id,
    goalId,
    milestoneId: null,
    parentTaskId: null,
    groupKey: "today",
    title: "Pattern Library freigeben",
    description: "Visuelle Abnahme der V1.1 Komponenten",
    priority: "high",
    estimateMinutes: 60,
    dueDate: now.slice(0, 10),
    isFavorite: true,
    isCompleted: false,
    completedAt: null,
    sortOrder: 0,
    tags: ["Launch"],
    archivedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  const taskB = createId("task");
  store.tasks.set(taskB, {
    id: taskB,
    userId: demoUser.id,
    goalId: null,
    milestoneId: null,
    parentTaskId: null,
    groupKey: "inbox",
    title: "Kalender-Sync spezifizieren",
    description: null,
    priority: "medium",
    estimateMinutes: 45,
    dueDate: null,
    isFavorite: false,
    isCompleted: false,
    completedAt: null,
    sortOrder: 0,
    tags: [],
    archivedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  const blockId = createId("block");
  store.blocks.set(blockId, {
    id: blockId,
    userId: demoUser.id,
    goalId,
    categoryId: null,
    title: "Deep Work",
    description: "Fokussierter Schreibblock",
    durationMinutes: 50,
    icon: "focus-target",
    colorToken: "category.teal",
    isTemplate: false,
    isPreset: false,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  });

  const templateId = createId("jtpl");
  store.journalTemplates.set(templateId, {
    id: templateId,
    userId: demoUser.id,
    title: "Daily Check-in",
    description: "Kurze Morgenausrichtung",
    isDefault: true,
    checkInElements: [
      { id: "mood", type: "scale", label: "Stimmung" },
      { id: "focus", type: "text", label: "Was ist heute wichtig?" },
    ],
    checkOutElements: [
      { id: "progress", type: "text", label: "Was ist gelungen?" },
      { id: "learning", type: "text", label: "Was nehme ich mit?" },
    ],
  });

  for (const provider of ["google_calendar", "microsoft_calendar"] as const) {
    const id = createId("int");
    store.integrations.set(id, {
      id,
      userId: demoUser.id,
      provider,
      status: "disconnected",
      lastError: null,
      lastSyncedAt: null,
    });
  }

  return store;
}

export function getMemoryStore(): MemoryStore {
  if (!globalStore.__fokunaMemoryStore) {
    globalStore.__fokunaMemoryStore = createStore();
  }
  return globalStore.__fokunaMemoryStore;
}
