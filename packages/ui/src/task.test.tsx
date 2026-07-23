import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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
        <TaskListItem indentLevel={3} title="Tiefe Ebene" />
        <TaskListItem subtasks="1/3" title="Task mit Metadaten" />
      </>,
    );

    const compactTask = screen.getByText("Kompakter Untertask").closest(".fk-task-item");
    const deepTask = screen.getByText("Tiefe Ebene").closest(".fk-task-item");
    const taskWithMeta = screen.getByText("Task mit Metadaten").closest(".fk-task-item");

    expect(compactTask).toHaveAttribute("data-indent", "1");
    expect(deepTask).toHaveAttribute("data-indent", "3");
    expect(compactTask).not.toHaveAttribute("data-has-meta");
    expect(compactTask?.querySelector(".fk-task-item__meta")).not.toBeInTheDocument();
    expect(compactTask?.querySelector(".fk-task-item__expand svg")).not.toBeInTheDocument();
    expect(taskWithMeta).toHaveAttribute("data-has-meta", "true");
    expect(taskWithMeta?.querySelector(".fk-task-item__meta")).toBeInTheDocument();
    expect(taskWithMeta?.querySelector(".fk-task-item__expand svg")).toBeInTheDocument();
  });

  it("orders meta as priority → due → goal → category → labels with a category color swatch", () => {
    render(
      <TaskListItem
        category={{ label: "Privat", tone: "purple", swatch: "var(--fk-color-category-purple)" }}
        due="Heute"
        goal="Halbmarathon"
        priority="high"
        tags={[{ label: "Deep Work", tone: "teal" }]}
        title="Intervall"
      />,
    );

    const meta = screen.getByText("Intervall").closest(".fk-task-item")?.querySelector(
      ".fk-task-item__meta",
    );
    expect(meta).toBeTruthy();
    const chips = Array.from(meta!.children).map((node) => {
      if (node.classList.contains("fk-tag-item-priority")) {
        return node.getAttribute("aria-label") ?? "";
      }
      return (node.textContent ?? "").replace(/\s+/g, " ").trim();
    });
    expect(chips).toEqual(["Hoch", "Heute", "Halbmarathon", "Privat", "Deep Work"]);
    expect(meta!.querySelector(".fk-tag-item-priority")).toHaveAttribute("data-priority", "high");
    expect(meta!.querySelector(".fk-task-item__category-dot")).toHaveStyle({
      background: "var(--fk-color-category-purple)",
    });
  });

  it("hides the priority meta pill when priority is none", () => {
    render(<TaskListItem due="Morgen" priority="none" title="Ohne Prio" />);

    const meta = screen.getByText("Ohne Prio").closest(".fk-task-item")?.querySelector(
      ".fk-task-item__meta",
    );
    expect(meta?.querySelector(".fk-tag-item-priority")).not.toBeInTheDocument();
  });

  it("expands nested children even without a subtasks label", () => {
    render(
      <TaskListItem title="Hauptaufgabe">
        <TaskListItem indentLevel={1} title="Unteraufgabe" />
      </TaskListItem>,
    );

    expect(screen.getByText("Unteraufgabe")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Aufgabendetails ausblenden" }));
    expect(screen.queryByText("Unteraufgabe")).not.toBeInTheDocument();
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

  it("submits a new task title from the active add form", async () => {
    const onSubmit = vi.fn();
    render(<AddTask defaultExpanded focusOnExpand={false} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByRole("textbox", { name: "Aufgabenname" }), {
      target: { value: "Neue Aufgabe" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Aufgabe hinzufügen" }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: "Neue Aufgabe",
      description: "",
      priority: "none",
      dueDate: null,
    });
  });

  it("keeps the add form open after submit for rapid entry", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<AddTask defaultExpanded focusOnExpand={false} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByRole("textbox", { name: "Aufgabenname" }), {
      target: { value: "Erste Aufgabe" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Aufgabe hinzufügen" }));

    await vi.waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("textbox", { name: "Aufgabenname" })).toHaveValue("");
    });
    expect(screen.getByRole("textbox", { name: "Aufgabenname" })).toBeInTheDocument();
  });

  it("closes the add form after submit when keepOpenOnSubmit is false", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <AddTask
        defaultExpanded
        focusOnExpand={false}
        keepOpenOnSubmit={false}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Aufgabenname" }), {
      target: { value: "Nur eine" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Aufgabe hinzufügen" }));

    await vi.waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("textbox", { name: "Aufgabenname" })).not.toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Aufgabe hinzufügen" })).toBeInTheDocument();
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

  it("collapses to inactive on Escape and discards draft input", () => {
    render(<AddTask defaultExpanded focusOnExpand={false} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Aufgabenname" }), {
      target: { value: "Entwurf" },
    });
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByRole("button", { name: "Aufgabe hinzufügen" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Aufgabe hinzufügen" }));
    expect(screen.getByRole("textbox", { name: "Aufgabenname" })).toHaveValue("");
  });

  it("collapses to inactive on outside pointerdown", () => {
    render(
      <div>
        <AddTask defaultExpanded focusOnExpand={false} />
        <button type="button">Außerhalb</button>
      </div>,
    );

    fireEvent.pointerDown(screen.getByRole("button", { name: "Außerhalb" }));
    expect(screen.getByRole("button", { name: "Aufgabe hinzufügen" })).toBeInTheDocument();
  });

  it("closes nested property popovers on Escape before collapsing the form", () => {
    render(<AddTask defaultExpanded focusOnExpand={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Priorität" }));
    expect(screen.getByLabelText("Priorität auswählen")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByLabelText("Priorität auswählen")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Aufgabenname" })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByRole("button", { name: "Aufgabe hinzufügen" })).toBeInTheDocument();
  });

  it("opens and closes the add-task form inside task groups", () => {
    const { container } = render(<TaskGroup title="Abschnitt" />);

    fireEvent.click(screen.getByRole("button", { name: "Aufgabe hinzufügen" }));
    expect(screen.getByRole("textbox", { name: "Aufgabenname" })).toBeInTheDocument();
    expect(container.querySelector(".fk-task-group__items")).toHaveAttribute("data-adding", "true");
    fireEvent.click(screen.getByRole("button", { name: "Abbrechen" }));
    expect(screen.getByRole("button", { name: "Aufgabe hinzufügen" })).toBeInTheDocument();
    expect(container.querySelector(".fk-task-group__items")).not.toHaveAttribute("data-adding");
  });

  it("uses contextual labels for modal subtasks", () => {
    render(
      <TaskGroup
        addLabel="Unteraufgabe hinzufügen"
        addNamePlaceholder="Unteraufgabenname"
        title="Unteraufgaben"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Unteraufgabe hinzufügen" }));
    expect(screen.getByRole("textbox", { name: "Unteraufgabenname" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Unteraufgabe hinzufügen" }));
    expect(screen.getByRole("button", { name: "Unteraufgabe hinzufügen" })).toBeInTheDocument();
  });

  it("opens and closes the add form for milestone groups", () => {
    render(<MilestoneTaskGroup stages={[]} />);

    fireEvent.click(screen.getByRole("button", { name: "Meilenstein hinzufügen" }));
    expect(screen.getByRole("textbox", { name: "Meilensteinname" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Abbrechen" }));
    expect(screen.getByRole("button", { name: "Meilenstein hinzufügen" })).toBeInTheDocument();
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
    const scrollRegion = container.querySelector(".fk-task-modal-slot__scroll-region");
    expect(scrollRegion).toContainElement(container.querySelector(".fk-task-modal-header"));
    expect(scrollRegion).toContainElement(container.querySelector(".fk-task-modal-slot__body"));
    expect(container.querySelector(".fk-task-modal-menu__preview")).toHaveTextContent("Hoch");
    expect(screen.getByRole("button", { name: "Priorität bearbeiten" })).not.toContainElement(
      container.querySelector(".fk-task-modal-menu__preview"),
    );
  });

  it("places optional task actions next to the modal close control", () => {
    const { container } = render(
      <TaskModalSlot
        actions={<button type="button">Weitere Aktionen</button>}
        header={<TaskModalHeader title="Aufgabe" />}
        menu={<TaskModalMenu items={[]} />}
      />,
    );

    expect(screen.getByRole("button", { name: "Weitere Aktionen" })).toBeInTheDocument();
    expect(container.querySelector(".fk-task-modal-slot__actions")).toBeInTheDocument();
  });

  it("opens task properties in an anchored popover without changing the plus icon", () => {
    const { container } = render(
      <TaskModalMenu items={[{ label: "Priorität", content: <span>Prioritätsauswahl</span> }]} />,
    );

    const trigger = screen.getByRole("button", { name: "Priorität bearbeiten" });
    fireEvent.click(trigger);

    expect(screen.getByText("Prioritätsauswahl")).toBeInTheDocument();
    expect(trigger).toHaveAttribute("data-state", "open");
    expect(container.querySelector(".fk-task-modal-menu__trigger > svg")).toBeInTheDocument();
  });

  it("supports controlled property popovers without title or close chrome", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <TaskModalMenu
        items={[
          {
            label: "Priorität",
            content: <span>Prioritätsauswahl</span>,
            onOpenChange,
            open: true,
          },
        ]}
      />,
    );

    expect(screen.getByText("Prioritätsauswahl")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Priorität schließen" })).not.toBeInTheDocument();
    expect(screen.queryByText("Priorität", { selector: "strong" })).not.toBeInTheDocument();

    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);

    rerender(
      <TaskModalMenu
        items={[
          {
            label: "Priorität",
            content: <span>Prioritätsauswahl</span>,
            onOpenChange,
            open: false,
          },
        ]}
      />,
    );
    expect(screen.queryByText("Prioritätsauswahl")).not.toBeInTheDocument();
  });

  it("keeps destructive actions in the detail rail footer", () => {
    const { container } = render(
      <TaskModalMenu footer={<button type="button">Aufgabe löschen</button>} items={[]} />,
    );

    expect(screen.getByRole("button", { name: "Aufgabe löschen" })).toBeInTheDocument();
    expect(container.querySelector(".fk-task-modal-menu__footer")).toBeInTheDocument();
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
