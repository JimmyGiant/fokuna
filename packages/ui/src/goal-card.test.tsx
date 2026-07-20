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
    const { container } = render(
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

    const card = screen.getByRole("link", { name: /Berlin Marathon/ });

    expect(card).toHaveAttribute("href", "/goals/berlin-marathon");
    expect(screen.getByRole("progressbar", { name: "Fortschritt 85 Prozent" })).toHaveAttribute(
      "aria-valuenow",
      "85",
    );
    expect(card).toHaveStyle("--fk-goal-card-progress-offset: 15");
    expect(screen.getByText("+ 10 weitere Meilensteine")).toBeInTheDocument();
    expect(container.querySelector(".fk-goal-card__media-mask")).toBeTruthy();
    expect(container.querySelector(".fk-goal-card__progress-ring circle")).toHaveAttribute(
      "pathLength",
      "100",
    );
    expect(container.querySelector(".fk-goal-card__milestone-meta .fk-subtask-icon")).toBeTruthy();
    expect(container.querySelector(".fk-goal-card__check")).toBeTruthy();
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
    const { container } = render(
      <GoalCard
        emptyMilestoneActionHref="/goals/new/milestones"
        progress={140}
        title="Neues Ziel"
      />,
    );

    expect(screen.getByText("Noch keine Meilensteine")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Jetzt Meilenstein anlegen" })).toHaveAttribute(
      "href",
      "/goals/new/milestones",
    );
    expect(container.querySelector(".fk-goal-card__empty-milestones svg")).toBeTruthy();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("shows all three milestones before reserving a summary row", () => {
    render(
      <GoalCard
        milestones={[...milestones, { id: "recovery", title: "Regeneration planen" }]}
        title="Drei Schritte"
      />,
    );

    expect(screen.getByText("Regeneration planen")).toBeInTheDocument();
    expect(screen.queryByText(/weitere Meilensteine/)).not.toBeInTheDocument();
  });
});
