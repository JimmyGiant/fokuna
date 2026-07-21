import { describe, expect, it } from "vitest";

import {
  canCreateSubtaskAtDepth,
  TASK_MAX_DEPTH,
  TASK_MAX_INDENT_LEVEL,
  taskIndentLevelFromDepth,
} from "./task-hierarchy";

describe("task hierarchy", () => {
  it("caps nesting at five depths / indent 0–4", () => {
    expect(TASK_MAX_DEPTH).toBe(5);
    expect(TASK_MAX_INDENT_LEVEL).toBe(4);
    expect(taskIndentLevelFromDepth(1)).toBe(0);
    expect(taskIndentLevelFromDepth(5)).toBe(4);
    expect(taskIndentLevelFromDepth(9)).toBe(4);
  });

  it("blocks subtask creation at the deepest level", () => {
    expect(canCreateSubtaskAtDepth(1)).toBe(true);
    expect(canCreateSubtaskAtDepth(4)).toBe(true);
    expect(canCreateSubtaskAtDepth(5)).toBe(false);
  });
});
