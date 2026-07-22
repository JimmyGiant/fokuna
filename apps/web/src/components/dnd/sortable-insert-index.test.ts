import { describe, expect, it } from "vitest";

import { resolveSortableInsertIndex } from "./sortable-insert-index";

const overRect = { top: 100, height: 40 }; // mid = 120

describe("resolveSortableInsertIndex", () => {
  it("places after over when drag center is below midpoint (dragging down)", () => {
    expect(
      resolveSortableInsertIndex({
        activeIndex: 0,
        overIndex: 2,
        dragCenterY: 140,
        overRect,
        lastInsertIndex: null,
        hysteresisPx: 10,
      }),
    ).toBe(2);
  });

  it("places before over when drag center is above midpoint (dragging down)", () => {
    expect(
      resolveSortableInsertIndex({
        activeIndex: 0,
        overIndex: 2,
        dragCenterY: 105,
        overRect,
        lastInsertIndex: null,
        hysteresisPx: 10,
      }),
    ).toBe(1);
  });

  it("holds decision inside the hysteresis band", () => {
    // Previously placed after over (index 2 while dragging down onto overIndex 2).
    expect(
      resolveSortableInsertIndex({
        activeIndex: 0,
        overIndex: 2,
        dragCenterY: 120, // exactly mid — dead zone
        overRect,
        lastInsertIndex: 2,
        hysteresisPx: 10,
      }),
    ).toBe(2);

    expect(
      resolveSortableInsertIndex({
        activeIndex: 0,
        overIndex: 2,
        dragCenterY: 120,
        overRect,
        lastInsertIndex: 1,
        hysteresisPx: 10,
      }),
    ).toBe(1);
  });

  it("places correctly when dragging up", () => {
    expect(
      resolveSortableInsertIndex({
        activeIndex: 3,
        overIndex: 1,
        dragCenterY: 105,
        overRect,
        lastInsertIndex: null,
        hysteresisPx: 10,
      }),
    ).toBe(1);

    expect(
      resolveSortableInsertIndex({
        activeIndex: 3,
        overIndex: 1,
        dragCenterY: 140,
        overRect,
        lastInsertIndex: null,
        hysteresisPx: 10,
      }),
    ).toBe(2);
  });
});
