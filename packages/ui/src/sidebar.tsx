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
  color?: string;
}

export interface SidebarSecondarySection {
  id: string;
  label: string;
  items: SidebarSecondaryItem[];
}

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  items: SidebarItem[];
  activeId?: string;
  logo?: ReactNode;
  footer?: ReactNode;
  secondary?: ReactNode;
  secondaryTitle?: string;
  secondaryItems?: SidebarSecondaryItem[];
  secondarySections?: SidebarSecondarySection[];
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
  secondarySections,
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
              >
                <FokunaIcon name={item.icon} size={24} stroke={2} />
                <span className="fk-sr-only">{item.label}</span>
                <span aria-hidden="true" className="fk-sidebar__tooltip">
                  {item.label}
                </span>
                {item.badge ? <span className="fk-sidebar__badge">{item.badge}</span> : null}
              </a>
            </li>
          ))}
        </ul>
        {footer ? <div className="fk-sidebar__footer">{footer}</div> : null}
      </div>
      {secondary || secondaryItems || secondarySections ? (
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
                      {item.icon ? <FokunaIcon name={item.icon} size={16} stroke={1.5} /> : null}
                      <span>{item.label}</span>
                      {item.badge ? <small>{item.badge}</small> : null}
                    </a>
                  </li>
                ))}
              </ul>
              {secondarySections?.map((section) => (
                <section className="fk-sidebar__secondary-section" key={section.id}>
                  <header>
                    <strong>{section.label}</strong>
                    <span>
                      <button aria-label={`${section.label} hinzufügen`} type="button">
                        <FokunaIcon name="add-small" />
                      </button>
                      <button aria-label={`${section.label} einklappen`} type="button">
                        <FokunaIcon name="chevron-up-small" />
                      </button>
                    </span>
                  </header>
                  <ul className="fk-sidebar__secondary-list">
                    {section.items.map((item) => (
                      <li key={item.id}>
                        <a href={item.href}>
                          {item.color ? (
                            <span
                              aria-hidden="true"
                              className="fk-sidebar__color"
                              style={{ background: item.color }}
                            />
                          ) : item.icon ? (
                            <FokunaIcon name={item.icon} size={16} stroke={1.5} />
                          ) : null}
                          <span>{item.label}</span>
                          {item.badge ? <small>{item.badge}</small> : null}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
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
