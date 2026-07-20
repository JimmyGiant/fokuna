import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GoalCard } from "./goal-card";

const milestones = [
  {
    id: "research",
    title: "Trainingsplan erstellen",
    completed: true,
    subtasks: { completed: 2, total: 2 },
    dueDate: "27. Juli 2026",
  },
  { id: "race", title: "Berlin Marathon laufen", dueDate: "27. September 2026" },
];

describe("GoalCard", () => {
  it("renders the Figma content contract as an accessible destination", () => {
    render(
      <GoalCard
        href="/goals/berlin-marathon"
        location="Berlin"
        milestones={milestones}
        progress={85}
        tags={[{ label: "Healthy", icon: "heart" }, { label: "Sport" }]}
        title="Berlin Marathon"
        totalMilestones={12}
      />,
    );

    expect(screen.getByRole("link", { name: /Berlin Marathon/ })).toHaveAttribute(
      "href",
      "/goals/berlin-marathon",
    );
    expect(screen.getByRole("progressbar", { name: "Fortschritt 85 Prozent" })).toHaveAttribute(
      "aria-valuenow",
      "85",
    );
    expect(screen.getByText("+ 10 weitere Meilensteine")).toBeInTheDocument();
  });

  it("omits absent context and subtask metadata without empty placeholders", () => {
    const { container } = render(
      <GoalCard
        milestones={[{ id: "first", title: "Erster Meilenstein" }]}
        title="Ziel ohne Metadaten"
      />,
    );

    expect(container.querySelector(".fk-goal-card__context")).not.toBeInTheDocument();
    expect(container.querySelector(".fk-goal-card__milestone-meta")).not.toBeInTheDocument();
    expect(screen.getByText("Erster Meilenstein")).toBeInTheDocument();
  });

  it("supports an empty timeline and clamps invalid progress values", () => {
    render(<GoalCard progress={140} title="Neues Ziel" />);

    expect(screen.getByText("Noch keine Meilensteine")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });
});
