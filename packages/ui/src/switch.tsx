import { Switch as SwitchPrimitive } from "radix-ui";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import type { ControlSize } from "./button";
import { cn } from "./utils";

export interface SwitchProps extends ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  controlSize?: ControlSize;
  label?: ReactNode;
}

export function Switch({ controlSize = "md", label, className, id, ...props }: SwitchProps) {
  const control = (
    <SwitchPrimitive.Root
      {...props}
      className={cn("fk-switch", className)}
      data-size={controlSize}
      id={id}
    >
      <SwitchPrimitive.Thumb className="fk-switch__thumb" />
    </SwitchPrimitive.Root>
  );

  return label ? (
    <label className="fk-switch-label" htmlFor={id}>
      <span>{label}</span>
      {control}
    </label>
  ) : (
    control
  );
}
