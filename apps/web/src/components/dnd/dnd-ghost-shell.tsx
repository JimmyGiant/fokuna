import type { ReactNode } from "react";

import styles from "./dnd-ghost-shell.module.css";

type DnDGhostShellProps = {
  children: ReactNode;
  /** `default` = list/card ghost with drop-shadow; `compact` = no rotation (subtasks later). */
  variant?: "default" | "compact";
  className?: string;
};

export function DnDGhostShell({
  children,
  variant = "default",
  className,
}: DnDGhostShellProps) {
  return (
    <div
      className={[styles.shell, styles[`shell_${variant}`], className].filter(Boolean).join(" ")}
      data-dnd-ghost=""
      data-variant={variant}
    >
      {children}
    </div>
  );
}
