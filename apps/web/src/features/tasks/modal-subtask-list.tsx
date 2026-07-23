"use client";

import {
  DndContext,
  DragOverlay,
  MeasuringStrategy,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
  type AnimateLayoutChanges,
} from "@dnd-kit/sortable";
import type { TaskDto } from "@fokuna/api-contracts";
import { TaskGroup, TaskListItem, type TaskListTag } from "@fokuna/ui";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { DnDGhostShell } from "@/components/dnd/dnd-ghost-shell";
import { sortableItemStyle } from "@/components/dnd/sortable-styles";

const animateLayoutChanges: AnimateLayoutChanges = () => false;

const measuring = {
  droppable: { strategy: MeasuringStrategy.Always },
};

const collisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  if (pointerHits.length > 0) {
    return [pointerHits[pointerHits.length - 1]!];
  }
  return closestCenter(args);
};

function formatDueLabel(dueDate: string | null): string | undefined {
  if (!dueDate) return undefined;
  const due = new Date(`${dueDate}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  if (diffDays === 0) return "Heute";
  if (diffDays === 1) return "Morgen";
  return due.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function SortableSubtaskRow({
  task,
  tags,
  onOpen,
  onToggleCompleted,
}: {
  task: TaskDto;
  tags?: TaskListTag[];
  onOpen: (taskId: string) => void;
  onToggleCompleted: (taskId: string, completed: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: task.id,
    animateLayoutChanges,
    transition: null,
  });

  return (
    <div
      data-placeholder={isDragging ? "true" : undefined}
      ref={setNodeRef}
      style={sortableItemStyle({
        transform: null,
        transition: undefined,
        layoutControlled: true,
      })}
    >
      <TaskListItem
        completed={task.isCompleted}
        dragHandleProps={isDragging ? undefined : { ...listeners }}
        due={formatDueLabel(task.dueDate)}
        onClick={isDragging ? undefined : () => onOpen(task.id)}
        onCompletedChange={
          isDragging ? undefined : (completed) => onToggleCompleted(task.id, completed)
        }
        priority={task.priority}
        rowDragProps={isDragging ? undefined : { ...attributes, ...listeners }}
        state={isDragging ? "placeholder" : "default"}
        style={
          isDragging
            ? {
                boxSizing: "border-box",
                minHeight: 40,
                width: "100%",
              }
            : undefined
        }
        tags={tags}
        title={task.title}
      />
    </div>
  );
}

export function ModalSubtaskList({
  parentTaskId,
  subtasks,
  resolveTags,
  onOpenSubtask,
  onToggleCompleted,
  onCreateSubtask,
  onReorderSubtasks,
}: {
  parentTaskId: string;
  subtasks: TaskDto[];
  resolveTags: (labelIds: string[]) => TaskListTag[];
  onOpenSubtask: (taskId: string) => void;
  onToggleCompleted: (taskId: string, completed: boolean) => void;
  onCreateSubtask: (payload: {
    parentTaskId: string;
    title: string;
    description?: string;
  }) => Promise<void>;
  onReorderSubtasks: (orderedIds: string[]) => void | Promise<void>;
}) {
  const baseIds = useMemo(() => subtasks.map((task) => task.id), [subtasks]);
  const [liveIds, setLiveIds] = useState<string[] | null>(null);
  const liveIdsRef = useRef<string[] | null>(null);
  const dragActiveRef = useRef(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overlayWidth, setOverlayWidth] = useState<number | undefined>();
  const [overlayHeight, setOverlayHeight] = useState<number | undefined>();

  const tasksById = useMemo(() => {
    const map = new Map(subtasks.map((task) => [task.id, task]));
    return map;
  }, [subtasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  useEffect(() => {
    if (dragActiveRef.current || !liveIds) return;
    if (baseIds.length === liveIds.length && baseIds.every((id, index) => id === liveIds[index])) {
      setLiveIds(null);
      liveIdsRef.current = null;
    }
  }, [baseIds, liveIds]);

  const sortableIds = liveIds ?? baseIds;
  const displayTasks = useMemo(
    () =>
      sortableIds
        .map((id) => tasksById.get(id))
        .filter((task): task is TaskDto => Boolean(task)),
    [sortableIds, tasksById],
  );

  const overlayTask = activeId ? tasksById.get(activeId) : null;

  function onDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    const initial = event.active.rect.current.initial;
    dragActiveRef.current = true;
    liveIdsRef.current = baseIds;
    setLiveIds(baseIds);
    setActiveId(id);
    setOverlayWidth(initial?.width);
    setOverlayHeight(initial?.height);
  }

  function onDragOver(event: DragOverEvent) {
    const ids = liveIdsRef.current;
    if (!ids || !dragActiveRef.current || !event.over) return;

    const draggedId = String(event.active.id);
    const overId = String(event.over.id);
    if (draggedId === overId) return;

    const activeIndex = ids.indexOf(draggedId);
    const overIndex = ids.indexOf(overId);
    if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) return;

    const next = arrayMove(ids, activeIndex, overIndex);
    liveIdsRef.current = next;
    setLiveIds(next);
  }

  function onDragEnd(_event: DragEndEvent) {
    if (!dragActiveRef.current) return;
    dragActiveRef.current = false;
    setActiveId(null);
    setOverlayWidth(undefined);
    setOverlayHeight(undefined);

    const live = liveIdsRef.current;
    if (!live) return;

    const changed = live.some((id, index) => id !== baseIds[index]);
    if (!changed) {
      liveIdsRef.current = null;
      setLiveIds(null);
      return;
    }

    void Promise.resolve(onReorderSubtasks(live)).catch(() => {
      liveIdsRef.current = null;
      setLiveIds(null);
    });
  }

  function onDragCancel() {
    if (!dragActiveRef.current) return;
    dragActiveRef.current = false;
    liveIdsRef.current = null;
    setLiveIds(null);
    setActiveId(null);
    setOverlayWidth(undefined);
    setOverlayHeight(undefined);
  }

  return (
    <DndContext
      collisionDetection={collisionDetection}
      measuring={measuring}
      onDragCancel={onDragCancel}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragStart={onDragStart}
      sensors={sensors}
    >
      <TaskGroup
        addLabel="Unteraufgabe hinzufügen"
        addNamePlaceholder="Unteraufgabenname"
        count={subtasks.length}
        onAddSubmit={async ({ title, description }) => {
          await onCreateSubtask({
            parentTaskId,
            title,
            description: description || undefined,
          });
        }}
        title="Unteraufgaben"
      >
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          {displayTasks.map((subtask) => (
            <SortableSubtaskRow
              key={subtask.id}
              onOpen={onOpenSubtask}
              onToggleCompleted={onToggleCompleted}
              tags={resolveTags(subtask.labelIds)}
              task={subtask}
            />
          ))}
        </SortableContext>
      </TaskGroup>

      {typeof document !== "undefined"
        ? createPortal(
            <DragOverlay dropAnimation={null} style={{ zIndex: 100 }}>
              {overlayTask ? (
                <DnDGhostShell>
                  <div
                    data-modal-subtask-ghost=""
                    style={{
                      boxSizing: "border-box",
                      width: overlayWidth ?? undefined,
                      ...(overlayHeight
                        ? {
                            height: overlayHeight,
                            maxHeight: overlayHeight,
                            minHeight: overlayHeight,
                            overflow: "hidden",
                          }
                        : {}),
                    }}
                  >
                    <TaskListItem
                      completed={overlayTask.isCompleted}
                      due={formatDueLabel(overlayTask.dueDate)}
                      priority={overlayTask.priority}
                      state="dragged"
                      style={{
                        boxSizing: "border-box",
                        height: "100%",
                        width: "100%",
                      }}
                      tags={resolveTags(overlayTask.labelIds)}
                      title={overlayTask.title}
                    />
                  </div>
                </DnDGhostShell>
              ) : null}
            </DragOverlay>,
            document.body,
          )
        : null}
    </DndContext>
  );
}
