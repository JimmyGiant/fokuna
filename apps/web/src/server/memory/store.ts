import type {
  CategoryDto,
  LabelDto,
  TaskDto,
  TaskSectionDto,
  TaskSectionMembershipDto,
  UserProfileDto,
} from "@fokuna/api-contracts";
import { createId, toIsoDateString, todayIsoDateString } from "@fokuna/domain";

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
  categories: Map<string, CategoryDto>;
  labels: Map<string, LabelDto>;
  taskSections: Map<string, TaskSectionDto>;
  taskSectionMemberships: Map<string, TaskSectionMembershipDto>;
  goals: Map<string, MemoryGoal>;
  blocks: Map<string, MemoryBlock>;
  calendarEntries: Map<string, MemoryCalendarEntry>;
  focusSessions: Map<string, MemoryFocusSession>;
  journalTemplates: Map<string, MemoryJournalTemplate>;
  journalEntries: Map<string, MemoryJournalEntry>;
  integrations: Map<string, MemoryIntegration>;
  profiles: Map<string, UserProfileDto>;
}

const globalStore = globalThis as typeof globalThis & {
  __fokunaMemoryStore?: MemoryStore;
  __fokunaMemoryStoreVersion?: number;
};

const MEMORY_STORE_VERSION = 10;

function createStore(): MemoryStore {
  const store: MemoryStore = {
    tasks: new Map(),
    categories: new Map(),
    labels: new Map(),
    taskSections: new Map(),
    taskSectionMemberships: new Map(),
    goals: new Map(),
    blocks: new Map(),
    calendarEntries: new Map(),
    focusSessions: new Map(),
    journalTemplates: new Map(),
    journalEntries: new Map(),
    integrations: new Map(),
    profiles: new Map(),
  };

  const demoUser = ensureDemoSeedUser();
  const now = new Date().toISOString();
  store.profiles.set(demoUser.id, {
    userId: demoUser.id,
    timezone: "Europe/Berlin",
    locale: "de",
    weekStartsOn: 1,
    uiPreferences: {},
    createdAt: now,
    updatedAt: now,
  });
  const today = todayIsoDateString();
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = toIsoDateString(tomorrowDate);

  const buyCategoryId = createId("cat");
  store.categories.set(buyCategoryId, {
    id: buyCategoryId,
    userId: demoUser.id,
    name: "Kaufen",
    colorToken: "category.teal",
    icon: null,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  });

  const rentCategoryId = createId("cat");
  store.categories.set(rentCategoryId, {
    id: rentCategoryId,
    userId: demoUser.id,
    name: "Mieten",
    colorToken: "category.coral",
    icon: null,
    sortOrder: 1,
    createdAt: now,
    updatedAt: now,
  });

  const labelEtikett = createId("label");
  store.labels.set(labelEtikett, {
    id: labelEtikett,
    userId: demoUser.id,
    name: "Etikettenname",
    colorToken: "category.coral",
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  });

  const labelLaunch = createId("label");
  store.labels.set(labelLaunch, {
    id: labelLaunch,
    userId: demoUser.id,
    name: "Launch",
    colorToken: "category.teal",
    sortOrder: 1,
    createdAt: now,
    updatedAt: now,
  });

  const labelTraining = createId("label");
  store.labels.set(labelTraining, {
    id: labelTraining,
    userId: demoUser.id,
    name: "Training",
    colorToken: "category.blue",
    sortOrder: 2,
    createdAt: now,
    updatedAt: now,
  });

  const labelFocus = createId("label");
  store.labels.set(labelFocus, {
    id: labelFocus,
    userId: demoUser.id,
    name: "Fokus",
    colorToken: "category.purple",
    sortOrder: 3,
    createdAt: now,
    updatedAt: now,
  });

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

  const marathonGoalId = createId("goal");
  store.goals.set(marathonGoalId, {
    id: marathonGoalId,
    userId: demoUser.id,
    title: "Berlin Marathon",
    description: "Vorbereitung und Training",
    motivation: "Durchhalten",
    status: "active",
    imageUrl: null,
    onboardingStep: null,
    sortOrder: 1,
    createdAt: now,
    updatedAt: now,
  });

  const novelGoalId = createId("goal");
  store.goals.set(novelGoalId, {
    id: novelGoalId,
    userId: demoUser.id,
    title: "Roman schreiben",
    description: null,
    motivation: null,
    status: "active",
    imageUrl: null,
    onboardingStep: null,
    sortOrder: 2,
    createdAt: now,
    updatedAt: now,
  });

  // All demo tasks land in inbox — no legacy `root` / Abschnitt buckets.
  const inboxTaskId = createId("task");
  store.tasks.set(inboxTaskId, {
    id: inboxTaskId,
    userId: demoUser.id,
    goalId: null,
    milestoneId: null,
    categoryId: null,
    parentTaskId: null,
    groupKey: "inbox",
    title: "Kalender-Sync spezifizieren",
    description: null,
    priority: "medium",
    estimateMinutes: 45,
    dueDate: today,
    isFavorite: false,
    isCompleted: false,
    completedAt: null,
    sortOrder: 0,
    labelIds: [labelEtikett],
    archivedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  const favoriteTaskId = createId("task");
  store.tasks.set(favoriteTaskId, {
    id: favoriteTaskId,
    userId: demoUser.id,
    goalId: null,
    milestoneId: null,
    categoryId: buyCategoryId,
    parentTaskId: null,
    groupKey: "inbox",
    title: "Release-Notes skizzieren",
    description: null,
    priority: "low",
    estimateMinutes: 30,
    dueDate: null,
    isFavorite: true,
    isCompleted: false,
    completedAt: null,
    sortOrder: 1,
    labelIds: [labelLaunch],
    archivedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  const nestedParentId = createId("task");
  store.tasks.set(nestedParentId, {
    id: nestedParentId,
    userId: demoUser.id,
    goalId: marathonGoalId,
    milestoneId: null,
    categoryId: rentCategoryId,
    parentTaskId: null,
    groupKey: "inbox",
    title: "Trainingsplan finalisieren",
    description: null,
    priority: "high",
    estimateMinutes: 90,
    dueDate: tomorrow,
    isFavorite: false,
    isCompleted: false,
    completedAt: null,
    sortOrder: 2,
    labelIds: [labelTraining, labelFocus],
    archivedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  const subtaskA = createId("task");
  store.tasks.set(subtaskA, {
    id: subtaskA,
    userId: demoUser.id,
    goalId: marathonGoalId,
    milestoneId: null,
    categoryId: rentCategoryId,
    parentTaskId: nestedParentId,
    groupKey: "inbox",
    title: "Intervall-Einheiten eintragen",
    description: null,
    priority: "medium",
    estimateMinutes: 30,
    dueDate: null,
    isFavorite: false,
    isCompleted: false,
    completedAt: null,
    sortOrder: 0,
    labelIds: [],
    archivedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  const nestedSubtask = createId("task");
  store.tasks.set(nestedSubtask, {
    id: nestedSubtask,
    userId: demoUser.id,
    goalId: marathonGoalId,
    milestoneId: null,
    categoryId: rentCategoryId,
    parentTaskId: subtaskA,
    groupKey: "inbox",
    title: "Dienstag 8x1000m planen",
    description: null,
    priority: "none",
    estimateMinutes: null,
    dueDate: null,
    isFavorite: false,
    isCompleted: false,
    completedAt: null,
    sortOrder: 0,
    labelIds: [],
    archivedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  const subtaskB = createId("task");
  store.tasks.set(subtaskB, {
    id: subtaskB,
    userId: demoUser.id,
    goalId: marathonGoalId,
    milestoneId: null,
    categoryId: rentCategoryId,
    parentTaskId: nestedParentId,
    groupKey: "inbox",
    title: "Regeneration planen",
    description: null,
    priority: "low",
    estimateMinutes: 20,
    dueDate: null,
    isFavorite: false,
    isCompleted: false,
    completedAt: null,
    sortOrder: 1,
    labelIds: [],
    archivedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  const rentTaskId = createId("task");
  store.tasks.set(rentTaskId, {
    id: rentTaskId,
    userId: demoUser.id,
    goalId: null,
    milestoneId: null,
    categoryId: rentCategoryId,
    parentTaskId: null,
    groupKey: "inbox",
    title: "Mietvertrag prüfen",
    description: null,
    priority: "medium",
    estimateMinutes: 40,
    dueDate: null,
    isFavorite: false,
    isCompleted: false,
    completedAt: null,
    sortOrder: 3,
    labelIds: [labelEtikett],
    archivedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  const blockDeep = createId("block");
  store.blocks.set(blockDeep, {
    id: blockDeep,
    userId: demoUser.id,
    goalId,
    categoryId: buyCategoryId,
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

  const blockRead = createId("block");
  store.blocks.set(blockRead, {
    id: blockRead,
    userId: demoUser.id,
    goalId: null,
    categoryId: null,
    title: "Lesen",
    description: null,
    durationMinutes: 30,
    icon: "newspaper",
    colorToken: "category.coral",
    isTemplate: true,
    isPreset: true,
    sortOrder: 1,
    createdAt: now,
    updatedAt: now,
  });

  const blockFood = createId("block");
  store.blocks.set(blockFood, {
    id: blockFood,
    userId: demoUser.id,
    goalId: null,
    categoryId: null,
    title: "Mittagessen",
    description: null,
    durationMinutes: 45,
    icon: "fork-spoon",
    colorToken: "category.purple",
    isTemplate: true,
    isPreset: true,
    sortOrder: 2,
    createdAt: now,
    updatedAt: now,
  });

  const dayStart = new Date();
  dayStart.setHours(7, 20, 0, 0);

  function addHours(base: Date, hours: number, minutes = 0) {
    const next = new Date(base);
    next.setHours(hours, minutes, 0, 0);
    return next;
  }

  const calendarSeeds: Array<{
    source: MemoryCalendarEntry["source"];
    title: string;
    startsAt: Date;
    endsAt: Date;
    taskId?: string;
    blockId?: string;
    description?: string;
  }> = [
    {
      source: "task",
      title: "Kalender-Sync spezifizieren",
      startsAt: addHours(dayStart, 8, 0),
      endsAt: addHours(dayStart, 9, 0),
      taskId: inboxTaskId,
    },
    {
      source: "manual",
      title: "Privat",
      startsAt: addHours(dayStart, 10, 0),
      endsAt: addHours(dayStart, 11, 0),
      description: "Importierter Kalender",
    },
    {
      source: "block",
      title: "Deep Work",
      startsAt: addHours(dayStart, 12, 0),
      endsAt: addHours(dayStart, 13, 0),
      blockId: blockDeep,
      description: "Arbeit",
    },
    {
      source: "block",
      title: "Lesen",
      startsAt: addHours(dayStart, 14, 0),
      endsAt: addHours(dayStart, 15, 0),
      blockId: blockRead,
    },
    {
      source: "block",
      title: "Mittagessen",
      startsAt: addHours(dayStart, 16, 0),
      endsAt: addHours(dayStart, 17, 0),
      blockId: blockFood,
    },
  ];

  for (const seed of calendarSeeds) {
    const id = createId("cal");
    store.calendarEntries.set(id, {
      id,
      userId: demoUser.id,
      source: seed.source,
      taskId: seed.taskId ?? null,
      blockId: seed.blockId ?? null,
      title: seed.title,
      description: seed.description ?? null,
      startsAt: seed.startsAt.toISOString(),
      endsAt: seed.endsAt.toISOString(),
      allDay: false,
      timezone: "Europe/Berlin",
      recurrenceRule: null,
    });
  }

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
  if (
    !globalStore.__fokunaMemoryStore ||
    globalStore.__fokunaMemoryStoreVersion !== MEMORY_STORE_VERSION
  ) {
    globalStore.__fokunaMemoryStore = createStore();
    globalStore.__fokunaMemoryStoreVersion = MEMORY_STORE_VERSION;
  }
  return globalStore.__fokunaMemoryStore;
}
