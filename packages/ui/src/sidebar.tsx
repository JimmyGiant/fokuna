"use client";

import { FokunaIcon, type IconName } from "@fokuna/icons";
import { useState, type HTMLAttributes, type ReactNode } from "react";

import {
  FokunaContextMenu,
  type FokunaContextMenuEntry,
} from "./context-menu";
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
  /** Tints the leading icon (e.g. colored tag glyph for labels). */
  iconColor?: string;
  badge?: ReactNode;
  /** Leading color dot — used for categories, not labels. */
  color?: string;
  /** Optional drop-target id used by the host app (e.g. dnd-kit). */
  droppableId?: string;
  /** Host-controlled drop highlight (data-drop-over). */
  dropOver?: boolean;
  /** Right-click actions (e.g. Bearbeiten / Löschen for categories & labels). */
  contextMenuItems?: FokunaContextMenuEntry[];
}

export interface SidebarSecondarySection {
  id: string;
  label: string;
  items: SidebarSecondaryItem[];
  onAdd?: () => void;
  onManage?: () => void;
}

export interface SidebarAvatarProps extends HTMLAttributes<HTMLSpanElement> {
  src?: string | null;
  alt?: string;
  fallbackLabel?: string;
}

/** Circular profile image with icon fallback when no photo is available. */
export function SidebarAvatar({
  src,
  alt = "Profil",
  fallbackLabel,
  className,
  ...props
}: SidebarAvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <span
      {...props}
      aria-hidden={showImage ? undefined : true}
      className={cn("fk-sidebar__avatar", className)}
      title={fallbackLabel ?? alt}
    >
      {showImage ? (
        // UI package stays framework-agnostic (no next/image).
        <img alt={alt} onError={() => setFailed(true)} src={src!} />
      ) : (
        <FokunaIcon name="user" size={16} stroke={1.5} />
      )}
    </span>
  );
}

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  items: SidebarItem[];
  footerItems?: SidebarItem[];
  activeId?: string;
  logo?: ReactNode;
  footer?: ReactNode;
  secondary?: ReactNode;
  secondaryTitle?: string;
  secondaryItems?: SidebarSecondaryItem[];
  secondarySections?: SidebarSecondarySection[];
  secondaryActiveId?: string;
  /** Optional ref callback for droppable hosts (id → element). */
  onSecondaryItemRef?: (itemId: string, node: HTMLElement | null) => void;
}

function SidebarRailItem({ item, activeId }: { item: SidebarItem; activeId?: string }) {
  return (
    <li>
      <a
        aria-current={item.id === activeId ? "page" : undefined}
        aria-disabled={item.disabled || undefined}
        className="fk-sidebar__item"
        href={item.disabled ? undefined : item.href}
      >
        <FokunaIcon name={item.icon} size={24} stroke={1.5} />
        <span className="fk-sr-only">{item.label}</span>
        <span aria-hidden="true" className="fk-sidebar__tooltip">
          {item.label}
        </span>
        {item.badge ? <span className="fk-sidebar__badge">{item.badge}</span> : null}
      </a>
    </li>
  );
}

export function SecondaryNavItem({
  item,
  activeId,
  itemRef,
}: {
  item: SidebarSecondaryItem;
  activeId?: string;
  itemRef?: (node: HTMLElement | null) => void;
}) {
  const isActive = item.id === activeId;

  const link = (
    <a
      aria-current={isActive ? "page" : undefined}
      data-drop-over={item.dropOver ? "true" : undefined}
      data-has-badge={item.badge ? "true" : undefined}
      href={item.href}
    >
      {item.color ? (
        <span
          aria-hidden="true"
          className="fk-sidebar__color"
          style={{ background: item.color }}
        />
      ) : item.icon ? (
        <FokunaIcon
          name={item.icon}
          size={16}
          stroke={1.5}
          style={item.iconColor ? { color: item.iconColor } : undefined}
        />
      ) : null}
      <span>{item.label}</span>
      {item.badge ? <small>{item.badge}</small> : null}
    </a>
  );

  return (
    <li ref={itemRef}>
      {item.contextMenuItems && item.contextMenuItems.length > 0 ? (
        <FokunaContextMenu items={item.contextMenuItems}>{link}</FokunaContextMenu>
      ) : (
        link
      )}
    </li>
  );
}

