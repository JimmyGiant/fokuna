import { describe, expect, it } from "vitest";

import {
  commitTaskTreeMove,
  flattenTasksForTree,
  getTaskTreeProjection,
  removeChildrenOfActive,
} from "./task-drag-tree";

const tasks = [
  { id: "a", parentTaskId: null, groupKey: "inbox", sortOrder: 0 },
  { id: "a1", parentTaskId: "a", groupKey: "inbox", sortOrder: 0 },
  { id: "a2", parentTaskId: "a", groupKey: "inbox", sortOrder: 1 },
  { id: "b", parentTaskId: null, groupKey: "inbox", sortOrder: 1 },
  { id: "c", parentTaskId: null, groupKey: "inbox", sortOrder: 2 },
];

describe("task-drag-tree", () => {
  it("flattens expanded trees in document order", () => {
    const flat = flattenTasksForTree(tasks, {});
    expect(flat.map((item) => item.id)).toEqual(["a", "a1", "a2", "b", "c"]);
    expect(flat.find((item) => item.id === "a1")?.depth).toBe(1);
    expect(flat.find((item) => item.id === "a")?.descendantIds).toEqual(["a1", "a2"]);
  });

  it("hides collapsed children", () => {
    const flat = flattenTasksForTree(tasks, { a: false });
    expect(flat.map((item) => item.id)).toEqual(["a", "b", "c"]);
  });

  it("hides active descendants while dragging", () => {
    const flat = flattenTasksForTree(tasks, {});
    const visible = removeChildrenOfActive(flat, "a");
    expect(visible.map((item) => item.id)).toEqual(["a", "b", "c"]);
  });

  it("projects nesting under previous item when indented right", () => {
    const flat = flattenTasksForTree(
      [
        { id: "a", parentTaskId: null, groupKey: "inbox", sortOrder: 0 },
        { id: "b", parentTaskId: null, groupKey: "inbox", sortOrder: 1 },
        { id: "c", parentTaskId: null, groupKey: "inbox", sortOrder: 2 },
      ],
      {},
    );
    // Live order already has c after b; indent right → nest under b.
    const projection = getTaskTreeProjection(flat, "c", "c", 48, 48);
    expect(projection).toMatchObject({ depth: 1, parentId: "b" });
  });

  it("stays sibling when dropped under another item without horizontal indent", () => {
    const flat = flattenTasksForTree(
      [
        { id: "a", parentTaskId: null, groupKey: "inbox", sortOrder: 0 },
        { id: "b", parentTaskId: null, groupKey: "inbox", sortOrder: 1 },
        { id: "c", parentTaskId: null, groupKey: "inbox", sortOrder: 2 },
      ],
      {},
    );
    const projection = getTaskTreeProjection(flat, "c", "c", 0, 48);
    expect(projection).toMatchObject({ depth: 0, parentId: null });
  });

  it("does not nest from a half-width right nudge", () => {
    const flat = flattenTasksForTree(
      [
        { id: "a", parentTaskId: null, groupKey: "inbox", sortOrder: 0 },
        { id: "b", parentTaskId: null, groupKey: "inbox", sortOrder: 1 },
      ],
      {},
    );
    // Math.round used to nest at 24px — Todoist needs a full step.
    const projection = getTaskTreeProjection(flat, "b", "b", 24, 48);
    expect(projection).toMatchObject({ depth: 0, parentId: null });
  });

  it("outdents when dragging left after a nested previous row", () => {
    const flat = flattenTasksForTree(tasks, {});
    // c sits after a2 (nested under a); next is root b so outdent is allowed.
    const visible = [
      flat.find((item) => item.id === "a")!,
      flat.find((item) => item.id === "a1")!,
      flat.find((item) => item.id === "a2")!,
      { ...flat.find((item) => item.id === "c")!, depth: 1, parentId: "a" },
      flat.find((item) => item.id === "b")!,
    ];
    const projection = getTaskTreeProjection(visible, "c", "c", -48, 48);
    expect(projection).toMatchObject({ depth: 0, parentId: null });
  });

  it("keeps sibling depth when a nested task is moved under a root without indent", () => {
    const flat = flattenTasksForTree(tasks, {});
    // a1 (depth 1) dropped after b (depth 0) with no X offset → become root sibling of b.
    const visible = removeChildrenOfActive(flat, null).filter((item) => item.id !== "a1");
    // Simulate live order: a, a2, b, a1
    const a = flat.find((item) => item.id === "a")!;
    const a2 = flat.find((item) => item.id === "a2")!;
    const b = flat.find((item) => item.id === "b")!;
    const a1 = flat.find((item) => item.id === "a1")!;
    const live = [a, a2, b, a1];
    const projection = getTaskTreeProjection(live, "a1", "a1", 0, 48);
    expect(projection).toMatchObject({ depth: 0, parentId: null });
  });

  it("commits move under a parent from live order without jump-back", () => {
    const projection = { depth: 1, maxDepth: 1, minDepth: 0, parentId: "a" };
    // Live visible order while dragging c onto a1 (a's children stay visible).
    const liveOrderedIds = ["a", "a1", "c", "a2", "b"];
    const placements = commitTaskTreeMove({
      tasks,
      expandedById: {},
      activeId: "c",
      overId: "a1",
      projected: projection,
      liveOrderedIds,
    });
    const c = placements.find((placement) => placement.id === "c");
    const a1 = placements.find((placement) => placement.id === "a1");
    const a2 = placements.find((placement) => placement.id === "a2");
    expect(c?.parentTaskId).toBe("a");
    expect(a1?.parentTaskId).toBe("a");
    expect(c!.sortOrder).toBeGreaterThan(a1!.sortOrder);
    expect(c!.sortOrder).toBeLessThan(a2!.sortOrder);
  });

  it("reinserts hidden active descendants after the active row on commit", () => {
    const projection = { depth: 0, maxDepth: 0, minDepth: 0, parentId: null };
    // While dragging parent `a`, children are hidden from the live list.
    const liveOrderedIds = ["b", "a", "c"];
    const placements = commitTaskTreeMove({
      tasks,
      expandedById: {},
      activeId: "a",
      overId: "b",
      projected: projection,
      liveOrderedIds,
    });
    const ordered = placements
      .filter((placement) => placement.parentTaskId === null)
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((placement) => placement.id);
    expect(ordered).toEqual(["b", "a", "c"]);
    expect(placements.find((placement) => placement.id === "a1")?.parentTaskId).toBe("a");
    expect(placements.find((placement) => placement.id === "a2")?.parentTaskId).toBe("a");
  });
});
