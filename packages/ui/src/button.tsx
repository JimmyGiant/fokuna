import { FokunaIcon, type IconName } from "@fokuna/icons";
import { Slot } from "radix-ui";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { cn } from "./utils";

export type ButtonIntent = "primary" | "secondary" | "tertiary";
export type ButtonType = "primary" | "outline" | "link";
export type ControlSize = "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  intent?: ButtonIntent;
  buttonType?: ButtonType;
  size?: ControlSize;
  iconOnly?: boolean;
  leadingIcon?: ReactNode | IconName;
  trailingIcon?: ReactNode | IconName | null;
  loading?: boolean;
}

function renderIcon(
  icon: ReactNode | IconName | null | undefined,
  size: 16 | 24,
  fallback?: IconName,
  stroke?: 1 | 1.5 | 2,
) {
  const resolved = icon === undefined ? fallback : icon;
  if (!resolved) return null;
  if (typeof resolved === "string") {
    return <FokunaIcon name={resolved as IconName} size={size} stroke={stroke} />;
  }
  return resolved;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    asChild,
    intent = "primary",
    buttonType = "primary",
    size = "md",
    iconOnly = false,
    leadingIcon,
    trailingIcon,
    loading = false,
    disabled,
    className,
    children,
    ...props
  },
  ref,
) {
  const Component = asChild ? Slot.Root : "button";
  const isDisabled = disabled || loading;
  const iconSize = size === "lg" || size === "xl" ? 24 : 16;
  const trailingFallback = "chevron-right-small";

  return (
    <Component
      {...props}
      aria-busy={loading || undefined}
      className={cn("fk-button", className)}
      data-icon-only={iconOnly}
      data-intent={intent}
      data-loading={loading || undefined}
      data-size={size}
      data-type={buttonType}
      disabled={asChild ? undefined : isDisabled}
      ref={ref}
    >
      {loading ? (
        <span aria-hidden="true" className="fk-spinner" />
      ) : (
        <span className="fk-button__icon fk-button__icon--leading" data-slot="leading-icon">
          {renderIcon(leadingIcon, iconSize, iconOnly ? "add-small" : undefined)}
        </span>
      )}
      {iconOnly ? <span className="fk-sr-only">{children}</span> : children}
      {!iconOnly ? (
        <span className="fk-button__icon fk-button__icon--trailing" data-slot="trailing-icon">
          {renderIcon(trailingIcon, iconSize, trailingFallback, iconSize === 24 ? 2 : undefined)}
        </span>
      ) : null}
    </Component>
  );
});
