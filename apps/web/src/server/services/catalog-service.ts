import {
  createBlockInputSchema,
  createCalendarEntryInputSchema,
  createGoalInputSchema,
  moveCalendarEntryInputSchema,
  startFocusSessionInputSchema,
  updateBlockInputSchema,
  updateFocusSessionInputSchema,
  upsertJournalEntryInputSchema,
  type CreateBlockInput,
  type CreateCalendarEntryInput,
  type CreateGoalInput,
  type GoalDto,
  type ReorderIdsInput,
  type UpdateBlockInput,
} from "@fokuna/api-contracts";
import {
  applySortOrders,
  canTransitionFocusStatus,
  createId,
  elapsedFocusSeconds,
  remainingFocusSeconds,
} from "@fokuna/domain";

import { getMemoryStore, type MemoryBlock } from "../memory/store";

/** Catalog services currently use the memory store for the vertical slice.
 * Neon repositories follow the same contracts and can replace these call sites. */

export async function listGoals(userId: string): Promise<GoalDto[]> {
  return [...getMemoryStore().goals.values()]
    .filter((goal) => goal.userId === userId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
}

export async function reorderGoals(userId: string, input: ReorderIdsInput): Promise<GoalDto[]> {
  const existing = await listGoals(userId);
  const existingIds = new Set(existing.map((goal) => goal.id));
  if (
    input.orderedIds.length !== existing.length ||
    input.orderedIds.some((id) => !existingIds.has(id))
  ) {
    throw new Error("Invalid goal reorder payload");
  }

  const now = new Date().toISOString();
  const store = getMemoryStore();
  const reordered = applySortOrders(existing, input.orderedIds);
  for (const goal of reordered) {
    store.goals.set(goal.id, { ...goal, updatedAt: now });
  }
  return listGoals(userId);
}

export async function createGoal(userId: string, raw: CreateGoalInput) {
  const input = createGoalInputSchema.parse(raw);
  const now = new Date().toISOString();
  const goal = {
    id: createId("goal"),
    userId,
    title: input.title,
    description: input.description ?? null,
    motivation: input.motivation ?? null,
    status: "draft" as const,
    imageUrl: null,
    onboardingStep: input.onboardingStep ?? "zielsetzung_1",
    sortOrder: (await listGoals(userId)).length,
    createdAt: now,
    updatedAt: now,
  };
  getMemoryStore().goals.set(goal.id, goal);
  return goal;
}

export async function updateGoal(
  userId: string,
  goalId: string,
  patch: Partial<{
    title: string;
    description: string | null;
    motivation: string | null;
    status: "draft" | "active" | "paused" | "completed" | "archived";
    onboardingStep: string | null;
    imageUrl: string | null;
  }>,
) {
  const existing = getMemoryStore().goals.get(goalId);
  if (!existing || existing.userId !== userId) {
    return null;
  }
  const updated = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  getMemoryStore().goals.set(goalId, updated);
  return updated;
}

export async function listBlocks(userId: string) {
  return [...getMemoryStore().blocks.values()]
    .filter((block) => block.userId === userId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(toBlockDto);
}

function toBlockDto(block: MemoryBlock) {
  return {
    ...block,
    rhythm: block.rhythm ?? null,
    timerConfig: block.timerConfig ?? null,
    focusConfig: block.focusConfig ?? null,
    insights: block.insights ?? null,
  };
}

export async function getBlock(userId: string, blockId: string) {
  const block = getMemoryStore().blocks.get(blockId);
  if (!block || block.userId !== userId) return null;
  return toBlockDto(block);
}

export async function createBlock(userId: string, raw: CreateBlockInput) {
  const input = createBlockInputSchema.parse(raw);
  const now = new Date().toISOString();
  const block: MemoryBlock = {
    id: createId("block"),
    userId,
    goalId: input.goalId ?? null,
    categoryId: input.categoryId ?? null,
    title: input.title,
    description: input.description ?? null,
    durationMinutes: input.durationMinutes,
    icon: input.icon ?? null,
    colorToken: input.colorToken ?? null,
    isTemplate: input.isTemplate,
    isPreset: false,
    rhythm: input.rhythm ?? { kind: "none", count: 1 },
    timerConfig: input.timerConfig ?? { kind: "none" },
    focusConfig: input.focusConfig ?? { musicId: null, backgroundKind: "colors", backgroundId: null },
    insights: null,
    sortOrder: (await listBlocks(userId)).length,
    createdAt: now,
    updatedAt: now,
  };
  getMemoryStore().blocks.set(block.id, block);
  return toBlockDto(block);
}

export async function updateBlock(userId: string, blockId: string, raw: UpdateBlockInput) {
  const input = updateBlockInputSchema.parse(raw);
  const existing = getMemoryStore().blocks.get(blockId);
  if (!existing || existing.userId !== userId) return null;
  const updated: MemoryBlock = {
    ...existing,
    title: input.title ?? existing.title,
    description:
      input.description === undefined ? existing.description : input.description,
    durationMinutes: input.durationMinutes ?? existing.durationMinutes,
    icon: input.icon === undefined ? existing.icon : input.icon,
    colorToken: input.colorToken === undefined ? existing.colorToken : input.colorToken,
    goalId: input.goalId === undefined ? existing.goalId : input.goalId,
    categoryId: input.categoryId === undefined ? existing.categoryId : input.categoryId,
    isTemplate: input.isTemplate ?? existing.isTemplate,
    rhythm: input.rhythm === undefined ? existing.rhythm : input.rhythm,
    timerConfig: input.timerConfig === undefined ? existing.timerConfig : input.timerConfig,
    focusConfig: input.focusConfig === undefined ? existing.focusConfig : input.focusConfig,
    updatedAt: new Date().toISOString(),
  };
  getMemoryStore().blocks.set(blockId, updated);
  return toBlockDto(updated);
}

export async function deleteBlock(userId: string, blockId: string) {
  const existing = getMemoryStore().blocks.get(blockId);
  if (!existing || existing.userId !== userId) return null;
  getMemoryStore().blocks.delete(blockId);
  return { id: blockId };
}

export async function duplicateBlock(
  userId: string,
  blockId: string,
  options?: { asOwn?: boolean },
) {
  const existing = getMemoryStore().blocks.get(blockId);
  if (!existing || existing.userId !== userId) return null;
  const now = new Date().toISOString();
  const asOwn = options?.asOwn ?? true;
  const copy: MemoryBlock = {
    ...existing,
    id: createId("block"),
    title:
      asOwn && (existing.isPreset || existing.isTemplate)
        ? existing.title
        : `${existing.title} (Kopie)`,
    goalId: asOwn ? null : existing.goalId,
    isTemplate: false,
    isPreset: false,
    insights: null,
    sortOrder: (await listBlocks(userId)).length,
    createdAt: now,
    updatedAt: now,
  };
  getMemoryStore().blocks.set(copy.id, copy);
  return toBlockDto(copy);
}

export async function listCalendarEntries(userId: string) {
  return [...getMemoryStore().calendarEntries.values()]
    .filter((entry) => entry.userId === userId)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export async function createCalendarEntry(userId: string, raw: CreateCalendarEntryInput) {
  const input = createCalendarEntryInputSchema.parse(raw);
  const entry = {
    id: createId("cal"),
    userId,
    source: input.source,
    taskId: input.taskId ?? null,
    blockId: input.blockId ?? null,
    title: input.title,
    description: input.description ?? null,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    allDay: input.allDay,
    timezone: input.timezone,
    recurrenceRule: null,
  };
  getMemoryStore().calendarEntries.set(entry.id, entry);
  return entry;
}

export async function moveCalendarEntry(
  userId: string,
  entryId: string,
  raw: { startsAt: string; endsAt: string },
) {
  const input = moveCalendarEntryInputSchema.parse(raw);
  const existing = getMemoryStore().calendarEntries.get(entryId);
  if (!existing || existing.userId !== userId) {
    return null;
  }
  const updated = { ...existing, startsAt: input.startsAt, endsAt: input.endsAt };
  getMemoryStore().calendarEntries.set(entryId, updated);
  return updated;
}

function toFocusDto(session: {
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
}) {
  return {
    ...session,
    elapsedSeconds: elapsedFocusSeconds(session),
    remainingSeconds: remainingFocusSeconds(session),
  };
}

export async function getActiveFocusSession(userId: string) {
  const session = [...getMemoryStore().focusSessions.values()].find(
    (entry) => entry.userId === userId && (entry.status === "running" || entry.status === "paused"),
  );
  return session ? toFocusDto(session) : null;
}

export async function startFocusSession(
  userId: string,
  raw: { taskId?: string; blockId?: string; plannedDurationSeconds?: number },
) {
  const input = startFocusSessionInputSchema.parse(raw);
  const existing = await getActiveFocusSession(userId);
  if (existing) {
    throw new Error("FOCUS_ALREADY_ACTIVE");
  }

  const session = {
    id: createId("focus"),
    userId,
    taskId: input.taskId ?? null,
    blockId: input.blockId ?? null,
    status: "running" as const,
    plannedDurationSeconds: input.plannedDurationSeconds,
    startedAt: new Date().toISOString(),
    pausedAt: null,
    accumulatedPauseSeconds: 0,
    endedAt: null,
    isMinimized: false,
  };
  getMemoryStore().focusSessions.set(session.id, session);
  return toFocusDto(session);
}

export async function updateFocusSession(
  userId: string,
  sessionId: string,
  raw: { status?: "running" | "paused" | "completed" | "cancelled"; isMinimized?: boolean },
) {
  const input = updateFocusSessionInputSchema.parse(raw);
  const existing = getMemoryStore().focusSessions.get(sessionId);
  if (!existing || existing.userId !== userId) {
    return null;
  }

  if (input.status && input.status !== existing.status) {
    if (!canTransitionFocusStatus(existing.status, input.status)) {
      throw new Error("INVALID_FOCUS_TRANSITION");
    }
  }

  const now = new Date();
  let accumulatedPauseSeconds = existing.accumulatedPauseSeconds;
  let pausedAt = existing.pausedAt;
  let endedAt = existing.endedAt;
  const startedAt = existing.startedAt;

  if (input.status === "paused" && existing.status === "running") {
    pausedAt = now.toISOString();
  }

  if (input.status === "running" && existing.status === "paused" && existing.pausedAt) {
    accumulatedPauseSeconds += Math.max(
      0,
      Math.floor((now.getTime() - new Date(existing.pausedAt).getTime()) / 1000),
    );
    pausedAt = null;
  }

  if (input.status === "completed" || input.status === "cancelled") {
    endedAt = now.toISOString();
  }

  const updated = {
    ...existing,
    status: input.status ?? existing.status,
    isMinimized: input.isMinimized ?? existing.isMinimized,
    accumulatedPauseSeconds,
    pausedAt,
    endedAt,
    startedAt,
  };
  getMemoryStore().focusSessions.set(sessionId, updated);
  return toFocusDto(updated);
}

export async function listJournalTemplates(userId: string) {
  return [...getMemoryStore().journalTemplates.values()].filter(
    (template) => template.userId === userId,
  );
}

export async function upsertJournalEntry(
  userId: string,
  raw: {
    kind: "check_in" | "check_out";
    entryDate: string;
    templateId?: string;
    answers?: Record<string, unknown>;
    mood?: number;
    energy?: number;
  },
) {
  const input = upsertJournalEntryInputSchema.parse(raw);
  const store = getMemoryStore();
  const existing = [...store.journalEntries.values()].find(
    (entry) =>
      entry.userId === userId && entry.kind === input.kind && entry.entryDate === input.entryDate,
  );

  const entry = {
    id: existing?.id ?? createId("jentry"),
    userId,
    templateId: input.templateId ?? existing?.templateId ?? null,
    kind: input.kind,
    entryDate: input.entryDate,
    answers: input.answers,
    mood: input.mood ?? null,
    energy: input.energy ?? null,
  };
  store.journalEntries.set(entry.id, entry);
  return entry;
}

export async function listIntegrations(userId: string) {
  return [...getMemoryStore().integrations.values()].filter(
    (integration) => integration.userId === userId,
  );
}

export async function connectIntegration(
  userId: string,
  provider: "google_calendar" | "microsoft_calendar",
) {
  const store = getMemoryStore();
  const existing = [...store.integrations.values()].find(
    (integration) => integration.userId === userId && integration.provider === provider,
  );

  const integration = {
    id: existing?.id ?? createId("int"),
    userId,
    provider,
    status: "connected" as const,
    lastError: null,
    lastSyncedAt: new Date().toISOString(),
  };
  store.integrations.set(integration.id, integration);
  return integration;
}

export async function disconnectIntegration(
  userId: string,
  provider: "google_calendar" | "microsoft_calendar",
) {
  const store = getMemoryStore();
  const existing = [...store.integrations.values()].find(
    (integration) => integration.userId === userId && integration.provider === provider,
  );
  if (!existing) {
    return null;
  }
  const updated = {
    ...existing,
    status: "disconnected" as const,
    lastError: null,
  };
  store.integrations.set(existing.id, updated);
  return updated;
}
