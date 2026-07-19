import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Slider } from "./slider";

describe("Slider", () => {
  it("reports numeric values through the array-based component contract", () => {
    const onValueChange = vi.fn();
    render(<Slider defaultValue={[40]} label="Intensität" onValueChange={onValueChange} />);

    fireEvent.change(screen.getByRole("slider", { name: "Intensität" }), {
      target: { value: "70" },
    });

    expect(onValueChange).toHaveBeenLastCalledWith([70]);
  });

  it("renders ten labelled steps for ten-percent increments", () => {
    const { container } = render(<Slider defaultValue={[40]} showSteps step={10} />);

    expect(container.querySelectorAll(".fk-slider__steps > span")).toHaveLength(10);
  });
});
