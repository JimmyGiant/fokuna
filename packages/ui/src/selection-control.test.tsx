import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Checkbox, Radio, RadioGroupRoot } from "./selection-control";

describe("selection controls", () => {
  it("exposes the indeterminate checkbox state", () => {
    render(<Checkbox checked="indeterminate" label="Teilweise ausgewählt" />);

    expect(screen.getByRole("checkbox", { name: "Teilweise ausgewählt" })).toHaveAttribute(
      "data-state",
      "indeterminate",
    );
  });

  it("keeps milestone controls round and variant-addressable", () => {
    render(<Checkbox aria-label="Meilenstein" variant="milestone" />);

    expect(screen.getByRole("checkbox", { name: "Meilenstein" })).toHaveAttribute(
      "data-variant",
      "milestone",
    );
  });

  it("maps radio sizes onto the shared size contract", () => {
    render(
      <RadioGroupRoot>
        <Radio controlSize="lg" label="Large" value="large" />
      </RadioGroupRoot>,
    );

    expect(screen.getByRole("radio", { name: "Large" })).toHaveAttribute("data-size", "lg");
  });
});
