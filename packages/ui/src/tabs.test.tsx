import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Switcher, TabSelect } from "./tabs";

describe("rich selection controls", () => {
  it("exposes the date range and navigation controls", () => {
    render(<Switcher aria-label="Zeitraum" value="20. – 26. Juli" />);

    expect(screen.getByText("20. – 26. Juli")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Vorheriger Zeitraum" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nächster Zeitraum" })).toBeInTheDocument();
  });

  it("keeps rich options in a single-selection contract", () => {
    render(
      <TabSelect
        aria-label="Fokusklang"
        defaultValue="ambient"
        items={[
          { value: "ambient", label: "Ambient", description: "Ruhige Klänge" },
          { value: "off", label: "Ohne Klang" },
        ]}
      />,
    );

    expect(screen.getByRole("radio", { name: /Ambient/ })).toBeChecked();
  });
});
