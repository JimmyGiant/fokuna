import type {
  CategoryDto,
  CreateCategoryInput,
  CreateLabelInput,
  LabelDto,
  UpdateCategoryInput,
  UpdateLabelInput,
} from "@fokuna/api-contracts";
import { createId } from "@fokuna/domain";

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

export async function deleteCategory(userId: string, categoryId: string): Promise<boolean> {
  const existing = await getCategory(userId, categoryId);
  if (!existing) return false;
  getMemoryStore().categories.delete(categoryId);
  const store = getMemoryStore();
  for (const [taskId, task] of store.tasks) {
    if (task.userId === userId && task.categoryId === categoryId) {
      store.tasks.set(taskId, {
        ...task,
        categoryId: null,
        updatedAt: new Date().toISOString(),
      });
    }
  }
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
