"use client";

import { FokunaIcon } from "@fokuna/icons";
import { Popover } from "radix-ui";
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";

import { cn } from "./utils";

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
  menuItems?: Array<{ label: ReactNode; href?: string }>;
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items, className, ...props }: BreadcrumbProps) {
  return (
    <nav {...props} aria-label="Breadcrumb" className={cn("fk-breadcrumb", className)}>
      <ol>
        {items.map((item, index) => {
          const current = index === items.length - 1;
          const collapsed = Boolean(item.menuItems?.length);
          return (
            <li key={`${String(item.label)}-${index}`}>
              {index > 0 ? <FokunaIcon aria-hidden="true" name="chevron-right-small" /> : null}
              {collapsed ? (
                <Popover.Root>
                  <Popover.Trigger asChild>
                    <button
                      aria-label="Ausgeblendete Ebenen anzeigen"
                      className="fk-breadcrumb__collapsed"
                      type="button"
                    >
                      <FokunaIcon name="more-horizontal" stroke={2} />
                    </button>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content
                      align="start"
                      className="fk-breadcrumb__popover"
                      sideOffset={6}
                    >
                      {item.menuItems?.map((menuItem, menuIndex) =>
                        menuItem.href ? (
                          <a href={menuItem.href} key={`${String(menuItem.label)}-${menuIndex}`}>
                            {menuItem.label}
                          </a>
                        ) : (
                          <button key={`${String(menuItem.label)}-${menuIndex}`} type="button">
                            {menuItem.label}
                          </button>
                        ),
                      )}
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              ) : item.href && !current ? (
                <a href={item.href}>{item.label}</a>
              ) : (
                <span aria-current={current ? "page" : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export type BreadcrumbLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;
