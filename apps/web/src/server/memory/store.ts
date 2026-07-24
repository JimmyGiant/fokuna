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

export interface MemoryBlockRhythm {
  kind: "none" | "daily" | "weekly" | "monthly" | "yearly";
  count: number;
}

export interface MemoryBlockTimerConfig {
  kind: "none" | "pomodoro" | "countdown" | "stopwatch" | "clock";
  pomodoroPresetId?: string;
}

export interface MemoryBlockFocusConfig {
  musicId?: string | null;
  backgroundKind?: "colors" | "gradients" | "shapes" | "nature";
  backgroundId?: string | null;
}

export interface MemoryBlockInsights {
  count: number;
  avgDurationMinutes: number;
  lastAt: string | null;
  weeks: Array<{ label: string; value: number }>;
  threshold?: number | null;
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
  rhythm: MemoryBlockRhythm | null;
  timerConfig: MemoryBlockTimerConfig | null;
  focusConfig: MemoryBlockFocusConfig | null;
  insights: MemoryBlockInsights | null;
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

const MEMORY_STORE_VERSION = 11;

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

  const demoWeeks = [
    { label: "KW 22", value: 2 },
    { label: "KW 23", value: 4 },
    { label: "KW 24", value: 3 },
    { label: "KW 25", value: 5 },
    { label: "KW 26", value: 2 },
    { label: "KW 27", value: 4 },
    { label: "KW 28", value: 3 },
    { label: "KW 29", value: 6 },
    { label: "KW 30", value: 4 },
    { label: "KW 31", value: 3 },
    { label: "KW 32", value: 5 },
    { label: "KW 33", value: 2 },
    { label: "KW 34", value: 4 },
    { label: "KW 35", value: 3 },
    { label: "KW 36", value: 5 },
    { label: "KW 37", value: 4 },
    { label: "KW 38", value: 3 },
    { label: "KW 39", value: 2 },
    { label: "KW 40", value: 4 },
    { label: "KW 41", value: 3 },
    { label: "KW 42", value: 5 },
  ];

  const blockRead = createId("block");
  store.blocks.set(blockRead, {
    id: blockRead,
    userId: demoUser.id,
    goalId: null,
    categoryId: null,
    title: "Lesen",
    description: "Non Fiction Leseeinheit für den gebildeten morgen.",
    durationMinutes: 45,
    icon: "newspaper",
    colorToken: "category.coral",
    isTemplate: false,
    isPreset: false,
    rhythm: { kind: "none", count: 1 },
    timerConfig: { kind: "pomodoro", pomodoroPresetId: "steuererklaerung" },
    focusConfig: { musicId: "ambient", backgroundKind: "colors", backgroundId: "teal" },
    insights: {
      count: 278,
      avgDurationMinutes: 35,
      lastAt: "2026-06-24",
      weeks: demoWeeks,
      threshold: 4,
    },
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  });

  const blockDeepRest = createId("block");
  store.blocks.set(blockDeepRest, {
    id: blockDeepRest,
    userId: demoUser.id,
    goalId: null,
    categoryId: null,
    title: "Deep Rest",
    description: "Deep Rest Protocol von Andrew Huberman",
    durationMinutes: 15,
    icon: "moon",
    colorToken: "category.purple",
    isTemplate: false,
    isPreset: false,
    rhythm: { kind: "daily", count: 1 },
    timerConfig: { kind: "countdown" },
    focusConfig: { musicId: "energy", backgroundKind: "colors", backgroundId: "purple" },
    insights: null,
    sortOrder: 1,
    createdAt: now,
    updatedAt: now,
  });

  const blockMarathon = createId("block");
  store.blocks.set(blockMarathon, {
    id: blockMarathon,
    userId: demoUser.id,
    goalId: marathonGoalId,
    categoryId: null,
    title: "Berlin Marathon",
    description: "Generierter Zeitblock auf Basis deiner Rhythmuseinstellungen.",
    durationMinutes: 60,
    icon: "focus-target",
    colorToken: "category.teal",
    isTemplate: false,
    isPreset: false,
    rhythm: { kind: "weekly", count: 3 },
    timerConfig: { kind: "stopwatch" },
    focusConfig: { musicId: "chill", backgroundKind: "colors", backgroundId: "teal" },
    insights: null,
    sortOrder: 2,
    createdAt: now,
    updatedAt: now,
  });