function SecondarySection({
  section,
  activeId,
  onItemRef,
}: {
  section: SidebarSecondarySection;
  activeId?: string;
  onItemRef?: (itemId: string, node: HTMLElement | null) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const showManage = Boolean(section.onManage);

  return (
    <section
      className="fk-sidebar__secondary-section"
      data-expanded={expanded || undefined}
      data-has-manage={showManage || undefined}
    >
      <header>
        <strong>{section.label}</strong>
        {showManage ? (
          <button
            aria-label={`${section.label} verwalten`}
            onClick={section.onManage}
            type="button"
          >
            <FokunaIcon name="edit" size={16} stroke={1.5} />
          </button>
        ) : null}
        <button
          aria-label={`${section.label} hinzufügen`}
          onClick={section.onAdd}
          type="button"
        >
          <FokunaIcon name="add-small" size={16} stroke={1.5} />
        </button>
        <button
          aria-expanded={expanded}
          aria-label={expanded ? `${section.label} einklappen` : `${section.label} ausklappen`}
          onClick={() => setExpanded((current) => !current)}
          type="button"
        >
          <FokunaIcon name={expanded ? "chevron-up" : "chevron-down"} size={16} stroke={1.5} />
        </button>
      </header>
      {expanded ? (
        <ul className="fk-sidebar__secondary-list">
          {section.items.map((item) => (
            <SecondaryNavItem
              activeId={activeId}
              item={item}
              itemRef={onItemRef ? (node) => onItemRef(item.id, node) : undefined}
              key={item.id}
            />
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function Sidebar({
  items,
  footerItems,
  activeId,
  logo,
  footer,
  secondary,
  secondaryTitle,
  secondaryItems,
  secondarySections,
  secondaryActiveId,
  onSecondaryItemRef,
  className,
  ...props
}: SidebarProps) {
  return (
    <nav {...props} aria-label="Hauptnavigation" className={cn("fk-sidebar", className)}>
      <div className="fk-sidebar__rail">
        {logo ? <div className="fk-sidebar__logo">{logo}</div> : null}
        <ul>
          {items.map((item) => (
            <SidebarRailItem activeId={activeId} item={item} key={item.id} />
          ))}
        </ul>
        {footerItems?.length || footer ? (
          <div className="fk-sidebar__footer">
            {footerItems?.length ? (
              <ul>
                {footerItems.map((item) => (
                  <SidebarRailItem activeId={activeId} item={item} key={item.id} />
                ))}
              </ul>
            ) : null}
            {footer}
          </div>
        ) : null}
      </div>
      {secondary || secondaryItems || secondarySections ? (
        <div className="fk-sidebar__secondary">
          {secondary ?? (
            <div className="fk-sidebar__secondary-stack">
              {secondaryTitle ? (
                <strong className="fk-sidebar__secondary-title">{secondaryTitle}</strong>
              ) : null}
              {secondaryItems?.length ? (
                <ul className="fk-sidebar__secondary-list fk-sidebar__secondary-list--nav">
                  {secondaryItems.map((item) => (
                    <SecondaryNavItem
                      activeId={secondaryActiveId}
                      item={item}
                      itemRef={
                        onSecondaryItemRef
                          ? (node) => onSecondaryItemRef(item.id, node)
                          : undefined
                      }
                      key={item.id}
                    />
                  ))}
                </ul>
              ) : null}
              {secondarySections?.map((section) => (
                <SecondarySection
                  activeId={secondaryActiveId}
                  key={section.id}
                  onItemRef={onSecondaryItemRef}
                  section={section}
                />
              ))}
            </div>
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
      <div className="fk-shell__content">{children}</div>
      {overlay}
    </div>
  );
}
