import type {
  CategoryDto,
  CreateCategoryInput,
  CreateLabelInput,
  LabelDto,
  ReorderIdsInput,
  UpdateCategoryInput,
  UpdateLabelInput,
} from "@fokuna/api-contracts";
import { applySortOrders, createId } from "@fokuna/domain";

import { getMemoryStore } from "../memory/store";

export async function listCategories(userId: string): Promise<CategoryDto[]> {
  return [...getMemoryStore().categories.values()]
    .filter((category) => category.userId === userId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export async function getCategory(userId: string, categoryId: string): Promise<CategoryDto | null> {
  const category = getMemoryStore().categories.get(categoryId);
  return category && category.userId === userId ? category : null;
}

export async function createCategory(
  userId: string,
  input: CreateCategoryInput,
): Promise<CategoryDto> {
  const now = new Date().toISOString();
  const existing = await listCategories(userId);
  const category: CategoryDto = {
    id: createId("cat"),
    userId,
    name: input.name,
    colorToken: input.colorToken,
    icon: input.icon ?? null,
    sortOrder: input.sortOrder ?? existing.length,
    createdAt: now,
    updatedAt: now,
  };
  getMemoryStore().categories.set(category.id, category);
  return category;
}

export async function updateCategory(
  userId: string,
  categoryId: string,
  input: UpdateCategoryInput,
): Promise<CategoryDto | null> {
  const existing = await getCategory(userId, categoryId);
  if (!existing) return null;
  const updated: CategoryDto = {
    ...existing,
    name: input.name ?? existing.name,
    colorToken: input.colorToken ?? existing.colorToken,
    icon: input.icon === undefined ? existing.icon : input.icon,
    sortOrder: input.sortOrder ?? existing.sortOrder,
    updatedAt: new Date().toISOString(),
  };
  getMemoryStore().categories.set(categoryId, updated);
  return updated;
}

export async function reorderCategories(
  userId: string,
  input: ReorderIdsInput,
): Promise<CategoryDto[]> {
  const existing = await listCategories(userId);
  const existingIds = new Set(existing.map((category) => category.id));
  if (
    input.orderedIds.length !== existing.length ||
    input.orderedIds.some((id) => !existingIds.has(id))
  ) {
    throw new Error("Invalid category reorder payload");
  }

  const now = new Date().toISOString();
  const store = getMemoryStore();
  const reordered = applySortOrders(existing, input.orderedIds);
  for (const category of reordered) {
    store.categories.set(category.id, { ...category, updatedAt: now });
  }
  return listCategories(userId);
}

export async function deleteCategory(userId: string, categoryId: string): Promise<boolean> {
  const existing = await getCategory(userId, categoryId);
  if (!existing) return false;
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
  const stack = userTasks
    .filter((task) => task.categoryId === categoryId)
    .map((task) => task.id);
  while (stack.length > 0) {
    const id = stack.pop()!;
    if (deleteIds.has(id)) continue;
    deleteIds.add(id);
    const children = childrenByParent.get(id);
    if (children) stack.push(...children);
  }

  for (const taskId of deleteIds) {
    store.tasks.delete(taskId);
  }

  for (const [entryId, entry] of store.calendarEntries) {
    if (entry.userId === userId && entry.taskId && deleteIds.has(entry.taskId)) {
      store.calendarEntries.delete(entryId);
    }
  }

  store.categories.delete(categoryId);

  for (const [blockId, block] of store.blocks) {
    if (block.userId === userId && block.categoryId === categoryId) {
      store.blocks.set(blockId, { ...block, categoryId: null });
    }
  }
  return true;
}

export async function listLabels(userId: string): Promise<LabelDto[]> {
  return [...getMemoryStore().labels.values()]
    .filter((label) => label.userId === userId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export async function getLabel(userId: string, labelId: string): Promise<LabelDto | null> {
  const label = getMemoryStore().labels.get(labelId);
  return label && label.userId === userId ? label : null;
}

export async function createLabel(userId: string, input: CreateLabelInput): Promise<LabelDto> {
  const now = new Date().toISOString();
  const existing = await listLabels(userId);
  const label: LabelDto = {
    id: createId("label"),
    userId,
    name: input.name,
    colorToken: input.colorToken,
    sortOrder: input.sortOrder ?? existing.length,
    createdAt: now,
    updatedAt: now,
  };
  getMemoryStore().labels.set(label.id, label);
  return label;
}

export async function updateLabel(
  userId: string,
  labelId: string,
  input: UpdateLabelInput,
): Promise<LabelDto | null> {
  const existing = await getLabel(userId, labelId);
  if (!existing) return null;
  const updated: LabelDto = {
    ...existing,
    name: input.name ?? existing.name,
    colorToken: input.colorToken ?? existing.colorToken,
    sortOrder: input.sortOrder ?? existing.sortOrder,
    updatedAt: new Date().toISOString(),
  };
  getMemoryStore().labels.set(labelId, updated);
  return updated;
}

export async function reorderLabels(
  userId: string,
  input: ReorderIdsInput,
): Promise<LabelDto[]> {
  const existing = await listLabels(userId);
  const existingIds = new Set(existing.map((label) => label.id));
  if (
    input.orderedIds.length !== existing.length ||
    input.orderedIds.some((id) => !existingIds.has(id))
  ) {
    throw new Error("Invalid label reorder payload");
  }

  const now = new Date().toISOString();
  const store = getMemoryStore();
  const reordered = applySortOrders(existing, input.orderedIds);
  for (const label of reordered) {
    store.labels.set(label.id, { ...label, updatedAt: now });
  }
  return listLabels(userId);
}

export async function deleteLabel(userId: string, labelId: string): Promise<boolean> {
  const existing = await getLabel(userId, labelId);
  if (!existing) return false;
  getMemoryStore().labels.delete(labelId);
  const store = getMemoryStore();
  for (const [taskId, task] of store.tasks) {
    if (task.userId === userId && task.labelIds.includes(labelId)) {
      store.tasks.set(taskId, {
        ...task,
        labelIds: task.labelIds.filter((id) => id !== labelId),
        updatedAt: new Date().toISOString(),
      });
    }
  }
  return true;
}
