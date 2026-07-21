import { describe, expect, it } from "vitest";

import { applySortOrders, reorderIds } from "./reorder";

describe("reorder", () => {
  it("moves an item before another", () => {
    expect(reorderIds(["a", "b", "c"], "c", "a")).toEqual(["c", "a", "b"]);
  });

  it("moves an item to the end", () => {
    expect(reorderIds(["a", "b", "c"], "a", null)).toEqual(["b", "c", "a"]);
  });

  it("applies sort orders", () => {
    const items = [
      { id: "a", sortOrder: 0 },
      { id: "b", sortOrder: 1 },
    ];
    expect(applySortOrders(items, ["b", "a"]).map((item) => item.id)).toEqual(["b", "a"]);
  });
});
