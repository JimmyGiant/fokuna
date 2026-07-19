"use client";

import { FokunaIcon, type IconName } from "@fokuna/icons";
import { DropdownMenu, Select } from "radix-ui";
import { useState, type ComponentPropsWithoutRef, type ReactNode } from "react";

import type { ControlSize } from "./button";
import { cn } from "./utils";

export interface DropdownOption {
  value: string;
  label: ReactNode;
  icon?: IconName;
  disabled?: boolean;
}

export interface DropdownProps extends ComponentPropsWithoutRef<typeof Select.Root> {
  options: DropdownOption[];
  placeholder?: string;
  controlSize?: ControlSize;
  keyLabel?: ReactNode;
  leadingIcon?: IconName;
  className?: string;
  "aria-label"?: string;
}

export function Dropdown({
  options,
  placeholder = "Auswählen",
  controlSize = "md",
  keyLabel,
  leadingIcon,
  className,
  defaultValue,
  onValueChange,
  value,
  ...props
}: DropdownProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selectedValue = value ?? internalValue;
  const selectedOption = options.find((option) => option.value === selectedValue);

  return (
    <Select.Root
      {...props}
      defaultValue={defaultValue}
      onValueChange={(nextValue) => {
        setInternalValue(nextValue);
        onValueChange?.(nextValue);
      }}
      value={value}
    >
      <Select.Trigger
        aria-label={props["aria-label"] ?? placeholder}
        className={cn("fk-dropdown__trigger", className)}
        data-size={controlSize}
      >
        <span className="fk-dropdown__value">
          {leadingIcon ? <FokunaIcon name={leadingIcon} /> : null}
          {keyLabel ? <span className="fk-dropdown__key">{keyLabel}</span> : null}
          <Select.Value placeholder={placeholder}>{selectedOption?.label}</Select.Value>
        </span>
        <Select.Icon className="fk-dropdown__chevron">
          <FokunaIcon name="chevron-down-small" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="fk-menu" position="popper" sideOffset={6}>
          <Select.Viewport>
            {options.map((option) => (
              <Select.Item
                className="fk-menu__item"
                disabled={option.disabled}
                key={option.value}
                value={option.value}
              >
                {option.icon ? <FokunaIcon name={option.icon} /> : null}
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className="fk-menu__indicator">
                  <FokunaIcon name="check-small" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

export interface MetaMenuItem {
  label: ReactNode;
  icon?: IconName;
  disabled?: boolean;
  destructive?: boolean;
  onSelect?: () => void;
}

export interface MetaMenuProps {
  items: MetaMenuItem[];
  label?: string;
  trigger?: ReactNode;
  controlSize?: ControlSize;
}

export function MetaMenu({
  items,
  label = "Weitere Aktionen",
  trigger,
  controlSize = "md",
}: MetaMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {trigger ?? (
          <button
            aria-label={label}
            className="fk-meta-trigger"
            data-size={controlSize}
            type="button"
          >
            <FokunaIcon name="more-vertical" />
          </button>
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="fk-menu" sideOffset={6}>
          {items.map((item, index) => (
            <DropdownMenu.Item
              className="fk-menu__item"
              data-destructive={item.destructive || undefined}
              disabled={item.disabled}
              key={`${String(item.label)}-${index}`}
              onSelect={item.onSelect}
            >
              {item.icon ? <FokunaIcon name={item.icon} /> : null}
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
