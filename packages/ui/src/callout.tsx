import { FokunaIcon, type IconName } from "@fokuna/icons";
import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./utils";

export type CalloutTone = "default" | "info" | "warning" | "error";
export type CalloutType = "line" | "icon";

export interface CalloutProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CalloutTone;
  type?: CalloutType;
  title?: string;
  icon?: ReactNode | IconName | false;
}

const defaultIcons: Record<CalloutTone, IconName> = {
  default: "info-circle",
  info: "info-circle",
  warning: "clock-alert",
  error: "ban-circle",
};

export function Callout({
  tone = "default",
  type = "line",
  title,
  icon,
  className,
  children,
  ...props
}: CalloutProps) {
  const resolvedIcon = type === "icon" ? (icon === undefined ? defaultIcons[tone] : icon) : false;

  return (
    <div
      {...props}
      className={cn("fk-callout", className)}
      data-tone={tone}
      data-type={type}
      role="note"
    >
      {resolvedIcon ? (
        <span aria-hidden="true" className="fk-callout__icon">
          {typeof resolvedIcon === "string" ? (
            <FokunaIcon name={resolvedIcon as IconName} stroke={2} />
          ) : (
            resolvedIcon
          )}
        </span>
      ) : null}
      <span className="fk-callout__content">
        {title ? <strong className="fk-callout__title">{title}</strong> : null}
        <span className="fk-callout__body">{children}</span>
      </span>
    </div>
  );
}
