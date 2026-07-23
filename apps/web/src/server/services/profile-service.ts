import type { UpdateUserProfileInput, UserProfileDto } from "@fokuna/api-contracts";
import { eq, userProfile } from "@fokuna/db";
import {
  normalizeTasksSidebarPreferences,
  resolveTasksSidebarPreferences,
  type UiPreferences,
} from "@fokuna/domain";

import { getDatabase } from "../db";
import { getDataDriver } from "../env";
import { getMemoryStore } from "../memory/store";

function defaultProfile(userId: string): UserProfileDto {
  const now = new Date().toISOString();
  return {
    userId,
    timezone: "Europe/Berlin",
    locale: "de",
    weekStartsOn: 1,
    uiPreferences: {},
    createdAt: now,
    updatedAt: now,
  };
}

function mergeUiPreferences(
  existing: UiPreferences,
  input: UpdateUserProfileInput,
): UiPreferences {
  const next: UiPreferences = { ...existing, ...(input.uiPreferences ?? {}) };
  if (input.tasksSidebar) {
    const current = resolveTasksSidebarPreferences(existing);
    next.tasksSidebar = normalizeTasksSidebarPreferences({
      ...current,
      ...input.tasksSidebar,
      hiddenIds: input.tasksSidebar.hiddenIds ?? current.hiddenIds,
      navOrder: input.tasksSidebar.navOrder ?? current.navOrder,
      sectionOrder: input.tasksSidebar.sectionOrder ?? current.sectionOrder,
    });
  }
  return next;
}

export async function getOrCreateUserProfile(userId: string): Promise<UserProfileDto> {
  if (getDataDriver() === "memory") {
    const store = getMemoryStore();
    const existing = store.profiles.get(userId);
    if (existing) return existing;
    const created = defaultProfile(userId);
    store.profiles.set(userId, created);
    return created;
  }

  const db = getDatabase();
  const rows = await db.select().from(userProfile).where(eq(userProfile.userId, userId)).limit(1);
  const row = rows[0];
  if (row) {
    return {
      userId: row.userId,
      timezone: row.timezone,
      locale: row.locale,
      weekStartsOn: row.weekStartsOn,
      uiPreferences: (row.uiPreferences ?? {}) as UiPreferences,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  const created = defaultProfile(userId);
  await db.insert(userProfile).values({
    userId: created.userId,
    timezone: created.timezone,
    locale: created.locale,
    weekStartsOn: created.weekStartsOn,
    uiPreferences: created.uiPreferences,
  });
  return created;
}

export async function updateUserProfile(
  userId: string,
  input: UpdateUserProfileInput,
): Promise<UserProfileDto> {
  const existing = await getOrCreateUserProfile(userId);
  const now = new Date().toISOString();
  const updated: UserProfileDto = {
    ...existing,
    timezone: input.timezone ?? existing.timezone,
    locale: input.locale ?? existing.locale,
    weekStartsOn: input.weekStartsOn ?? existing.weekStartsOn,
    uiPreferences: mergeUiPreferences(existing.uiPreferences, input),
    updatedAt: now,
  };

  if (getDataDriver() === "memory") {
    getMemoryStore().profiles.set(userId, updated);
    return updated;
  }

  const db = getDatabase();
  await db
    .update(userProfile)
    .set({
      timezone: updated.timezone,
      locale: updated.locale,
      weekStartsOn: updated.weekStartsOn,
      uiPreferences: updated.uiPreferences,
      updatedAt: new Date(now),
    })
    .where(eq(userProfile.userId, userId));

  return updated;
}
