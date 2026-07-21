import type { CreateTaskInput, TaskDto, UpdateTaskInput } from "@fokuna/api-contracts";
import { and, asc, eq, isNull, task as taskTable } from "@fokuna/db";
import { canCreateSubtaskAtDepth, createId, TASK_MAX_DEPTH } from "@fokuna/domain";

import { getDatabase } from "../db";
import { getDataDriver } from "../env";
import { getMemoryStore } from "../memory/store";

function mapDbTask(row: typeof taskTable.$inferSelect): TaskDto {
  return {
    id: row.id,
    userId: row.userId,
    goalId: row.goalId,
    milestoneId: row.milestoneId,
    parentTaskId: row.parentTaskId,
    groupKey: row.groupKey,
    title: row.title,
    description: row.description,
    priority: row.priority,
    estimateMinutes: row.estimateMinutes,
    dueDate: row.dueDate,
    isFavorite: row.isFavorite,
    isCompleted: row.isCompleted,
    completedAt: row.completedAt?.toISOString() ?? null,
    sortOrder: row.sortOrder,
    tags: row.tags ?? [],
    archivedAt: row.archivedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listTasks(
  userId: string,
  options: { groupKey?: string; goalId?: string; includeCompleted?: boolean } = {},
): Promise<TaskDto[]> {
  if (getDataDriver() === "memory") {
    return [...getMemoryStore().tasks.values()]
      .filter((task) => task.userId === userId)
      .filter((task) => (options.groupKey ? task.groupKey === options.groupKey : true))
      .filter((task) => (options.goalId ? task.goalId === options.goalId : true))
      .filter((task) => (options.includeCompleted === false ? !task.isCompleted : true))
      .filter((task) => !task.archivedAt)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt));
  }

  const db = getDatabase();
  const rows = await db
    .select()
    .from(taskTable)
    .where(and(eq(taskTable.userId, userId), isNull(taskTable.archivedAt)))
    .orderBy(asc(taskTable.sortOrder), asc(taskTable.createdAt));

  return rows
    .map(mapDbTask)
    .filter((task) => (options.groupKey ? task.groupKey === options.groupKey : true))
    .filter((task) => (options.goalId ? task.goalId === options.goalId : true))
    .filter((task) => (options.includeCompleted === false ? !task.isCompleted : true));
}

export async function getTask(userId: string, taskId: string): Promise<TaskDto | null> {
  if (getDataDriver() === "memory") {
    const task = getMemoryStore().tasks.get(taskId);
    return task && task.userId === userId ? task : null;
  }

  const db = getDatabase();
  const [row] = await db
    .select()
    .from(taskTable)
    .where(and(eq(taskTable.id, taskId), eq(taskTable.userId, userId)))
    .limit(1);

  return row ? mapDbTask(row) : null;
}

