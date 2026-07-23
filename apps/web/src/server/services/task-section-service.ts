import type {
  CreateTaskSectionInput,
  ReorderTaskSectionsInput,
  SetTaskSectionMembershipInput,
  TaskSectionDto,
  TaskSectionMembershipDto,
  UpdateTaskSectionInput,
} from "@fokuna/api-contracts";
import { applySortOrders, createId, TASK_SECTION_ROOT_KEY } from "@fokuna/domain";

import { getMemoryStore } from "../memory/store";

export const SECTION_ROOT_KEY = TASK_SECTION_ROOT_KEY;

type SectionScope =
  | { categoryId: string; labelId?: never }
  | { labelId: string; categoryId?: never };

function scopeFromInput(input: {
  categoryId?: string | null;
  labelId?: string | null;
}): SectionScope {
  if (input.categoryId && !input.labelId) return { categoryId: input.categoryId };
  if (input.labelId && !input.categoryId) return { labelId: input.labelId };
  throw new Error("Provide exactly one of categoryId or labelId");
}

function sectionMatchesScope(section: TaskSectionDto, scope: SectionScope): boolean {
  if (scope.categoryId) return section.categoryId === scope.categoryId;
  return section.labelId === scope.labelId;
}

export async function listTaskSections(
  userId: string,
  scope: { categoryId?: string; labelId?: string },
): Promise<TaskSectionDto[]> {
  const resolved = scopeFromInput(scope);
  return [...getMemoryStore().taskSections.values()]
    .filter((section) => section.userId === userId && sectionMatchesScope(section, resolved))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, "de"));
}

export async function getTaskSection(
  userId: string,
  sectionId: string,
): Promise<TaskSectionDto | null> {
  const section = getMemoryStore().taskSections.get(sectionId);
  return section && section.userId === userId ? section : null;
}

export async function listTaskSectionMemberships(
  userId: string,
  scope?: { categoryId?: string; labelId?: string },
): Promise<TaskSectionMembershipDto[]> {
  const store = getMemoryStore();
  const memberships = [...store.taskSectionMemberships.values()];
  if (!scope?.categoryId && !scope?.labelId) {
    return memberships.filter((membership) => {
      const section = store.taskSections.get(membership.sectionId);
      return Boolean(section && section.userId === userId);
    });
  }
  const sections = await listTaskSections(userId, scope);
  const sectionIds = new Set(sections.map((section) => section.id));
  return memberships.filter((membership) => sectionIds.has(membership.sectionId));
}

export async function createTaskSection(
  userId: string,
  input: CreateTaskSectionInput,
): Promise<TaskSectionDto> {
  const scope = scopeFromInput(input);
  const now = new Date().toISOString();
  const existing = await listTaskSections(userId, scope);
  const section: TaskSectionDto = {
    id: createId("tsec"),
    userId,
    title: input.title,
    categoryId: scope.categoryId ?? null,
    labelId: scope.labelId ?? null,
    sortOrder: input.sortOrder ?? existing.length,
    createdAt: now,
    updatedAt: now,
  };
  getMemoryStore().taskSections.set(section.id, section);
  return section;
}

export async function updateTaskSection(
  userId: string,
  sectionId: string,
  input: UpdateTaskSectionInput,
): Promise<TaskSectionDto | null> {
  const existing = await getTaskSection(userId, sectionId);
  if (!existing) return null;
  const updated: TaskSectionDto = {
    ...existing,
    title: input.title ?? existing.title,
    sortOrder: input.sortOrder ?? existing.sortOrder,
    updatedAt: new Date().toISOString(),
  };
  getMemoryStore().taskSections.set(sectionId, updated);
  return updated;
}

export async function reorderTaskSections(
  userId: string,
  input: ReorderTaskSectionsInput,
): Promise<TaskSectionDto[]> {
  const scope = scopeFromInput(input);
  const existing = await listTaskSections(userId, scope);
  const existingIds = new Set(existing.map((section) => section.id));
  if (
    input.orderedIds.length !== existing.length ||
    input.orderedIds.some((id) => !existingIds.has(id))
  ) {
    throw new Error("Invalid task section reorder payload");
  }

  const now = new Date().toISOString();
  const store = getMemoryStore();
  const reordered = applySortOrders(existing, input.orderedIds);
  for (const section of reordered) {
    store.taskSections.set(section.id, { ...section, updatedAt: now });
  }
  return listTaskSections(userId, scope);
}

