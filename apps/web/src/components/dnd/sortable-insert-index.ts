/** Schmitt-trigger band around the over-item midpoint (MVP §4.5). */
export const INSERT_HYSTERESIS_PX = 12;

export type OverRect = {
  top: number;
  height: number;
};

/**
 * Resolve the `arrayMove` target index for a vertical sortable list.
 * Uses the drag-center vs over-item midpoint, with hysteresis so slow
 * wiggles across one row don't flip-flop before/after.
 */
export function resolveSortableInsertIndex(input: {
  activeIndex: number;
  overIndex: number;
  dragCenterY: number;
  overRect: OverRect;
  /** Last committed insert index (for hysteresis). */
  lastInsertIndex: number | null;
  hysteresisPx?: number;
}): number {
  const {
    activeIndex,
    overIndex,
    dragCenterY,
    overRect,
    lastInsertIndex,
    hysteresisPx = INSERT_HYSTERESIS_PX,
  } = input;

  if (activeIndex < 0 || overIndex < 0) return activeIndex;
  if (activeIndex === overIndex) return activeIndex;

  const mid = overRect.top + overRect.height / 2;
  const upper = mid - hysteresisPx;
  const lower = mid + hysteresisPx;

  let placeAfter: boolean;
  if (dragCenterY < upper) {
    placeAfter = false;
  } else if (dragCenterY > lower) {
    placeAfter = true;
  } else if (lastInsertIndex != null) {
    // Dead zone: keep the previous before/after decision relative to this over.
    if (activeIndex < overIndex) {
      placeAfter = lastInsertIndex >= overIndex;
    } else {
      placeAfter = lastInsertIndex > overIndex;
    }
  } else {
    placeAfter = dragCenterY > mid;
  }

  if (activeIndex < overIndex) {
    return placeAfter ? overIndex : Math.max(0, overIndex - 1);
  }
  return placeAfter ? overIndex + 1 : overIndex;
}
