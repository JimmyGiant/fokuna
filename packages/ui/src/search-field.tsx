"use client";

import { FokunaIcon } from "@fokuna/icons";
import { forwardRef, useState, type InputHTMLAttributes } from "react";

import type { ControlSize } from "./button";
import { cn } from "./utils";

export interface SearchFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "type"
> {
  controlSize?: ControlSize;
  collapsedWidth?: number;
  expandedWidth?: number;
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  {
    controlSize = "md",
    collapsedWidth = 120,
    expandedWidth = 320,
    value,
    defaultValue,
    onChange,
    className,
    placeholder = "Suchen...",
    ...props
  },
  ref,
) {
  const [internalValue, setInternalValue] = useState(defaultValue?.toString() ?? "");
  const currentValue = value?.toString() ?? internalValue;

  return (
    <label
      className={cn("fk-search-field", className)}
      data-size={controlSize}
      style={
        {
          "--fk-search-collapsed": `${collapsedWidth}px`,
          "--fk-search-expanded": `${expandedWidth}px`,
        } as React.CSSProperties
      }
    >
      <FokunaIcon name="search" />
      <input
        {...props}
        defaultValue={defaultValue}
        onChange={(event) => {
          setInternalValue(event.currentTarget.value);
          onChange?.(event);
        }}
        placeholder={placeholder}
        ref={ref}
        type="search"
        value={value}
      />
      {currentValue ? (
        <button
          aria-label="Suche leeren"
          className="fk-search-field__clear"
          onClick={(event) => {
            const input = event.currentTarget.parentElement?.querySelector("input");
            if (input) {
              const valueSetter = Object.getOwnPropertyDescriptor(
                HTMLInputElement.prototype,
                "value",
              )?.set;
              valueSetter?.call(input, "");
              input.dispatchEvent(new Event("input", { bubbles: true }));
              setInternalValue("");
              input.focus();
            }
          }}
          type="button"
        >
          <FokunaIcon name="close" />
        </button>
      ) : null}
    </label>
  );
});
