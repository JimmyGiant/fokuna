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

  it("shows the placeholder when the controlled value is not in options", () => {
    render(<Dropdown options={options} placeholder="Dauer wählen" value="40" />);

    expect(screen.getByRole("combobox")).toHaveTextContent("Dauer wählen");
  });

  it("shows the placeholder when no value is selected", () => {
    render(<Dropdown options={options} placeholder="Dauer wählen" />);

    expect(screen.getByRole("combobox")).toHaveTextContent("Dauer wählen");
  });

  it("combines key and value in the trigger", () => {
    render(<Dropdown defaultValue="week" keyLabel="Zeitraum:" options={options} />);

    expect(screen.getByRole("combobox")).toHaveTextContent("Zeitraum:Woche");
  });

  it("marks icon and text appearance variants on the trigger", () => {
    const { rerender } = render(
      <Dropdown appearance="text" leadingIcon="diamond" options={options} value="day" />,
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("data-appearance", "text");
    expect(trigger).toHaveAttribute("data-type", "icon");
    expect(trigger.querySelector(".fk-dropdown__leading")).toBeInTheDocument();

    rerender(<Dropdown controlSize="xl" options={options} value="week" />);
    expect(screen.getByRole("combobox")).toHaveAttribute("data-size", "xl");
    expect(screen.getByRole("combobox")).toHaveAttribute("data-type", "single");

    rerender(
      <Dropdown appearance="text" controlSize="lg" options={options} value="week" />,
    );
    expect(screen.getByRole("combobox")).toHaveAttribute("data-appearance", "text");
    expect(screen.getByRole("combobox")).toHaveAttribute("data-size", "lg");
  });
});
