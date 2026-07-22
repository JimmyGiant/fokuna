"use client";

import {
  DndContext,
  MeasuringStrategy,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragCancelEvent,
  type DragEndEvent,
  type DragMoveEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

import { parseSidebarDropTarget } from "./taxonomy";

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

export type TasksListDndHandlers = {
  onDragStart: (event: DragStartEvent) => void;
  onDragMove: (event: DragMoveEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDragCancel: (event?: DragCancelEvent) => void;
};

type TasksDndHostContextValue = {
  registerListHandlers: (handlers: TasksListDndHandlers) => () => void;
};

const TasksDndHostContext = createContext<TasksDndHostContextValue | null>(null);

export function useTasksListDndRegistration(handlers: TasksListDndHandlers) {
  const host = useContext(TasksDndHostContext);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!host) return;
    return host.registerListHandlers({
      onDragStart: (event) => handlersRef.current.onDragStart(event),
      onDragMove: (event) => handlersRef.current.onDragMove(event),
      onDragOver: (event) => handlersRef.current.onDragOver(event),
      onDragEnd: (event) => handlersRef.current.onDragEnd(event),
      onDragCancel: (event) => handlersRef.current.onDragCancel(event),
    });
  }, [host]);
}

export function TasksDndHost({
  children,
  onSidebarDrop,
}: {
  children: ReactNode;
  onSidebarDrop: (taskId: string, overId: string) => Promise<boolean> | boolean;
}) {
  const listHandlersRef = useRef<TasksListDndHandlers | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const value = useMemo<TasksDndHostContextValue>(
    () => ({
      registerListHandlers: (handlers) => {
        listHandlersRef.current = handlers;
        return () => {
          if (listHandlersRef.current === handlers) {
            listHandlersRef.current = null;
          }
        };
      },
    }),
    [],
  );

  return (
    <TasksDndHostContext.Provider value={value}>
      <DndContext
        collisionDetection={collisionDetection}
        measuring={measuring}
        onDragCancel={(event) => {
          listHandlersRef.current?.onDragCancel(event);
        }}
        onDragEnd={(event) => {
          const overId = event.over ? String(event.over.id) : null;
          const target = parseSidebarDropTarget(overId);
          if (target && event.active) {
            void Promise.resolve(onSidebarDrop(String(event.active.id), overId!)).finally(() => {
              listHandlersRef.current?.onDragCancel();
            });
            return;
          }
          listHandlersRef.current?.onDragEnd(event);
        }}
        onDragMove={(event) => {
          if (parseSidebarDropTarget(event.over ? String(event.over.id) : null)) {
            return;
          }
          listHandlersRef.current?.onDragMove(event);
        }}
        onDragOver={(event) => {
          if (parseSidebarDropTarget(event.over ? String(event.over.id) : null)) {
            return;
          }
          listHandlersRef.current?.onDragOver(event);
        }}
        onDragStart={(event) => {
          listHandlersRef.current?.onDragStart(event);
        }}
        sensors={sensors}
      >
        {children}
      </DndContext>
    </TasksDndHostContext.Provider>
  );
}