  const blockNovel = createId("block");
  store.blocks.set(blockNovel, {
    id: blockNovel,
    userId: demoUser.id,
    goalId: novelGoalId,
    categoryId: null,
    title: "Roman schreiben",
    description: "Generierter Zeitblock auf Basis deiner Rhythmuseinstellungen.",
    durationMinutes: 90,
    icon: "focus-target",
    colorToken: "category.teal",
    isTemplate: false,
    isPreset: false,
    rhythm: { kind: "weekly", count: 5 },
    timerConfig: { kind: "none" },
    focusConfig: { musicId: "acoustic", backgroundKind: "colors", backgroundId: "blue" },
    insights: null,
    sortOrder: 3,
    createdAt: now,
    updatedAt: now,
  });

  const templateBlocks: Array<{
    title: string;
    description: string;
    durationMinutes: number;
    icon: string;
    colorToken: string;
    timerKind: MemoryBlockTimerConfig["kind"];
    musicId: string;
  }> = [
    {
      title: "Meditation",
      description: "Ruhiger Einstieg mit Atemfokus und klarer Abschlussrunde.",
      durationMinutes: 15,
      icon: "balance",
      colorToken: "category.pink",
      timerKind: "pomodoro",
      musicId: "woods",
    },
    {
      title: "Mittagessen",
      description: "Bewusste Pause mit Abstand zum Schreibtisch.",
      durationMinutes: 60,
      icon: "fork-spoon",
      colorToken: "category.purple",
      timerKind: "countdown",
      musicId: "ambient",
    },
    {
      title: "E-Mails bearbeiten",
      description: "Inbox zero in einem fokussierten Durchgang.",
      durationMinutes: 45,
      icon: "envelope",
      colorToken: "category.coral",
      timerKind: "stopwatch",
      musicId: "energy",
    },
    {
      title: "Deep Work Sprint",
      description: "Ununterbrochener Fokusblock für anspruchsvolle Arbeit.",
      durationMinutes: 90,
      icon: "focus-target",
      colorToken: "category.teal",
      timerKind: "clock",
      musicId: "chill",
    },
    {
      title: "Kreativ schreiben",
      description: "Freies Schreiben ohne Korrekturzwang.",
      durationMinutes: 60,
      icon: "notes",
      colorToken: "category.blue",
      timerKind: "none",
      musicId: "acoustic",
    },
    {
      title: "Lernblock",
      description: "Strukturierte Lerneinheit mit Wiederholung.",
      durationMinutes: 45,
      icon: "settings-sliders",
      colorToken: "category.gold",
      timerKind: "countdown",
      musicId: "woods",
    },
    {
      title: "Workout",
      description: "Kraft oder Cardio je nach Tagesform.",
      durationMinutes: 45,
      icon: "circle-check",
      colorToken: "category.coral",
      timerKind: "stopwatch",
      musicId: "ambient",
    },
    {
      title: "Haushalt Reset",
      description: "Schneller Durchgang für Ordnung und Klarheit.",
      durationMinutes: 30,
      icon: "calendar",
      colorToken: "category.teal",
      timerKind: "none",
      musicId: "energy",
    },
    {
      title: "Wochenplanung",
      description: "Prioritäten setzen und den Wochenrhythmus festziehen.",
      durationMinutes: 30,
      icon: "star",
      colorToken: "category.purple",
      timerKind: "pomodoro",
      musicId: "chill",
    },
  ];

  const blockFood = createId("block");
  let templateSort = 4;
  for (const template of templateBlocks) {
    const id = template.title === "Mittagessen" ? blockFood : createId("block");
    store.blocks.set(id, {
      id,
      userId: demoUser.id,
      goalId: null,
      categoryId: null,
      title: template.title,
      description: template.description,
      durationMinutes: template.durationMinutes,
      icon: template.icon,
      colorToken: template.colorToken,
      isTemplate: true,
      isPreset: true,
      rhythm: { kind: "none", count: 1 },
      timerConfig: {
        kind: template.timerKind,
        ...(template.timerKind === "pomodoro"
          ? { pomodoroPresetId: "steuererklaerung" }
          : {}),
      },
      focusConfig: {
        musicId: template.musicId,
        backgroundKind: "colors",
        backgroundId: "teal",
      },
      insights: null,
      sortOrder: templateSort,
      createdAt: now,
      updatedAt: now,
    });
    templateSort += 1;
  }

  // Calendar seed: prefer Deep Work Sprint template as the timed block source.
  const blockDeep =
    [...store.blocks.values()].find((block) => block.title === "Deep Work Sprint")?.id ??
    blockRead;

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

  const profile = store.profiles.get(demoUser.id);
  if (profile) {
    store.profiles.set(demoUser.id, {
      ...profile,
      uiPreferences: {
        ...profile.uiPreferences,
        blocks: {
          railIds: [blockRead, blockFood, blockMarathon],
          hubHintSeen: false,
        },
      },
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
