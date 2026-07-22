import { CSS as DndCSS, type Transform } from "@dnd-kit/utilities";
import type { CSSProperties } from "react";

/** Keep sibling slides visible even when live arrayMove fires frequently. */
const SORTABLE_TRANSITION = "transform 220ms cubic-bezier(0.25, 1, 0.5, 1)";

export type SortableItemStyleInput = {
  transform: Transform | null;
  transition: string | undefined;
  /** When true, suppress transform so the list placeholder owns the slot. */
  layoutControlled?: boolean;
};

export function sortableItemStyle({
  transform,
  transition,
  layoutControlled = false,
}: SortableItemStyleInput): CSSProperties {
  if (layoutControlled) {
    return { transform: undefined, transition: undefined };
  }

  return {
    transform: transform ? DndCSS.Translate.toString(transform) : undefined,
    transition: transition ?? SORTABLE_TRANSITION,
  };
}
