import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BlockCard } from "./block-card";

describe("BlockCard", () => {
  it("renders the Figma Time Blocks contract", () => {
    const { container } = render(
      <BlockCard
        description="Ruhiger Block mit entspannter Hintergrundmusik."
        durationLabel="15 min"
        icon="balance"
        meta={[
          { id: "pomodoro", label: "Pomodoro", icon: "clock-alert" },
          { id: "sound", label: "Woods", icon: "music" },
        ]}
        title="Meditation"
        tone="pink"
      />,
    );

    expect(container.querySelector(".fk-block-card")).toHaveAttribute("data-elevation", "subtle");
    expect(container.querySelector(".fk-block-card__icon")).toHaveAttribute("data-tone", "pink");
    expect(screen.getByText("Meditation")).toBeInTheDocument();
    expect(screen.getByText("15 min")).toBeInTheDocument();
    expect(screen.getByText("Pomodoro")).toBeInTheDocument();
    expect(screen.getByText("Woods")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mehr Optionen" })).toHaveAttribute("data-size", "sm");
    expect(screen.queryByRole("button", { name: "Bearbeiten" })).not.toBeInTheDocument();
  });
});
