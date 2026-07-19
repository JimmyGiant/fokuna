import { FokunaIcon, type IconName } from "@fokuna/icons";
import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./utils";

export interface SidebarItem {
  id: string;
  label: string;
  href?: string;
  icon: IconName;
  badge?: ReactNode;
  disabled?: boolean;
}

export interface SidebarSecondaryItem {
  id: string;
  label: string;
  href?: string;
  icon?: IconName;
  badge?: ReactNode;
}

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  items: SidebarItem[];
  activeId?: string;
  logo?: ReactNode;
  footer?: ReactNode;
  secondary?: ReactNode;
  secondaryTitle?: string;
  secondaryItems?: SidebarSecondaryItem[];
  secondaryActiveId?: string;
}

export function Sidebar({
  items,
  activeId,
  logo,
  footer,
  secondary,
  secondaryTitle,
  secondaryItems,
  secondaryActiveId,
  className,
  ...props
}: SidebarProps) {
  return (
    <nav {...props} aria-label="Hauptnavigation" className={cn("fk-sidebar", className)}>
      <div className="fk-sidebar__rail">
        {logo ? <div className="fk-sidebar__logo">{logo}</div> : null}
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <a
                aria-current={item.id === activeId ? "page" : undefined}
                aria-disabled={item.disabled || undefined}
                className="fk-sidebar__item"
                href={item.disabled ? undefined : item.href}
                title={item.label}
              >
                <FokunaIcon name={item.icon} />
                <span className="fk-sr-only">{item.label}</span>
                {item.badge ? <span className="fk-sidebar__badge">{item.badge}</span> : null}
              </a>
            </li>
          ))}
        </ul>
        {footer ? <div className="fk-sidebar__footer">{footer}</div> : null}
      </div>
      {secondary || secondaryItems ? (
        <div className="fk-sidebar__secondary">
          {secondary ?? (
            <>
              {secondaryTitle ? (
                <strong className="fk-sidebar__secondary-title">{secondaryTitle}</strong>
              ) : null}
              <ul className="fk-sidebar__secondary-list">
                {secondaryItems?.map((item) => (
                  <li key={item.id}>
                    <a
                      aria-current={item.id === secondaryActiveId ? "page" : undefined}
                      href={item.href}
                    >
                      {item.icon ? <FokunaIcon name={item.icon} /> : null}
                      <span>{item.label}</span>
                      {item.badge ? <small>{item.badge}</small> : null}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ) : null}
    </nav>
  );
}

export interface UiShellProps extends HTMLAttributes<HTMLDivElement> {
  sidebar: ReactNode;
  overlay?: ReactNode;
}

export function UiShell({ sidebar, overlay, className, children, ...props }: UiShellProps) {
  return (
    <div {...props} className={cn("fk-shell", className)}>
      {sidebar}
      <main className="fk-shell__content">{children}</main>
      {overlay}
    </div>
  );
}
