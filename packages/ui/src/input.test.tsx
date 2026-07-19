import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InputGroup } from "./input";

describe("InputGroup", () => {
  it("connects label and description to the field", () => {
    render(
      <InputGroup
        label="Titel"
        placeholder="Titel eingeben"
        sublabel="Wird auf der Karte angezeigt."
      />,
    );

    const input = screen.getByRole("textbox", { name: "Titel" });
    expect(input).toHaveAccessibleDescription("Wird auf der Karte angezeigt.");
  });

  it("exposes an invalid state", () => {
    render(<InputGroup errorMessage="Pflichtfeld" label="E-Mail" />);
    expect(screen.getByRole("textbox", { name: "E-Mail" })).toHaveAttribute("aria-invalid", "true");
  });
});
