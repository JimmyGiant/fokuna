import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Callout } from "./callout";

describe("Callout", () => {
  it("uses semantic tone without changing the note role", () => {
    render(
      <Callout tone="warning" title="Achtung">
        Überschneidung erkannt.
      </Callout>,
    );
    const note = screen.getByRole("note");

    expect(note).toHaveAttribute("data-tone", "warning");
    expect(note).toHaveTextContent("Überschneidung erkannt.");
  });
});