export async function createTask(userId: string, input: CreateTaskInput): Promise<TaskDto> {
  if (input.parentTaskId) {
    const parent = await getTask(userId, input.parentTaskId);
    if (!parent) {
      throw new Error("Parent task not found");
    }
    let parentDepth = 1;
    let cursor = parent.parentTaskId ? await getTask(userId, parent.parentTaskId) : null;
    while (cursor) {
      parentDepth += 1;
      cursor = cursor.parentTaskId ? await getTask(userId, cursor.parentTaskId) : null;
    }
    if (!canCreateSubtaskAtDepth(parentDepth)) {
      throw new Error(`Tasks cannot nest deeper than ${TASK_MAX_DEPTH} levels`);
    }
  }

  const now = new Date();
  const id = createId("task");

  if (getDataDriver() === "memory") {
    const existing = await listTasks(userId, { groupKey: input.groupKey });
    const task: TaskDto = {
      id,
      userId,
      goalId: input.goalId ?? null,
      milestoneId: input.milestoneId ?? null,
      parentTaskId: input.parentTaskId ?? null,
      groupKey: input.groupKey,
      title: input.title,
      description: input.description ?? null,
      priority: input.priority,
      estimateMinutes: input.estimateMinutes ?? null,
      dueDate: input.dueDate ?? null,
      isFavorite: input.isFavorite,
      isCompleted: false,
      completedAt: null,
      sortOrder: existing.length,
      tags: input.tags,
      archivedAt: null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    getMemoryStore().tasks.set(id, task);
    return task;
  }

  const db = getDatabase();
  const [row] = await db
    .insert(taskTable)
    .values({
      id,
      userId,
      goalId: input.goalId,
      milestoneId: input.milestoneId,
      parentTaskId: input.parentTaskId,
      groupKey: input.groupKey,
      title: input.title,
      description: input.description,
      priority: input.priority,
      estimateMinutes: input.estimateMinutes,
      dueDate: input.dueDate,
      isFavorite: input.isFavorite,
      tags: input.tags,
      sortOrder: 0,
    })
    .returning();

  if (!row) {
    throw new Error("Failed to create task");
  }

  return mapDbTask(row);
}

export async function updateTask(
  userId: string,
  taskId: string,
  input: UpdateTaskInput,
): Promise<TaskDto | null> {
  const existing = await getTask(userId, taskId);
  if (!existing) {
    return null;
  }

  const now = new Date();
  const nextCompleted = input.isCompleted === undefined ? existing.isCompleted : input.isCompleted;

  if (getDataDriver() === "memory") {
    const updated: TaskDto = {
      ...existing,
      ...input,
      description: input.description === undefined ? existing.description : input.description,
      goalId: input.goalId === undefined ? existing.goalId : input.goalId,
      milestoneId: input.milestoneId === undefined ? existing.milestoneId : input.milestoneId,
      parentTaskId: input.parentTaskId === undefined ? existing.parentTaskId : input.parentTaskId,
      estimateMinutes:
        input.estimateMinutes === undefined ? existing.estimateMinutes : input.estimateMinutes,
      dueDate: input.dueDate === undefined ? existing.dueDate : input.dueDate,
      tags: input.tags === undefined ? existing.tags : input.tags,
      isCompleted: nextCompleted,
      completedAt: nextCompleted ? (existing.completedAt ?? now.toISOString()) : null,
      updatedAt: now.toISOString(),
    };
    getMemoryStore().tasks.set(taskId, updated);
    return updated;
  }

  const db = getDatabase();
  const patch: Partial<typeof taskTable.$inferInsert> = {
    updatedAt: now,
  };

  if (input.title !== undefined) patch.title = input.title;
  if (input.description !== undefined) patch.description = input.description;
  if (input.groupKey !== undefined) patch.groupKey = input.groupKey;
  if (input.goalId !== undefined) patch.goalId = input.goalId;
  if (input.milestoneId !== undefined) patch.milestoneId = input.milestoneId;
  if (input.parentTaskId !== undefined) patch.parentTaskId = input.parentTaskId;
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.estimateMinutes !== undefined) patch.estimateMinutes = input.estimateMinutes;
  if (input.dueDate !== undefined) patch.dueDate = input.dueDate;
  if (input.isFavorite !== undefined) patch.isFavorite = input.isFavorite;
  if (input.tags !== undefined) patch.tags = input.tags;
  if (input.sortOrder !== undefined) patch.sortOrder = input.sortOrder;
  if (input.isCompleted !== undefined) {
    patch.isCompleted = nextCompleted;
    patch.completedAt = nextCompleted
      ? existing.completedAt
        ? new Date(existing.completedAt)
        : now
      : null;
  }

  const [row] = await db
    .update(taskTable)
    .set(patch)
    .where(and(eq(taskTable.id, taskId), eq(taskTable.userId, userId)))
    .returning();

  return row ? mapDbTask(row) : null;
}

export async function reorderTasks(
  userId: string,
  groupKey: string,
  orderedIds: string[],
): Promise<TaskDto[]> {
  if (getDataDriver() === "memory") {
    const store = getMemoryStore();
    orderedIds.forEach((id, index) => {
      const task = store.tasks.get(id);
      if (task && task.userId === userId && task.groupKey === groupKey) {
        store.tasks.set(id, { ...task, sortOrder: index, updatedAt: new Date().toISOString() });
      }
    });
    return listTasks(userId, { groupKey });
  }

  const db = getDatabase();
  await Promise.all(
    orderedIds.map((id, index) =>
      db
        .update(taskTable)
        .set({ sortOrder: index, updatedAt: new Date() })
        .where(
          and(eq(taskTable.id, id), eq(taskTable.userId, userId), eq(taskTable.groupKey, groupKey)),
        ),
    ),
  );

  return listTasks(userId, { groupKey });
}

export async function archiveTask(userId: string, taskId: string): Promise<TaskDto | null> {
  const existing = await getTask(userId, taskId);
  if (!existing) {
    return null;
  }

  const now = new Date();

  if (getDataDriver() === "memory") {
    const updated: TaskDto = {
      ...existing,
      archivedAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    getMemoryStore().tasks.set(taskId, updated);
    return updated;
  }

  const db = getDatabase();
  const [row] = await db
    .update(taskTable)
    .set({ archivedAt: now, updatedAt: now })
    .where(and(eq(taskTable.id, taskId), eq(taskTable.userId, userId)))
    .returning();

  return row ? mapDbTask(row) : null;
}
