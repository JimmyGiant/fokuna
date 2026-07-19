"use client";

import { useState, type CSSProperties, type InputHTMLAttributes } from "react";

import { cn } from "./utils";

export interface SliderProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "defaultValue" | "onChange" | "size" | "type" | "value"
> {
  defaultValue?: number[];
  label?: string;
  onValueChange?: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
  showSteps?: boolean;
  showValue?: boolean;
  value?: number[];
}

export function Slider({
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  showSteps,
  showValue,
  label,
  className,
  disabled,
  onValueChange,
  onValueCommit,
  style,
  ...props
}: SliderProps) {
  const [internalValue, setInternalValue] = useState(defaultValue?.[0] ?? Number(min));
  const current = value?.[0] ?? internalValue;
  const numericMin = Number(min);
  const numericMax = Number(max);
  const numericStep = Number(step);
  const progress = ((current - numericMin) / (numericMax - numericMin || 1)) * 100;
  const stepValues = showSteps
    ? Array.from(
        { length: Math.floor((numericMax - numericMin) / numericStep) },
        (_, index) => numericMin + numericStep * (index + 1),
      )
    : [];

  return (
    <div className="fk-slider-field">
      {label || showValue ? (
        <div className="fk-slider-field__header">
          <span>{label}</span>
          {showValue ? <output>{current}</output> : null}
        </div>
      ) : null}
      <span
        className={cn("fk-slider", className)}
        data-disabled={disabled || undefined}
        data-stepped={showSteps || undefined}
        style={{ "--fk-slider-progress": `${progress}%`, ...style } as CSSProperties}
      >
        <input
          {...props}
          aria-label={props["aria-label"] ?? label ?? "Wert"}
          className="fk-slider__input"
          disabled={disabled}
          max={numericMax}
          min={numericMin}
          onChange={(event) => {
            const nextValue = event.currentTarget.valueAsNumber;
            setInternalValue(nextValue);
            onValueChange?.([nextValue]);
          }}
          onPointerUp={(event) => onValueCommit?.([event.currentTarget.valueAsNumber])}
          step={numericStep}
          type="range"
          value={current}
        />
        {showSteps ? (
          <span aria-hidden="true" className="fk-slider__steps">
            {stepValues.map((stepValue) => (
              <span
                key={stepValue}
                style={{
                  left: `${((stepValue - numericMin) / (numericMax - numericMin || 1)) * 100}%`,
                }}
              >
                <i />
                <small>{stepValue / numericStep}</small>
              </span>
            ))}
          </span>
        ) : null}
      </span>
    </div>
  );
}
