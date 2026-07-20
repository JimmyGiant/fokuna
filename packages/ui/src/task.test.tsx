import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  AddTask,
  MilestoneTaskGroup,
  TaskGroup,
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

  it("keeps milestone tasks on one hierarchy level while retaining goal metadata", () => {
    render(<TaskListItem milestoneTask subtasks="0/2" title="Komponenten prüfen" />);

    const item = screen.getByText("Komponenten prüfen").closest(".fk-task-item");

    expect(item).toHaveAttribute("data-milestone-task", "true");
    expect(item?.querySelector(".fk-task-item__expand svg")).not.toBeInTheDocument();
    expect(screen.getByText("Mein Ziel")).toBeInTheDocument();
    expect(screen.getByText("0/2")).toBeInTheDocument();
  });

  it("composes milestone headers from the same list-item primitive", () => {
    render(
      <MilestoneTaskGroup
        stages={[
          {
            id: "a",
            title: "Meilenstein A",
            count: "0/3",
            goal: "Mein Ziel",
            children: <TaskListItem milestoneTask title="Konzept bestätigen" />,
          },
        ]}
      />,
    );

    const milestone = screen.getByText("Meilenstein A").closest(".fk-task-item");
    const child = screen.getByText("Konzept bestätigen").closest(".fk-task-item");

    expect(milestone).toHaveAttribute("data-milestone", "true");
    expect(milestone?.querySelector(".fk-task-item__expand svg")).toBeInTheDocument();
    expect(child).toHaveAttribute("data-milestone-task", "true");
  });

  it("offers only the inactive and active add-task states", () => {
    const inactive = render(<AddTask focusOnExpand={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Aufgabe hinzufügen" }));
    expect(screen.getByRole("textbox", { name: "Aufgabenname" })).toBeInTheDocument();
    expect(
      inactive.container.querySelector(".fk-add-task__description-row > svg"),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Beschreibung" }), {
      target: { value: "Details" },
    });
    expect(
      inactive.container.querySelector(".fk-add-task__description-row > svg"),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Abbrechen" }));
    expect(screen.getByRole("button", { name: "Aufgabe hinzufügen" })).toBeInTheDocument();
    expect(inactive.container.querySelector("[data-subtask]")).not.toBeInTheDocument();
    inactive.unmount();

    render(<AddTask expanded focusOnExpand={false} />);
    expect(screen.getByRole("textbox", { name: "Aufgabenname" })).toBeInTheDocument();
  });

  it("switches task groups between expanded and collapsed states", () => {
    render(
      <TaskGroup title="Abschnitt">
        <TaskListItem title="Aufgabe" />
      </TaskGroup>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Gruppe einklappen" }));
    expect(screen.queryByText("Aufgabe")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Gruppe ausklappen" }));
    expect(screen.getByText("Aufgabe")).toBeInTheDocument();
  });

  it("switches expandable tasks and their nested rows locally", () => {
    render(
      <TaskListItem subtasks="1/1" title="Hauptaufgabe">
        <TaskListItem indentLevel={1} title="Unteraufgabe" />
      </TaskListItem>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Aufgabendetails ausblenden" }));
    expect(screen.queryByText("Unteraufgabe")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Aufgabendetails einblenden" }));
    expect(screen.getByText("Unteraufgabe")).toBeInTheDocument();
  });

  it("switches milestone stages without external state", () => {
    render(
      <MilestoneTaskGroup
        stages={[
          {
            id: "a",
            title: "Meilenstein A",
            children: <TaskListItem milestoneTask title="Konzept bestätigen" />,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Aufgabendetails ausblenden" }));
    expect(screen.queryByText("Konzept bestätigen")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Aufgabendetails einblenden" }));
    expect(screen.getByText("Konzept bestätigen")).toBeInTheDocument();
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
    const { container } = render(
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
    expect(container.querySelector(".fk-task-modal-slot")).toHaveAttribute(
      "data-breadcrumb",
      "false",
    );
  });

  it("marks the breadcrumb composition without changing the modal shell", () => {
    const { container } = render(
      <TaskModalSlot
        breadcrumb={<span>Aufgabe / Components</span>}
        header={<TaskModalHeader title="Aufgabe" />}
        menu={<TaskModalMenu items={[]} />}
      />,
    );

    expect(container.querySelector(".fk-task-modal-slot")).toHaveAttribute(
      "data-breadcrumb",
      "true",
    );
  });
});
