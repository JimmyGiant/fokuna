import { FokunaIcon } from "@fokuna/icons";
import { Checkbox as CheckboxPrimitive, RadioGroup } from "radix-ui";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import type { ControlSize } from "./button";
import { cn } from "./utils";

export interface CheckboxProps extends ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  controlSize?: ControlSize;
  label?: ReactNode;
  priority?: "none" | "low" | "medium" | "high" | "urgent";
  variant?: "default" | "favorite" | "milestone";
}

export function Checkbox({
  controlSize = "md",
  label,
  priority = "none",
  variant = "default",
  className,
  id,
  ...props
}: CheckboxProps) {
  const control = (
    <CheckboxPrimitive.Root
      {...props}
      className={cn("fk-checkbox", className)}
      data-priority={priority}
      data-size={controlSize}
      data-variant={variant}
      id={id}
    >
      {variant === "favorite" ? (
        <>
          <span className="fk-checkbox__favorite fk-checkbox__favorite--off">
            <FokunaIcon
              fill="off"
              name="star"
              size={controlSize === "lg" || controlSize === "xl" ? 24 : 16}
            />
          </span>
          <span className="fk-checkbox__favorite fk-checkbox__favorite--on">
            <FokunaIcon
              fill="on"
              name="star"
              size={controlSize === "lg" || controlSize === "xl" ? 24 : 16}
            />
          </span>
        </>
      ) : (
        <CheckboxPrimitive.Indicator className="fk-checkbox__indicator" forceMount>
          <span className="fk-checkbox__check">
            <FokunaIcon name="check-small" size={16} />
          </span>
          <span className="fk-checkbox__indeterminate">
            <span aria-hidden="true" />
          </span>
        </CheckboxPrimitive.Indicator>
      )}
    </CheckboxPrimitive.Root>
  );

  return label ? (
    <label className="fk-selection-label" data-size={controlSize} htmlFor={id}>
      {control}
      <span>{label}</span>
    </label>
  ) : (
    control
  );
}

export interface RadioProps extends ComponentPropsWithoutRef<typeof RadioGroup.Item> {
  controlSize?: ControlSize;
  label?: ReactNode;
}

export function Radio({ controlSize = "md", label, className, id, ...props }: RadioProps) {
  const control = (
    <RadioGroup.Item
      {...props}
      className={cn("fk-radio", className)}
      data-size={controlSize}
      id={id}
    >
      <RadioGroup.Indicator className="fk-radio__indicator" forceMount />
    </RadioGroup.Item>
  );

  return label ? (
    <label className="fk-selection-label" data-size={controlSize} htmlFor={id}>
      {control}
      <span>{label}</span>
    </label>
  ) : (
    control
  );
}

export const RadioGroupRoot = RadioGroup.Root;
