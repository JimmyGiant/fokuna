import { FokunaIcon } from "@fokuna/icons";
import type { HTMLAttributes } from "react";

import { cn } from "./utils";

/** Priority levels shown as filled meta pills (excludes `none`). */
export type TagItemPriorityLevel = "urgent" | "high" | "medium" | "low";

const PRIORITY_LABELS: Record<TagItemPriorityLevel, string> = {
  urgent: "Wichtig",
  high: "Hoch",
  medium: "Medium",
  low: "Niedrig",
};

export interface TagItemPriorityProps extends HTMLAttributes<HTMLSpanElement> {
  priority: TagItemPriorityLevel;
}

/**
 * Icon-only priority marker for Task List Item meta — colored circle + flag.
 * Not a general-purpose Tag; lives in the task meta row only.
 */
export function TagItemPriority({ priority, className, ...props }: TagItemPriorityProps) {
  return (
    <span
      {...props}
      aria-label={PRIORITY_LABELS[priority]}
      className={cn("fk-tag-item-priority", className)}
      data-priority={priority}
      title={PRIORITY_LABELS[priority]}
    >
      <FokunaIcon aria-hidden fill="off" name="flag" size={16} stroke={1} />
    </span>
  );
}

export function isTagItemPriorityLevel(
  value: string | null | undefined,
): value is TagItemPriorityLevel {
  return value === "urgent" || value === "high" || value === "medium" || value === "low";
}
