"use client";

import { FokunaIcon, type IconName } from "@fokuna/icons";
import { ContextMenu } from "radix-ui";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import { cn } from "./utils";

export type FokunaContextMenuItem = {
  type?: "item";
  label: ReactNode;
  icon?: IconName;
  /** Custom leading content (e.g. colored priority flags). Overrides `icon`. */
  leading?: ReactNode;
  disabled?: boolean;
  destructive?: boolean;
  checked?: boolean;
  onSelect?: () => void;
};

export type FokunaContextMenuSeparator = {
  type: "separator";
};

export type FokunaContextMenuSubmenu = {
  type: "submenu";
  label: ReactNode;
  icon?: IconName;
  leading?: ReactNode;
  disabled?: boolean;
  /** Flat menu items (default submenu). */
  children?: FokunaContextMenuEntry[];
  /** Custom panel content (e.g. DatePicker) instead of flat items. */
  content?: ReactNode;
  /** Wider submenu shell for embedded panels. */
  panel?: boolean;
};

export type FokunaContextMenuEntry =
  | FokunaContextMenuItem
  | FokunaContextMenuSeparator
  | FokunaContextMenuSubmenu;

export interface FokunaContextMenuProps {
  items: FokunaContextMenuEntry[];
  children: ReactNode;
  className?: string;
}

const ContextMenuCloseContext = createContext<(() => void) | null>(null);

/** Close the open context menu from embedded panel content. */
export function useFokunaContextMenuClose() {
  return useContext(ContextMenuCloseContext);
}

function entryLeading(entry: { icon?: IconName; leading?: ReactNode }) {
  if (entry.leading) return entry.leading;
  if (entry.icon) return <FokunaIcon name={entry.icon} size={16} stroke={1.5} />;
  return null;
}

function renderEntries(entries: FokunaContextMenuEntry[]) {
  return entries.map((entry, index) => {
    if (entry.type === "separator") {
      return <ContextMenu.Separator className="fk-menu__separator" key={`sep-${index}`} />;
    }

    if (entry.type === "submenu") {
      return (
        <ContextMenu.Sub key={`sub-${String(entry.label)}-${index}`}>
          <ContextMenu.SubTrigger
            className="fk-menu__item fk-menu__sub-trigger"
            disabled={entry.disabled}
          >
            {entryLeading(entry)}
            <span className="fk-menu__label">{entry.label}</span>
            <FokunaIcon name="chevron-right-small" size={16} stroke={1.5} />
          </ContextMenu.SubTrigger>
          <ContextMenu.Portal>
            <ContextMenu.SubContent
              className={cn(
                "fk-menu fk-menu--submenu",
                entry.panel && "fk-menu--submenu-panel",
              )}
              sideOffset={4}
            >
              {entry.content ? (
                <div
                  className="fk-menu__panel"
                  onKeyDown={(event) => event.stopPropagation()}
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  {entry.content}
                </div>
              ) : (
                renderEntries(entry.children ?? [])
              )}
            </ContextMenu.SubContent>
          </ContextMenu.Portal>
        </ContextMenu.Sub>
      );
    }

    return (
      <ContextMenu.Item
        className="fk-menu__item"
        data-destructive={entry.destructive || undefined}
        disabled={entry.disabled}
        key={`item-${String(entry.label)}-${index}`}
        onSelect={() => entry.onSelect?.()}
      >
        {entryLeading(entry)}
        <span className="fk-menu__label">{entry.label}</span>
        {entry.checked ? (
          <span className="fk-menu__indicator">
            <FokunaIcon name="check-small" size={16} stroke={2} />
          </span>
        ) : null}
      </ContextMenu.Item>
    );
  });
}

export function FokunaContextMenu({ items, children, className }: FokunaContextMenuProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  if (items.length === 0) {
    return children;
  }

  return (
    <ContextMenuCloseContext.Provider value={close}>
      <ContextMenu.Root onOpenChange={setOpen} open={open}>
        <ContextMenu.Trigger asChild className={cn(className)}>
          {children}
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content className="fk-menu fk-menu--context">
            {renderEntries(items)}
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
    </ContextMenuCloseContext.Provider>
  );
}
