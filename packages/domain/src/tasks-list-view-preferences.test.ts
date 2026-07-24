import { describe, expect, it } from "vitest";

import {
  DEFAULT_TASKS_LIST_VIEW_PREFERENCES,
  isTasksListViewManualMode,
  mergeTasksListViewPreferences,
  normalizeTasksListViewsMap,
  resolveTasksListViewPreferences,
  tasksListViewCapabilities,
  tasksListViewHasDeviation,
  tasksListViewKey,
} from "./tasks-list-view-preferences";

describe("tasksListViewKey", () => {
  it("prefers category / label / priority over smart filter", () => {
    expect(tasksListViewKey({ filter: "all", categoryId: "c1" })).toBe("category:c1");
    expect(tasksListViewKey({ filter: "favorites", labelId: "l1" })).toBe("label:l1");
    expect(tasksListViewKey({ filter: "all", priority: "high" })).toBe("priority:urgent");
    expect(tasksListViewKey({ filter: "today" })).toBe("smart:today");
    expect(tasksListViewKey({})).toBe("smart:all");
  });
});

describe("tasksListViewCapabilities", () => {
  it("disables grouping on today and locks nav dimensions", () => {
    expect(tasksListViewCapabilities("smart:today").grouping).toBe(false);
    expect(tasksListViewCapabilities("priority:urgent").filterPriority).toBe(false);
    expect(tasksListViewCapabilities("label:l1").filterLabel).toBe(false);
    expect(tasksListViewCapabilities("smart:inbox").showCompleted).toBe(true);
  });
});

describe("resolve + manual mode", () => {
  it("defaults to hide completed and manual ordering", () => {
    const prefs = resolveTasksListViewPreferences({}, "smart:all");
    expect(prefs).toEqual(DEFAULT_TASKS_LIST_VIEW_PREFERENCES);
    expect(isTasksListViewManualMode(prefs)).toBe(true);
    expect(tasksListViewHasDeviation(prefs)).toBe(false);
  });

  it("reads stored sparse map and treats filter as derived mode", () => {
    const prefs = resolveTasksListViewPreferences(
      {
        tasksListViews: {
          "category:c1": {
            showCompleted: true,
            grouping: "none",
            sorting: "manual",
            sortDirection: "asc",
            filters: { date: "today", priorities: [], labelIds: [] },
          },
        },
      },
      "category:c1",
    );
    expect(prefs.showCompleted).toBe(true);
    expect(prefs.filters.date).toBe("today");
    expect(isTasksListViewManualMode(prefs)).toBe(false);
    expect(tasksListViewHasDeviation(prefs)).toBe(true);
  });

  it("forces grouping none on today even if stored", () => {
    const prefs = resolveTasksListViewPreferences(
      {
        tasksListViews: {
          "smart:today": {
            showCompleted: true,
            grouping: "priority",
            sorting: "name",
            sortDirection: "desc",
            filters: { date: "all", priorities: [], labelIds: [] },
          },
        },
      },
      "smart:today",
    );
    expect(prefs.showCompleted).toBe(true);
    expect(prefs.grouping).toBe("none");
    expect(prefs.sorting).toBe("name");
  });
});

describe("normalizeTasksListViewsMap", () => {
  it("drops default-equivalent entries and unknown keys", () => {
    expect(
      normalizeTasksListViewsMap({
        "smart:all": { ...DEFAULT_TASKS_LIST_VIEW_PREFERENCES },
        "goal:x": { showCompleted: true },
        "category:c1": {
          showCompleted: true,
          grouping: "none",
          sorting: "manual",
          sortDirection: "asc",
          filters: { date: "all", priorities: [], labelIds: [] },
        },
      }),
    ).toEqual({
      "category:c1": {
        showCompleted: true,
        grouping: "none",
        sorting: "manual",
        sortDirection: "asc",
        filters: { date: "all", priorities: [], labelIds: [] },
      },
    });
  });
});

describe("mergeTasksListViewPreferences", () => {
  it("deep-merges filters without wiping sibling fields", () => {
    const current = mergeTasksListViewPreferences(DEFAULT_TASKS_LIST_VIEW_PREFERENCES, {
      showCompleted: true,
      filters: { priorities: ["urgent"] },
    });
    const next = mergeTasksListViewPreferences(current, {
      filters: { date: "today" },
    });
    expect(next.showCompleted).toBe(true);
    expect(next.filters.priorities).toEqual(["urgent"]);
    expect(next.filters.date).toBe("today");
  });
});
