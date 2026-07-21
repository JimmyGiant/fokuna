"use client";

import { FokunaIcon } from "@fokuna/icons";
import { Popover } from "radix-ui";
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";

import { cn } from "./utils";

export interface BreadcrumbMenuItem {
  label: ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
  onClick?: () => void;
  menuItems?: BreadcrumbMenuItem[];
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
}

/**
 * Keeps breadcrumbs single-line whenever possible.
 * From 3 segments onward: `first › … › current` (Pattern Library collapsed variant).
 * Intermediate parents live in the ellipsis menu.
 */
export function collapseBreadcrumbItems(items: BreadcrumbItem[]): BreadcrumbItem[] {
  if (items.length <= 2) {
    return items;
  }

  const first = items[0]!;
  const current = items[items.length - 1]!;
  const middle = items.slice(1, -1);

  return [
    first,
    {
      label: "…",
      menuItems: middle.map((item) => ({
        label: item.label,
        href: item.href,
        onClick: item.onClick,
      })),
    },
    current,
  ];
}

function BreadcrumbLeaf({
  item,
  current,
}: {
  item: BreadcrumbItem;
  current: boolean;
}) {
  if (current) {
    return <span aria-current="page">{item.label}</span>;
  }

  if (item.onClick) {
    return (
      <button onClick={item.onClick} type="button">
        {item.label}
      </button>
    );
  }

  if (item.href) {
    return <a href={item.href}>{item.label}</a>;
  }

  return <span>{item.label}</span>;
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
                        menuItem.onClick ? (
                          <button
                            key={`${String(menuItem.label)}-${menuIndex}`}
                            onClick={menuItem.onClick}
                            type="button"
                          >
                            {menuItem.label}
                          </button>
                        ) : menuItem.href ? (
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
              ) : (
                <BreadcrumbLeaf current={current} item={item} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export type BreadcrumbLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;
