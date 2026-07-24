import { describe, expect, it } from "vitest";

import {
  compareTasksForListView,
  derivedGroupKeyForTask,
  taskMatchesListViewFilters,
} from "./tasks-list-view-pipeline";

describe("taskMatchesListViewFilters", () => {
  it("matches date / priority / label with AND semantics", () => {
    const task = {
      dueDate: "2026-07-24",
      priority: "urgent",
      labelIds: ["a", "b"],
    };
    expect(
      taskMatchesListViewFilters(
        task,
        { date: "today", priorities: ["urgent"], labelIds: ["b"] },
        "2026-07-24",
      ),
    ).toBe(true);
    expect(
      taskMatchesListViewFilters(
        task,
        { date: "today", priorities: ["low"], labelIds: ["b"] },
        "2026-07-24",
      ),
    ).toBe(false);
    expect(
      taskMatchesListViewFilters(
        task,
        { date: "no_date", priorities: [], labelIds: [] },
        "2026-07-24",
      ),
    ).toBe(false);
  });
});

describe("derivedGroupKeyForTask", () => {
  it("buckets due dates and priorities", () => {
    expect(derivedGroupKeyForTask({ dueDate: "2026-07-20", createdAt: "", priority: "none", labelIds: [] }, "date", "2026-07-24")).toBe(
      "overdue",
    );
    expect(derivedGroupKeyForTask({ dueDate: "2026-07-24", createdAt: "", priority: "none", labelIds: [] }, "deadline", "2026-07-24")).toBe(
      "today",
    );
    expect(derivedGroupKeyForTask({ dueDate: null, createdAt: "", priority: "medium", labelIds: [] }, "priority", "2026-07-24")).toBe(
      "priority:medium",
    );
    expect(derivedGroupKeyForTask({ dueDate: null, createdAt: "", priority: "none", labelIds: ["z", "a"] }, "label", "2026-07-24")).toBe(
      "label:a",
    );
  });
});

describe("compareTasksForListView", () => {
  const a = {
    id: "a",
    title: "Alpha",
    sortOrder: 2,
    priority: "low",
    dueDate: "2026-07-25",
    createdAt: "2026-01-01T00:00:00.000Z",
    labelIds: [],
  };
  const b = {
    id: "b",
    title: "Beta",
    sortOrder: 1,
    priority: "urgent",
    dueDate: "2026-07-20",
    createdAt: "2026-06-01T00:00:00.000Z",
    labelIds: [],
  };

  it("uses sortOrder for manual and priority rank otherwise", () => {
    expect(compareTasksForListView(a, b, "manual", "asc")).toBeGreaterThan(0);
    expect(compareTasksForListView(a, b, "priority", "asc")).toBeGreaterThan(0);
    expect(compareTasksForListView(a, b, "name", "asc")).toBeLessThan(0);
  });
});
