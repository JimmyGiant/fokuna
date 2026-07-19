import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./utils";

export interface PageHeaderProps extends HTMLAttributes<HTMLElement> {
  variant?: "content" | "calendar";
  title: string;
  subtitle?: string;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  controls?: ReactNode;
  center?: ReactNode;
}

export function PageHeader({
  title,
  variant = "content",
  subtitle,
  breadcrumb,
  actions,
  controls,
  center,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header {...props} className={cn("fk-page-header", className)} data-variant={variant}>
      <div className="fk-page-header__main">
        {breadcrumb}
        <div>
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      {center ? <div className="fk-page-header__center">{center}</div> : null}
      {actions ? <div className="fk-page-header__actions">{actions}</div> : null}
      {controls ? <div className="fk-page-header__controls">{controls}</div> : null}
    </header>
  );
}

export interface FilterBarProps extends HTMLAttributes<HTMLDivElement> {
  search?: ReactNode;
  filters?: ReactNode;
  sort?: ReactNode;
  viewSwitcher?: ReactNode;
  clearAction?: ReactNode;
}

export function FilterBar({
  search,
  filters,
  sort,
  viewSwitcher,
  clearAction,
  className,
  ...props
}: FilterBarProps) {
  return (
    <div {...props} className={cn("fk-filter-bar", className)} role="search">
      {filters ? <div className="fk-filter-bar__filters">{filters}</div> : null}
      <span className="fk-filter-bar__spacer" />
      {sort}
      {search}
      {viewSwitcher}
      {clearAction}
    </div>
  );
}
