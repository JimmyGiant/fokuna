import { FokunaIcon, type IconName } from "@fokuna/icons";
import type { ButtonHTMLAttributes, HTMLAttributes } from "react";

import { cn } from "./utils";

export type BlockTone = "coral" | "teal" | "blue" | "purple" | "pink" | "gold";
export type BlockRailState = "default" | "editable";

export interface BlockTileProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon?: IconName;
  tone?: BlockTone;
  badge?: number | string;
  empty?: boolean;
  selected?: boolean;
  label: string;
}

export function BlockTile({
  icon,
  tone = "teal",
  badge,
  empty = false,
  selected = false,
  label,
  className,
  disabled,
  type = "button",
  ...props
}: BlockTileProps) {
  const isDisabled = disabled || empty;

  return (
    <button
      {...props}
      aria-label={label}
      aria-pressed={empty ? undefined : selected}
      className={cn("fk-block-tile", className)}
      data-empty={empty || undefined}
      data-selected={selected || undefined}
      data-tone={tone}
      disabled={isDisabled}
      type={type}
    >
      {!empty && icon ? <FokunaIcon name={icon} radius={2} size={24} stroke={2} /> : null}
      {!empty && badge !== undefined ? (
        <span aria-label={`${badge} offene Einträge`} className="fk-block-tile__badge">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

export interface BlockRailItem {
  id: string;
  label: string;
  icon: IconName;
  tone: BlockTone;
  badge?: number | string;
}

export interface BlockRailProps extends Omit<HTMLAttributes<HTMLElement>, "onSelect"> {
  items: BlockRailItem[];
  state?: BlockRailState;
  activeId?: string;
  emptySlots?: number;
  onActiveChange?: (id: string) => void;
  onEdit?: () => void;
}

export function BlockRail({
  items,
  state = "default",
  activeId,
  emptySlots = 6,
  onActiveChange,
  onEdit,
  className,
  ...props
}: BlockRailProps) {
  const editable = state === "editable";

  return (
    <nav
      {...props}
      aria-label={editable ? "Zeitblöcke bearbeiten" : "Zeitblöcke"}
      className={cn("fk-block-rail", className)}
      data-state={state}
    >
      <ul className="fk-block-rail__items">
        {items.map((item) => (
          <li key={item.id}>
            <BlockTile
              badge={item.badge}
              icon={item.icon}
              label={item.label}
              onClick={() => onActiveChange?.(item.id)}
              selected={item.id === activeId}
              tone={item.tone}
            />
          </li>
        ))}
        {editable
          ? Array.from({ length: emptySlots }, (_, index) => (
              <li key={`empty-${index}`}>
                <BlockTile empty label={`Freier Zeitblock-Slot ${index + 1}`} />
              </li>
            ))
          : null}
      </ul>
      {!editable ? (
        <button
          aria-label="Zeitblöcke bearbeiten"
          className="fk-block-rail__edit"
          onClick={onEdit}
          type="button"
        >
          <FokunaIcon name="edit" radius={2} size={16} stroke={2} />
        </button>
      ) : null}
    </nav>
  );
}
