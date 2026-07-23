import { describe, expect, it } from "vitest";

import {
  DEFAULT_TASKS_COMPLETE_ANIMATIONS,
  DEFAULT_TASKS_SIDEBAR_NAV_ORDER,
  DEFAULT_TASKS_SIDEBAR_SECTION_ORDER,
  normalizeTasksPreferences,
  normalizeTasksSidebarPreferences,
  resolveTasksPreferences,
  resolveTasksSidebarPreferences,
} from "./ui-preferences";

describe("tasks sidebar preferences", () => {
  it("defaults to full visibility and canonical order", () => {
    expect(normalizeTasksSidebarPreferences({})).toEqual({
      navOrder: [...DEFAULT_TASKS_SIDEBAR_NAV_ORDER],
      sectionOrder: [...DEFAULT_TASKS_SIDEBAR_SECTION_ORDER],
      hiddenIds: [],
    });
  });

  it("keeps known order, drops unknowns, appends missing ids", () => {
    expect(
      normalizeTasksSidebarPreferences({
        navOrder: ["inbox", "bogus", "favorites"] as never,
        sectionOrder: ["priority", "categories"] as never,
        hiddenIds: ["today", "inbox", "labels", "nope"] as never,
      }),
    ).toEqual({
      navOrder: ["inbox", "favorites", "today"],
      sectionOrder: ["priority", "categories", "goals", "labels"],
      hiddenIds: ["today", "labels"],
    });
  });

  it("resolves nested uiPreferences.tasksSidebar", () => {
    expect(
      resolveTasksSidebarPreferences({
        tasksSidebar: {
          navOrder: ["today", "inbox", "favorites"],
          sectionOrder: ["labels", "goals", "priority", "categories"],
          hiddenIds: ["favorites", "priority"],
        },
      }),
    ).toEqual({
      navOrder: ["today", "inbox", "favorites"],
      sectionOrder: ["labels", "goals", "priority", "categories"],
      hiddenIds: ["favorites", "priority"],
    });
  });
});

describe("tasks preferences", () => {
  it("defaults completeAnimations to on", () => {
    expect(normalizeTasksPreferences({})).toEqual({
      completeAnimations: DEFAULT_TASKS_COMPLETE_ANIMATIONS,
    });
    expect(DEFAULT_TASKS_COMPLETE_ANIMATIONS).toBe(true);
  });

  it("preserves an explicit off value", () => {
    expect(normalizeTasksPreferences({ completeAnimations: false })).toEqual({
      completeAnimations: false,
    });
  });

  it("resolves nested uiPreferences.tasks", () => {
    expect(resolveTasksPreferences({ tasks: { completeAnimations: false } })).toEqual({
      completeAnimations: false,
    });
  });
});
