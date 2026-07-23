import { describe, expect, it } from "vitest";

import {
  COMPLETED_TASK_PAGE_SIZE,
  applyCompletedTaskWindow,
  compareCompletedAtDesc,
  formatRemainingCompletedLabel,
} from "./completed-task-window";

type Task = {
  id: string;
  parentTaskId: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  sortOrder: number;
  groupKey: string;
};

function task(partial: Partial<Task> & Pick<Task, "id">): Task {
  return {
    parentTaskId: null,
    isCompleted: false,
    completedAt: null,
    sortOrder: 0,
    groupKey: "inbox",
    ...partial,
  };
}

describe("completed-task-window", () => {
  it("formats remaining copy without a leading plus", () => {
    expect(formatRemainingCompletedLabel(50)).toBe("50 weitere erledigte Aufgaben");
    expect(formatRemainingCompletedLabel(1)).toBe("1 weitere erledigte Aufgabe");
  });

  it("orders by completedAt descending", () => {
    const newer = task({ id: "a", completedAt: "2026-07-23T12:00:00.000Z" });
    const older = task({ id: "b", completedAt: "2026-07-22T12:00:00.000Z" });
    expect([older, newer].sort(compareCompletedAtDesc).map((item) => item.id)).toEqual([
      "a",
      "b",
    ]);
  });

  it("keeps open roots and windows completed roots newest-first", () => {
    const tasks = [
      task({ id: "open", sortOrder: 0, isCompleted: false }),
      ...Array.from({ length: 25 }, (_, index) =>
        task({
          id: `done-${index}`,
          sortOrder: index + 1,
          isCompleted: true,
          completedAt: `2026-07-${String(index + 1).padStart(2, "0")}T10:00:00.000Z`,
        }),
      ),
    ];

    const result = applyCompletedTaskWindow({
      tasks,
      showCompleted: true,
      revealByBucket: {},
      bucketKeyForRoot: () => "inbox",
    });

    const rootIds = result.displayTasks.filter((item) => !item.parentTaskId).map((item) => item.id);
    expect(rootIds[0]).toBe("open");
    expect(rootIds).toHaveLength(1 + COMPLETED_TASK_PAGE_SIZE);
    expect(result.remainingByBucket.inbox).toBe(5);
    expect(result.displayTasks.some((item) => item.id === "done-0")).toBe(false);
    const newest = result.displayTasks.find((item) => item.id === "done-24");
    const oldestVisible = result.displayTasks.find((item) => item.id === "done-5");
    expect(newest?.sortOrder).toBeLessThan(oldestVisible?.sortOrder ?? Number.POSITIVE_INFINITY);
  });

  it("includes subtree of a revealed completed root and drops hidden completed subtrees", () => {
    const tasks = [
      task({
        id: "done-root",
        isCompleted: true,
        completedAt: "2026-07-23T10:00:00.000Z",
      }),
      task({
        id: "done-child",
        parentTaskId: "done-root",
        isCompleted: true,
        completedAt: "2026-07-23T09:00:00.000Z",
      }),
      task({
        id: "hidden-root",
        isCompleted: true,
        completedAt: "2026-01-01T10:00:00.000Z",
        sortOrder: 1,
      }),
      task({
        id: "hidden-child",
        parentTaskId: "hidden-root",
        isCompleted: true,
        completedAt: "2026-01-01T09:00:00.000Z",
      }),
    ];

    const result = applyCompletedTaskWindow({
      tasks,
      showCompleted: true,
      revealByBucket: { inbox: 1 },
      bucketKeyForRoot: () => "inbox",
    });

    const ids = new Set(result.displayTasks.map((item) => item.id));
    expect(ids.has("done-root")).toBe(true);
    expect(ids.has("done-child")).toBe(true);
    expect(ids.has("hidden-root")).toBe(false);
    expect(ids.has("hidden-child")).toBe(false);
    expect(result.remainingByBucket.inbox).toBe(1);
  });
});
