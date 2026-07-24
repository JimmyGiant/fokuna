import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OverflowButton } from "./overflow-button";

describe("OverflowButton", () => {
  it("renders an accessible control with more-horizontal icon", () => {
    render(<OverflowButton>Listenoptionen</OverflowButton>);
    const button = screen.getByRole("button", { name: "Listenoptionen" });
    expect(button).toBeInTheDocument();
    expect(button.querySelector("svg")).toBeTruthy();
  });

  it("marks the active indicator state", () => {
    render(<OverflowButton active>Listenoptionen</OverflowButton>);
    expect(screen.getByRole("button", { name: "Listenoptionen" })).toHaveAttribute(
      "data-active",
      "true",
    );
    expect(
      screen.getByRole("button", { name: "Listenoptionen" }).querySelector(
        ".fk-overflow-button__badge",
      ),
    ).toBeTruthy();
  });
});
