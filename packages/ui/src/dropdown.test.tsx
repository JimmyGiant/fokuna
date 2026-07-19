import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Dropdown } from "./dropdown";

const options = [
  { value: "day", label: "Tag" },
  { value: "week", label: "Woche" },
];

describe("Dropdown", () => {
  it("renders a controlled selected value without opening the portal", () => {
    render(<Dropdown options={options} value="week" />);

    expect(screen.getByRole("combobox")).toHaveTextContent("Woche");
  });

  it("combines key and value in the trigger", () => {
    render(<Dropdown defaultValue="week" keyLabel="Zeitraum:" options={options} />);

    expect(screen.getByRole("combobox")).toHaveTextContent("Zeitraum:Woche");
  });
});
