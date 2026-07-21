/** Maximum nesting depth for tasks (root = depth 1 … deepest leaf = depth 5). */
export const TASK_MAX_DEPTH = 5;

/** 0-based list indent (root = 0 … deepest = 4). Matches `data-indent` on Task List Item. */
export const TASK_MAX_INDENT_LEVEL = TASK_MAX_DEPTH - 1;

export type TaskIndentLevel = 0 | 1 | 2 | 3 | 4;

export function taskIndentLevelFromDepth(depth: number): TaskIndentLevel {
  const level = Math.max(0, Math.min(TASK_MAX_INDENT_LEVEL, depth - 1));
  return level as TaskIndentLevel;
}

/** Subtasks are allowed under parents whose own depth is below the maximum. */
export function canCreateSubtaskAtDepth(parentDepth: number): boolean {
  return parentDepth >= 1 && parentDepth < TASK_MAX_DEPTH;
}
