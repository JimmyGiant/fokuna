import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  TaskGroupHeader,
  TaskListItem,
  TaskModalHeader,
  TaskModalMenu,
  TaskModalSlot,
} from "./task";

describe("task composition patterns", () => {
  it("marks milestone group headers without changing the base component", () => {
    const { container } = render(<TaskGroupHeader milestone title="Meilenstein A" />);
    expect(container.firstElementChild).toHaveAttribute("data-milestone", "true");
  });

  it("derives metadata, expansion and indentation from task content", () => {
    render(
      <>
        <TaskListItem indentLevel={1} title="Kompakter Untertask" />
        <TaskListItem subtasks="1/3" title="Task mit Metadaten" />
      </>,
    );

    const compactTask = screen.getByText("Kompakter Untertask").closest(".fk-task-item");
    const taskWithMeta = screen.getByText("Task mit Metadaten").closest(".fk-task-item");

    expect(compactTask).toHaveAttribute("data-indent", "1");
    expect(compactTask).not.toHaveAttribute("data-has-meta");
    expect(compactTask?.querySelector(".fk-task-item__meta")).not.toBeInTheDocument();
    expect(compactTask?.querySelector(".fk-task-item__expand svg")).not.toBeInTheDocument();
    expect(taskWithMeta).toHaveAttribute("data-has-meta", "true");
    expect(taskWithMeta?.querySelector(".fk-task-item__meta")).toBeInTheDocument();
    expect(taskWithMeta?.querySelector(".fk-task-item__expand svg")).toBeInTheDocument();
  });

  it("shows the description icon only for the empty modal placeholder", () => {
    const empty = render(<TaskModalHeader title="Aufgabe" />);
    expect(
      empty.container.querySelector(".fk-task-modal-header__description-row > svg"),
    ).toBeInTheDocument();
    empty.unmount();

    const filled = render(<TaskModalHeader description="Inhalt" title="Aufgabe" />);
    expect(
      filled.container.querySelector(".fk-task-modal-header__description-row > svg"),
    ).not.toBeInTheDocument();
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
