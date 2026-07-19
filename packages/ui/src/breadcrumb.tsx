import { FokunaIcon } from "@fokuna/icons";
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";

import { cn } from "./utils";

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
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
          return (
            <li key={`${String(item.label)}-${index}`}>
              {index > 0 ? <FokunaIcon aria-hidden="true" name="chevron-right-small" /> : null}
              {item.href && !current ? (
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