function collectTaskSubtreeIds(userId: string, rootTaskIds: string[]): Set<string> {
  const store = getMemoryStore();
  const userTasks = [...store.tasks.values()].filter((task) => task.userId === userId);
  const childrenByParent = new Map<string, string[]>();
  for (const task of userTasks) {
    if (!task.parentTaskId) continue;
    const list = childrenByParent.get(task.parentTaskId) ?? [];
    list.push(task.id);
    childrenByParent.set(task.parentTaskId, list);
  }

  const deleteIds = new Set<string>();
  const stack = [...rootTaskIds];
  while (stack.length > 0) {
    const id = stack.pop()!;
    if (deleteIds.has(id)) continue;
    deleteIds.add(id);
    const children = childrenByParent.get(id);
    if (children) stack.push(...children);
  }
  return deleteIds;
}

function hardDeleteTasks(userId: string, deleteIds: Set<string>) {
  const store = getMemoryStore();
  for (const taskId of deleteIds) {
    store.tasks.delete(taskId);
  }
  for (const [entryId, entry] of store.calendarEntries) {
    if (entry.userId === userId && entry.taskId && deleteIds.has(entry.taskId)) {
      store.calendarEntries.delete(entryId);
    }
  }
  for (const [membershipId, membership] of store.taskSectionMemberships) {
    if (deleteIds.has(membership.taskId)) {
      store.taskSectionMemberships.delete(membershipId);
    }
  }
}

export async function deleteTaskSection(userId: string, sectionId: string): Promise<boolean> {
  const existing = await getTaskSection(userId, sectionId);
  if (!existing) return false;
  const store = getMemoryStore();

  const memberTaskIds = [...store.taskSectionMemberships.values()]
    .filter((membership) => membership.sectionId === sectionId)
    .map((membership) => membership.taskId);

  const deleteIds = collectTaskSubtreeIds(userId, memberTaskIds);
  hardDeleteTasks(userId, deleteIds);

  for (const [membershipId, membership] of store.taskSectionMemberships) {
    if (membership.sectionId === sectionId) {
      store.taskSectionMemberships.delete(membershipId);
    }
  }

  store.taskSections.delete(sectionId);
  return true;
}

/** Remove sections (and their memberships only) when a category/label is deleted. */
export function deleteSectionsForScope(userId: string, scope: SectionScope) {
  const store = getMemoryStore();
  for (const [sectionId, section] of store.taskSections) {
    if (section.userId !== userId || !sectionMatchesScope(section, scope)) continue;
    for (const [membershipId, membership] of store.taskSectionMemberships) {
      if (membership.sectionId === sectionId) {
        store.taskSectionMemberships.delete(membershipId);
      }
    }
    store.taskSections.delete(sectionId);
  }
}

export async function setTaskSectionMembership(
  userId: string,
  input: SetTaskSectionMembershipInput,
): Promise<TaskSectionMembershipDto | null> {
  const store = getMemoryStore();
  const task = store.tasks.get(input.taskId);
  if (!task || task.userId !== userId) {
    throw new Error("TASK_NOT_FOUND");
  }

  let scope: SectionScope;
  let targetSection: TaskSectionDto | null = null;

  if (input.sectionId) {
    targetSection = await getTaskSection(userId, input.sectionId);
    if (!targetSection) throw new Error("SECTION_NOT_FOUND");
    scope = scopeFromInput({
      categoryId: targetSection.categoryId ?? undefined,
      labelId: targetSection.labelId ?? undefined,
    });
  } else {
    scope = scopeFromInput({
      categoryId: input.categoryId,
      labelId: input.labelId,
    });
  }

  const scopeSections = await listTaskSections(userId, scope);
  const scopeSectionIds = new Set(scopeSections.map((section) => section.id));

  for (const [membershipId, membership] of store.taskSectionMemberships) {
    if (membership.taskId === input.taskId && scopeSectionIds.has(membership.sectionId)) {
      store.taskSectionMemberships.delete(membershipId);
    }
  }

  if (!input.sectionId || !targetSection) {
    return null;
  }

  const membership: TaskSectionMembershipDto = {
    id: createId("tsm"),
    taskId: input.taskId,
    sectionId: input.sectionId,
    createdAt: new Date().toISOString(),
  };
  store.taskSectionMemberships.set(membership.id, membership);
  return membership;
}

/** Resolve effective container key for a task on a category/label list. */
export function resolveSectionContainerKey(
  taskId: string,
  scopeSectionIds: Set<string>,
  memberships: TaskSectionMembershipDto[],
): string {
  const match = memberships.find(
    (membership) => membership.taskId === taskId && scopeSectionIds.has(membership.sectionId),
  );
  return match?.sectionId ?? SECTION_ROOT_KEY;
}
