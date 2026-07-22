import { describe, expect, it } from "vitest";

import {
  applyPlacementsToTasks,
  applyTaskDragOver,
  buildTaskDragLayout,
  canMoveUnderParent,
  groupContainerKey,
  layoutToPlacements,
  parentContainerKey,
} from "./task-drag-layout";

const tasks = [
  { id: "a", parentTaskId: null, groupKey: "root", sortOrder: 0 },
  { id: "b", parentTaskId: null, groupKey: "root", sortOrder: 1 },
  { id: "c", parentTaskId: null, groupKey: "abschnitt-4", sortOrder: 0 },
  { id: "a1", parentTaskId: "a", groupKey: "root", sortOrder: 0 },
];

describe("task-drag-layout", () => {
  it("builds containers for groups and parents", () => {
    const layout = buildTaskDragLayout(tasks);
    expect(layout[groupContainerKey("root")]).toEqual(["a", "b"]);
    expect(layout[groupContainerKey("abschnitt-4")]).toEqual(["c"]);
    expect(layout[parentContainerKey("a")]).toEqual(["a1"]);
  });

  it("reorders within the same group", () => {
    const layout = buildTaskDragLayout(tasks);
    const byId = new Map(tasks.map((task) => [task.id, task]));
    const next = applyTaskDragOver({
      layout,
      tasksById: byId,
      activeId: "a",
      overId: "b",
    });
    expect(next?.[groupContainerKey("root")]).toEqual(["b", "a"]);
  });

  it("moves across groups", () => {
    const layout = buildTaskDragLayout(tasks);
    const byId = new Map(tasks.map((task) => [task.id, task]));
    const next = applyTaskDragOver({
      layout,
      tasksById: byId,
      activeId: "b",
      overId: "c",
    });
    expect(next?.[groupContainerKey("root")]).toEqual(["a"]);
    expect(next?.[groupContainerKey("abschnitt-4")]).toEqual(["b", "c"]);
  });

  it("nests under another task when requested", () => {
    const layout = buildTaskDragLayout(tasks);
    const byId = new Map(tasks.map((task) => [task.id, task]));
    const next = applyTaskDragOver({
      layout,
      tasksById: byId,
      activeId: "b",
      overId: "a",
      nestUnderOver: true,
    });
    expect(next?.[groupContainerKey("root")]).toEqual(["a"]);
    // First child — not appended after existing children.
    expect(next?.[parentContainerKey("a")]).toEqual(["b", "a1"]);
  });

  it("inserts before a nested child when dragging into an expanded group", () => {
    const tree = [
      { id: "above", parentTaskId: null, groupKey: "root", sortOrder: 0 },
      { id: "parent", parentTaskId: null, groupKey: "root", sortOrder: 1 },
      { id: "below", parentTaskId: null, groupKey: "root", sortOrder: 2 },
      { id: "child", parentTaskId: "parent", groupKey: "root", sortOrder: 0 },
      { id: "child2", parentTaskId: "parent", groupKey: "root", sortOrder: 1 },
    ];
    const layout = buildTaskDragLayout(tree);
    const byId = new Map(tree.map((task) => [task.id, task]));
    const next = applyTaskDragOver({
      layout,
      tasksById: byId,
      activeId: "above",
      overId: "child2",
    });
    expect(next?.[groupContainerKey("root")]).toEqual(["parent", "below"]);
    expect(next?.[parentContainerKey("parent")]).toEqual(["child", "above", "child2"]);
  });

  it("reorders inside an expanded parent", () => {
    const nested = [
      { id: "p", parentTaskId: null, groupKey: "root", sortOrder: 0 },
      { id: "c1", parentTaskId: "p", groupKey: "root", sortOrder: 0 },
      { id: "c2", parentTaskId: "p", groupKey: "root", sortOrder: 1 },
      { id: "c3", parentTaskId: "p", groupKey: "root", sortOrder: 2 },
    ];
    const layout = buildTaskDragLayout(nested);
    const byId = new Map(nested.map((task) => [task.id, task]));
    const next = applyTaskDragOver({
      layout,
      tasksById: byId,
      activeId: "c1",
      overId: "c3",
    });
    expect(next?.[parentContainerKey("p")]).toEqual(["c2", "c3", "c1"]);
  });

  it("rejects nesting that would exceed max depth", () => {
    const deep = [
      { id: "r", parentTaskId: null, groupKey: "root", sortOrder: 0 },
      { id: "d1", parentTaskId: "r", groupKey: "root", sortOrder: 0 },
      { id: "d2", parentTaskId: "d1", groupKey: "root", sortOrder: 0 },
      { id: "d3", parentTaskId: "d2", groupKey: "root", sortOrder: 0 },
      { id: "d4", parentTaskId: "d3", groupKey: "root", sortOrder: 0 },
      { id: "x", parentTaskId: null, groupKey: "root", sortOrder: 1 },
    ];
    const byId = new Map(deep.map((task) => [task.id, task]));
    expect(canMoveUnderParent(byId, "x", "d4")).toBe(false);
  });

  it("maps layout to placements and cascades groupKey", () => {
    const layout = {
      [groupContainerKey("abschnitt-4")]: ["a"],
      [parentContainerKey("a")]: ["a1"],
    };
    const byId = new Map(tasks.map((task) => [task.id, task]));
    const placements = layoutToPlacements(layout, byId);
    const applied = applyPlacementsToTasks(tasks, placements);
    const a = applied.find((task) => task.id === "a");
    const a1 = applied.find((task) => task.id === "a1");
    expect(a?.groupKey).toBe("abschnitt-4");
    expect(a?.parentTaskId).toBeNull();
    expect(a1?.groupKey).toBe("abschnitt-4");
    expect(a1?.parentTaskId).toBe("a");
  });
});
