"use client";

import { FokunaIcon, type IconName } from "@fokuna/icons";
import { DropdownMenu, Select } from "radix-ui";
import { useState, type ComponentPropsWithoutRef, type ReactNode } from "react";

import type { ControlSize } from "./button";
import { cn } from "./utils";

export type DropdownAppearance = "button" | "text";
export type DropdownType = "single" | "key-value" | "icon";

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
  /** Figma `form`: bordered button vs borderless text trigger. */
  appearance?: DropdownAppearance;
  keyLabel?: ReactNode;
  leadingIcon?: IconName;
  className?: string;
  "aria-label"?: string;
}

function resolveDropdownType(keyLabel?: ReactNode, leadingIcon?: IconName): DropdownType {
  if (leadingIcon) return "icon";
  if (keyLabel) return "key-value";
  return "single";
}

function leadingIconSize(controlSize: ControlSize): 16 | 24 {
  return controlSize === "lg" || controlSize === "xl" ? 24 : 16;
}

export function Dropdown({
  options,
  placeholder = "Auswählen",
  controlSize = "md",
  appearance = "button",
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
  const dropdownType = resolveDropdownType(keyLabel, leadingIcon);
  // Unmatched controlled values (e.g. custom estimate minutes) must not blank the
  // trigger — Radix hides the placeholder whenever `value` is set.
  const selectValue =
    value === undefined ? undefined : selectedOption ? value : "";

  return (
    <Select.Root
      {...props}
      defaultValue={defaultValue}
      onValueChange={(nextValue) => {
        setInternalValue(nextValue);
        onValueChange?.(nextValue);
      }}
      value={selectValue}
    >
      <Select.Trigger
        aria-label={props["aria-label"] ?? placeholder}
        className={cn("fk-dropdown__trigger", className)}
        data-appearance={appearance}
        data-size={controlSize}
        data-type={dropdownType}
      >
        <span className="fk-dropdown__value">
          {leadingIcon ? (
            <span className="fk-dropdown__leading">
              <FokunaIcon name={leadingIcon} size={leadingIconSize(controlSize)} stroke={2} />
            </span>
          ) : null}
          {keyLabel ? <span className="fk-dropdown__key">{keyLabel}</span> : null}
          {selectedOption ? (
            <Select.Value>{selectedOption.label}</Select.Value>
          ) : (
            <Select.Value placeholder={placeholder} />
          )}
        </span>
        <Select.Icon className="fk-dropdown__chevron">
          <FokunaIcon name="chevron-down-small" size={16} stroke={1.5} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="fk-menu fk-menu--select" position="popper" sideOffset={6}>
          <Select.Viewport>
            {options.map((option) => (
              <Select.Item
                className="fk-menu__item"
                disabled={option.disabled}
                key={option.value}
                value={option.value}
              >
                {option.icon ? <FokunaIcon name={option.icon} size={16} stroke={2} /> : null}
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className="fk-menu__indicator">
                  <FokunaIcon name="check-small" size={16} stroke={1.5} />
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
            <FokunaIcon name="more-vertical" size={16} stroke={1.5} />
          </button>
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="fk-menu"
          onCloseAutoFocus={(event) => event.preventDefault()}
          onPointerDown={(event) => event.stopPropagation()}
          sideOffset={6}
        >
          {items.map((item, index) => (
            <DropdownMenu.Item
              className="fk-menu__item"
              data-destructive={item.destructive || undefined}
              disabled={item.disabled}
              key={`${String(item.label)}-${index}`}
              onSelect={item.onSelect}
            >
              {item.icon ? <FokunaIcon name={item.icon} size={16} stroke={1.5} /> : null}
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
