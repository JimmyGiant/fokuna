"use client";

import { FokunaIcon, type IconName } from "@fokuna/icons";
import { Tabs, ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import {
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import type { ControlSize } from "./button";
import { cn } from "./utils";

export interface TabItem {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: IconName;
}

export interface TabBarProps extends ComponentPropsWithoutRef<typeof Tabs.Root> {
  items: TabItem[];
  size?: ControlSize;
  "aria-label"?: string;
}

export function TabBar({
  items,
  size = "md",
  className,
  children,
  value,
  defaultValue,
  onValueChange,
  ...props
}: TabBarProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? items[0]?.value);
  const activeValue = value ?? internalValue;
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>());
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const list = listRef.current;
    const activeTrigger = activeValue ? triggerRefs.current.get(activeValue) : undefined;
    if (!list || !activeTrigger) return;

    const updateIndicator = () => {
      setIndicator({ left: activeTrigger.offsetLeft, width: activeTrigger.offsetWidth });
    };
    updateIndicator();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(updateIndicator);
    observer.observe(list);
    observer.observe(activeTrigger);
    return () => observer.disconnect();
  }, [activeValue, items]);

  return (
    <Tabs.Root
      {...props}
      className={cn("fk-tabs", className)}
      data-size={size}
      value={activeValue}
      onValueChange={(nextValue) => {
        setInternalValue(nextValue);
        onValueChange?.(nextValue);
      }}
    >
      <Tabs.List aria-label={props["aria-label"]} className="fk-tabs__list" ref={listRef}>
        {items.map((item) => (
          <Tabs.Trigger
            className="fk-tabs__trigger"
            disabled={item.disabled}
            key={item.value}
            ref={(node) => {
              if (node) triggerRefs.current.set(item.value, node);
              else triggerRefs.current.delete(item.value);
            }}
            value={item.value}
          >
            {item.icon ? <FokunaIcon name={item.icon} /> : null}
            {item.label}
          </Tabs.Trigger>
        ))}
        <span
          aria-hidden="true"
          className="fk-tabs__indicator"
          style={{ left: indicator.left, width: indicator.width } as CSSProperties}
        />
      </Tabs.List>
      {children}
    </Tabs.Root>
  );
}

export const TabContent = Tabs.Content;

type ToggleGroupSingleProps = Extract<
  ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>,
  { type: "single" }
>;

export interface ToggleGroupProps extends Omit<ToggleGroupSingleProps, "type"> {
  items: TabItem[];
  size?: ControlSize;
}

export function ToggleGroup({ items, size = "md", className, ...props }: ToggleGroupProps) {
  const iconSize = size === "xl" ? 24 : 16;

  return (
    <ToggleGroupPrimitive.Root
      {...props}
      className={cn("fk-toggle-group", className)}
      data-size={size}
      type="single"
    >
      {items.map((item) => (
        <ToggleGroupPrimitive.Item
          className="fk-toggle-group__item"
          disabled={item.disabled}
          key={item.value}
          value={item.value}
        >
          {item.icon ? <FokunaIcon name={item.icon} size={iconSize} /> : null}
          {item.label}
        </ToggleGroupPrimitive.Item>
      ))}
    </ToggleGroupPrimitive.Root>
  );
}

export interface SwitcherProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  size?: ControlSize;
  value: string;
  onPrevious?: () => void;
  onNext?: () => void;
  previousLabel?: string;
  nextLabel?: string;
}

export function Switcher({
  size = "md",
  value,
  onPrevious,
  onNext,
  previousLabel = "Vorheriger Zeitraum",
  nextLabel = "Nächster Zeitraum",
  className,
  ...props
}: SwitcherProps) {
  const iconSize = 24;
  return (
    <div {...props} className={cn("fk-switcher", className)} data-size={size}>
      <button aria-label={previousLabel} onClick={onPrevious} type="button">
        <FokunaIcon name="chevron-left-small" size={iconSize} />
      </button>
      <span>{value}</span>
      <button aria-label={nextLabel} onClick={onNext} type="button">
        <FokunaIcon name="chevron-right-small" size={iconSize} />
      </button>
    </div>
  );
}

export interface TabSelectItem extends TabItem {
  description?: ReactNode;
}

export interface TabSelectProps extends Omit<ToggleGroupSingleProps, "type"> {
  addItem?: {
    label?: string;
    onClick?: () => void;
  };
  items: TabSelectItem[];
  size?: ControlSize;
}

export function TabSelect({ addItem, items, size = "md", className, ...props }: TabSelectProps) {
  const iconSize = size === "xl" ? 24 : 16;

  return (
    <ToggleGroupPrimitive.Root
      {...props}
      className={cn("fk-tab-select", className)}
      data-size={size}
      type="single"
    >
      {items.map((item) => (
        <ToggleGroupPrimitive.Item
          className="fk-tab-select__item"
          disabled={item.disabled}
          key={item.value}
          value={item.value}
        >
          {item.icon ? <FokunaIcon name={item.icon} size={iconSize} /> : null}
          <span>{item.label}</span>
        </ToggleGroupPrimitive.Item>
      ))}
      {addItem ? (
        <button
          aria-label={addItem.label ?? "Option hinzufügen"}
          className="fk-tab-select__add"
          onClick={addItem.onClick}
          type="button"
        >
          <FokunaIcon name="add-small" size={size === "sm" ? 16 : 24} />
        </button>
      ) : null}
    </ToggleGroupPrimitive.Root>
  );
}
