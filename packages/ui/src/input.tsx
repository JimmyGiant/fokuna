import { FokunaIcon, type IconName } from "@fokuna/icons";
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";

import { Button, type ButtonProps, type ControlSize } from "./button";
import { cn } from "./utils";

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  controlSize?: ControlSize;
  tone?: "default" | "tinted";
  leadingIcon?: ReactNode | IconName;
  trailingIcon?: ReactNode | IconName;
  invalid?: boolean;
}

function InputIcon({ icon }: { icon: ReactNode | IconName }) {
  return typeof icon === "string" ? <FokunaIcon name={icon as IconName} /> : icon;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(function InputField(
  {
    controlSize = "md",
    tone = "default",
    leadingIcon,
    trailingIcon,
    invalid,
    className,
    disabled,
    ...props
  },
  ref,
) {
  return (
    <span
      className={cn("fk-input", className)}
      data-disabled={disabled || undefined}
      data-invalid={invalid || undefined}
      data-size={controlSize}
      data-tone={tone}
    >
      {leadingIcon ? (
        <span aria-hidden="true" className="fk-input__icon">
          <InputIcon icon={leadingIcon} />
        </span>
      ) : null}
      <input {...props} aria-invalid={invalid || undefined} disabled={disabled} ref={ref} />
      {trailingIcon ? (
        <span aria-hidden="true" className="fk-input__icon">
          <InputIcon icon={trailingIcon} />
        </span>
      ) : null}
    </span>
  );
});

export interface InputGroupProps extends Omit<InputFieldProps, "id"> {
  id?: string;
  label?: string;
  sublabel?: string;
  errorMessage?: string;
  action?: ButtonProps | false;
  horizontal?: boolean;
}

export function InputGroup({
  id,
  label,
  sublabel,
  errorMessage,
  action,
  horizontal = false,
  controlSize = "md",
  invalid,
  ...inputProps
}: InputGroupProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = sublabel || errorMessage ? `${inputId}-description` : undefined;

  return (
    <div className="fk-input-group" data-horizontal={horizontal || undefined}>
      {label ? (
        <label className="fk-input-group__label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <div className="fk-input-group__control">
        <InputField
          {...inputProps}
          aria-describedby={descriptionId}
          controlSize={controlSize}
          id={inputId}
          invalid={invalid || Boolean(errorMessage)}
        />
        {action ? <Button {...action} size={controlSize} /> : null}
      </div>
      {errorMessage || sublabel ? (
        <span
          className="fk-input-group__description"
          data-error={Boolean(errorMessage) || undefined}
          id={descriptionId}
        >
          {errorMessage ?? sublabel}
        </span>
      ) : null}
    </div>
  );
}
