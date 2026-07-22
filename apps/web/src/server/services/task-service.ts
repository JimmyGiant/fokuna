import {
  createTaskInputSchema,
  relocateTasksInputSchema,
  reorderTasksInputSchema,
  updateTaskInputSchema,
  type CreateTaskInput,
  type RelocateTasksInput,
  type TaskDto,
  type UpdateTaskInput,
} from "@fokuna/api-contracts";

import * as taskRepository from "../repositories/task-repository";

export async function listUserTasks(
  userId: string,
  query: { groupKey?: string; goalId?: string; includeCompleted?: boolean },
) {
  return taskRepository.listTasks(userId, query);
}

export async function getUserTask(userId: string, taskId: string) {
  return taskRepository.getTask(userId, taskId);
}

export async function createUserTask(userId: string, raw: CreateTaskInput): Promise<TaskDto> {
  const input = createTaskInputSchema.parse(raw);
  return taskRepository.createTask(userId, input);
}

export async function updateUserTask(
  userId: string,
  taskId: string,
  raw: UpdateTaskInput,
): Promise<TaskDto | null> {
  const input = updateTaskInputSchema.parse(raw);
  return taskRepository.updateTask(userId, taskId, input);
}

export async function reorderUserTasks(
  userId: string,
  raw: { groupKey: string; orderedIds: string[] },
) {
  const input = reorderTasksInputSchema.parse(raw);
  return taskRepository.reorderTasks(userId, input.groupKey, input.orderedIds);
}

export async function relocateUserTasks(userId: string, raw: RelocateTasksInput) {
  const input = relocateTasksInputSchema.parse(raw);
  return taskRepository.relocateTasks(userId, input.placements);
}

export async function archiveUserTask(userId: string, taskId: string) {
  return taskRepository.archiveTask(userId, taskId);
}
