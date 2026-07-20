import { FokunaIcon, type IconName } from "@fokuna/icons";
import type { HTMLAttributes, ReactNode } from "react";

import type { ControlSize } from "./button";
import { cn } from "./utils";

export type TagTone = "neutral" | "coral" | "teal" | "blue" | "purple" | "pink" | "gold";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: TagTone;
  size?: ControlSize;
  icon?: IconName | ReactNode;
  removable?: boolean;
  onRemove?: () => void;
}

export function Tag({
  tone = "neutral",
  size = "sm",
  icon,
  removable,
  onRemove,
  className,
  children,
  ...props
}: TagProps) {
  return (
    <span {...props} className={cn("fk-tag", className)} data-size={size} data-tone={tone}>
      {icon ? (
        <span aria-hidden="true" className="fk-tag__icon">
          {typeof icon === "string" ? <FokunaIcon name={icon as IconName} /> : icon}
        </span>
      ) : null}
      <span>{children}</span>
      {removable ? (
        <button aria-label={`${String(children)} entfernen`} onClick={onRemove} type="button">
          <FokunaIcon className="fk-tag__remove-icon" name="close" />
        </button>
      ) : null}
    </span>
  );
}
