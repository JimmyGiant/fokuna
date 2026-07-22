import { CSS as DndCSS, type Transform } from "@dnd-kit/utilities";
import type { CSSProperties } from "react";

export type SortableItemStyleInput = {
  transform: Transform | null;
  transition: string | undefined;
  /**
   * When true, suppress dnd-kit transform.
   * Task list uses live DOM reorder (arrayMove) — transforms must stay off
   * so siblings never slide over the placeholder slot.
   */
  layoutControlled?: boolean;
};

/**
 * Sortable item positioning styles.
 * No transform transitions — nested task DnD prefers instant slot moves.
 */
export function sortableItemStyle({
  transform,
  transition,
  layoutControlled = false,
}: SortableItemStyleInput): CSSProperties {
  if (layoutControlled) {
    return { transform: "none", transition: undefined };
  }

  return {
    transform: transform ? DndCSS.Translate.toString(transform) : undefined,
    // Prefer caller-provided transition; never invent a slide animation.
    transition: transition || undefined,
  };
}
