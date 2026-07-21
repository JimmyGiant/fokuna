"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TaskDto } from "@fokuna/api-contracts";
import { Button, PageHeader, TaskGroup, TaskListItem } from "@fokuna/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { apiGet, apiSend } from "@/lib/api";
import styles from "./tasks-view.module.css";

function SortableTask({
  task,
  onToggle,
}: {
  task: TaskDto;
  onToggle: (task: TaskDto, completed: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
    >
      <TaskListItem
        completed={task.isCompleted}
        due={task.dueDate ?? undefined}
        favorite={task.isFavorite}
        onCompletedChange={(completed) => onToggle(task, completed)}
        state={isDragging ? "dragged" : "default"}
        tags={task.tags}
        title={task.title}
      />
    </div>
  );
}

export function TasksView() {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const tasksQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: () => apiGet<TaskDto[]>("/api/v1/tasks"),
  });

  const createMutation = useMutation({
    mutationFn: (title: string) =>
      apiSend<TaskDto>("/api/v1/tasks", "POST", { title, groupKey: "today" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...patch }: { id: string } & Partial<TaskDto>) =>
      apiSend<TaskDto>(`/api/v1/tasks/${id}`, "PATCH", patch),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (payload: { groupKey: string; orderedIds: string[] }) =>
      apiSend<TaskDto[]>("/api/v1/tasks", "PUT", payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<TaskDto[]>(["tasks"]);
      if (previous) {
        const byId = new Map(previous.map((task) => [task.id, task]));
        const nextGroup = payload.orderedIds
          .map((id, index) => {
            const task = byId.get(id);
            return task ? { ...task, sortOrder: index } : null;
          })
          .filter(Boolean) as TaskDto[];
        const others = previous.filter((task) => task.groupKey !== payload.groupKey);
        queryClient.setQueryData(["tasks"], [...nextGroup, ...others]);
      }
      return { previous };
    },
    onError: (_error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["tasks"], context.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const groups = useMemo(() => {
    const tasks = tasksQuery.data ?? [];
    const map = new Map<string, TaskDto[]>();
    for (const task of tasks) {
      const list = map.get(task.groupKey) ?? [];
      list.push(task);
      map.set(task.groupKey, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return map;
  }, [tasksQuery.data]);

  const activeTask = (tasksQuery.data ?? []).find((task) => task.id === activeId) ?? null;

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) {
      return;
    }

    const tasks = tasksQuery.data ?? [];
    const activeTaskItem = tasks.find((task) => task.id === active.id);
    const overTaskItem = tasks.find((task) => task.id === over.id);
    if (!activeTaskItem || !overTaskItem || activeTaskItem.groupKey !== overTaskItem.groupKey) {
      return;
    }

    const groupTasks = tasks
      .filter((task) => task.groupKey === activeTaskItem.groupKey)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const oldIndex = groupTasks.findIndex((task) => task.id === active.id);
    const newIndex = groupTasks.findIndex((task) => task.id === over.id);
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const orderedIds = arrayMove(groupTasks, oldIndex, newIndex).map((task) => task.id);
    reorderMutation.mutate({ groupKey: activeTaskItem.groupKey, orderedIds });
  }

  return (
    <div className={styles.page}>
      <PageHeader
        actions={
          <Button onClick={() => createMutation.mutate("Neue Aufgabe")} size="md" type="button">
            Aufgabe hinzufügen
          </Button>
        }
        title="Alle Aufgaben"
      />

      {tasksQuery.isLoading ? <p>Aufgaben werden geladen…</p> : null}
      {tasksQuery.isError ? <p>Aufgaben konnten nicht geladen werden.</p> : null}

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        sensors={sensors}
      >
        {[...groups.entries()].map(([groupKey, tasks]) => (
          <TaskGroup
            count={tasks.length}
            key={groupKey}
            title={groupKey === "today" ? "Heute" : groupKey === "inbox" ? "Eingang" : groupKey}
          >
            <SortableContext
              items={tasks.map((task) => task.id)}
              strategy={verticalListSortingStrategy}
            >
              {tasks.map((task) => (
                <SortableTask
                  key={task.id}
                  onToggle={(current, completed) =>
                    updateMutation.mutate({ id: current.id, isCompleted: completed })
                  }
                  task={task}
                />
              ))}
            </SortableContext>
          </TaskGroup>
        ))}
        <DragOverlay>
          {activeTask ? (
            <TaskListItem
              completed={activeTask.isCompleted}
              favorite={activeTask.isFavorite}
              state="dragged"
              tags={activeTask.tags}
              title={activeTask.title}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
