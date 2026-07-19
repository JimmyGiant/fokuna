import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TaskGroupHeader, TaskModalHeader, TaskModalMenu, TaskModalSlot } from "./task";

describe("task composition patterns", () => {
  it("marks milestone group headers without changing the base component", () => {
    const { container } = render(<TaskGroupHeader milestone title="Meilenstein A" />);
    expect(container.firstElementChild).toHaveAttribute("data-milestone", "true");
  });

  it("composes the modal header, content and detail menu", () => {
    render(
      <TaskModalSlot
        header={<TaskModalHeader title="Aufgabe" />}
        menu={<TaskModalMenu items={[{ label: "Priorität", value: "Hoch" }]} />}
      >
        Inhalt
      </TaskModalSlot>,
    );

    expect(screen.getByRole("heading", { name: "Aufgabe" })).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "Aufgabendetails" })).toBeInTheDocument();
    expect(screen.getByText("Priorität")).toBeInTheDocument();
  });
});
