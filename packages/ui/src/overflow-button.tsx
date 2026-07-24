"use client";

import { FokunaIcon } from "@fokuna/icons";
import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "./utils";

export interface OverflowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * `true` when list-native defaults (filters/settings) have been changed.
   * Shows the brand indicator badge (Figma `type=active`).
   */
  active?: boolean;
}

/**
 * Compact list overflow control (Figma `button-overflow`: 24×24).
 * Use as MetaMenu/Dropdown trigger next to a list title.
 */
export const OverflowButton = forwardRef<HTMLButtonElement, OverflowButtonProps>(
  function OverflowButton(
    { active = false, className, type = "button", children = "Listenoptionen", ...props },
    ref,
  ) {
    return (
      <button
        {...props}
        aria-label={props["aria-label"] ?? (typeof children === "string" ? children : "Listenoptionen")}
        className={cn("fk-overflow-button", className)}
        data-active={active || undefined}
        ref={ref}
        type={type}
      >
        <FokunaIcon name="more-horizontal" size={16} stroke={2} />
        {active ? <span aria-hidden="true" className="fk-overflow-button__badge" /> : null}
        <span className="fk-sr-only">
          {typeof children === "string" ? children : "Listenoptionen"}
        </span>
      </button>
    );
  },
);
