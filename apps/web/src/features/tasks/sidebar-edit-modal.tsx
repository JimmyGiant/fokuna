"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
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
import {
  normalizeTasksSidebarPreferences,
  type TasksSidebarHideableId,
  type TasksSidebarNavReorderId,
  type TasksSidebarPreferences,
  type TasksSidebarSectionId,
} from "@fokuna/domain";
import { FokunaIcon } from "@fokuna/icons";
import { Button, Modal } from "@fokuna/ui";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { DnDGhostShell } from "@/components/dnd/dnd-ghost-shell";
import { sortableItemStyle } from "@/components/dnd/sortable-styles";

import styles from "./sidebar-edit-modal.module.css";

const NAV_LABELS: Record<TasksSidebarNavReorderId | "all", string> = {
  all: "Alle Aufgaben",
  favorites: "Favoriten",
  today: "Heute",
  inbox: "Eingang",
};

const SECTION_LABELS: Record<TasksSidebarSectionId, string> = {
  categories: "Kategorien",
  goals: "Ziele",
  labels: "Labels",
  priority: "Priorität",
};

const NAV_HIDEABLE = new Set<string>(["favorites", "today"]);
const animateLayoutChanges: AnimateLayoutChanges = () => false;

function isNavHideable(id: string): id is Extract<TasksSidebarHideableId, "favorites" | "today"> {
  return NAV_HIDEABLE.has(id);
}

function SortableEditRow({
  id,
  label,
  visible,
  showVisibility,
  onToggleVisibility,
}: {
  id: string;
  label: string;
  visible: boolean;
  showVisibility: boolean;
  onToggleVisibility?: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id,
    animateLayoutChanges,
    transition: null,
  });

  return (
    <li
      aria-roledescription="sortable"
      className={styles.row}
      data-hidden={visible ? undefined : "true"}
      data-placeholder={isDragging || undefined}
      ref={setNodeRef}
      style={sortableItemStyle({
        transform: null,
        transition: undefined,
        layoutControlled: true,
      })}
      {...(isDragging ? {} : { ...attributes, ...listeners })}
    >
      <span aria-hidden="true" className={styles.drag}>
        <FokunaIcon name="drag-handle-grid" size={16} stroke={1.5} />
      </span>
      <span className={styles.label}>{label}</span>
      {showVisibility ? (
        <button
          aria-label={visible ? `${label} ausblenden` : `${label} einblenden`}
          className={styles.visibility}
          onClick={(event) => {
            event.stopPropagation();
            onToggleVisibility?.();
          }}
          onPointerDown={(event) => event.stopPropagation()}
          type="button"
        >
          <FokunaIcon name={visible ? "eye" : "eye-slash"} size={16} stroke={1.5} />
        </button>
      ) : (
        <span aria-hidden="true" className={styles.visibilitySpacer} />
      )}
    </li>
  );
}

function FixedRow({ label }: { label: string }) {
  return (
    <li className={styles.row} data-fixed="true">
      <span aria-hidden="true" className={styles.dragSpacer} />
      <span className={styles.label}>{label}</span>
      <span aria-hidden="true" className={styles.visibilitySpacer} />
    </li>
  );
}

function GhostRow({ label }: { label: string }) {
  return (
    <li className={styles.row} data-dragging="true">
      <span className={styles.drag}>
        <FokunaIcon name="drag-handle-grid" size={16} stroke={1.5} />
      </span>
      <span className={styles.label}>{label}</span>
      <span aria-hidden="true" className={styles.visibilitySpacer} />
    </li>
  );
}

function portalOverlay(node: ReactNode) {
  if (typeof document === "undefined") return null;
  return createPortal(node, document.body);
}

export function SidebarEditModal({
  open,
  onOpenChange,
  value,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: TasksSidebarPreferences;
  onSave: (next: TasksSidebarPreferences) => Promise<void>;
}) {
  const [draft, setDraft] = useState<TasksSidebarPreferences>(() =>
    normalizeTasksSidebarPreferences(value),
  );
  const [busy, setBusy] = useState(false);
  const [activeNavId, setActiveNavId] = useState<TasksSidebarNavReorderId | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<TasksSidebarSectionId | null>(null);

  const navSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const sectionSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  useEffect(() => {
    if (!open) return;
    setDraft(normalizeTasksSidebarPreferences(value));
    setBusy(false);
    setActiveNavId(null);
    setActiveSectionId(null);
  }, [open, value]);

  const hidden = useMemo(() => new Set(draft.hiddenIds), [draft.hiddenIds]);

  function toggleHidden(id: TasksSidebarHideableId) {
    setDraft((current) => {
      const nextHidden = new Set(current.hiddenIds);
      if (nextHidden.has(id)) nextHidden.delete(id);
      else nextHidden.add(id);
      return normalizeTasksSidebarPreferences({
        ...current,
        hiddenIds: [...nextHidden],
      });
    });
  }

  function reorderNav(activeId: string, overId: string) {
    setDraft((current) => {
      const ids = [...current.navOrder];
      const from = ids.indexOf(activeId as TasksSidebarNavReorderId);
      const to = ids.indexOf(overId as TasksSidebarNavReorderId);
      if (from < 0 || to < 0 || from === to) return current;
      return normalizeTasksSidebarPreferences({
        ...current,
        navOrder: arrayMove(ids, from, to),
      });
    });
  }

  function reorderSection(activeId: string, overId: string) {
    setDraft((current) => {
      const ids = [...current.sectionOrder];
      const from = ids.indexOf(activeId as TasksSidebarSectionId);
      const to = ids.indexOf(overId as TasksSidebarSectionId);
      if (from < 0 || to < 0 || from === to) return current;
      return normalizeTasksSidebarPreferences({
        ...current,
        sectionOrder: arrayMove(ids, from, to),
      });
    });
  }

  function handleNavDragStart(event: DragStartEvent) {
    setActiveNavId(String(event.active.id) as TasksSidebarNavReorderId);
  }

  function handleNavDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    reorderNav(String(active.id), String(over.id));
  }

  function handleNavDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveNavId(null);
    if (!over || active.id === over.id) return;
    reorderNav(String(active.id), String(over.id));
  }

  function handleSectionDragStart(event: DragStartEvent) {
    setActiveSectionId(String(event.active.id) as TasksSidebarSectionId);
  }

  function handleSectionDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    reorderSection(String(active.id), String(over.id));
  }

  function handleSectionDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveSectionId(null);
    if (!over || active.id === over.id) return;
    reorderSection(String(active.id), String(over.id));
  }

  async function handleSave() {
    if (busy) return;
    setBusy(true);
    try {
      await onSave(normalizeTasksSidebarPreferences(draft));
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      className={styles.modal}
      footer={
        <>
          <Button
            buttonType="outline"
            disabled={busy}
            intent="tertiary"
            onClick={() => onOpenChange(false)}
            trailingIcon={null}
            type="button"
          >
            Abbrechen
          </Button>
          <Button disabled={busy} onClick={() => void handleSave()} trailingIcon={null} type="button">
            Speichern
          </Button>
        </>
      }
      onOpenChange={onOpenChange}
      open={open}
      size="sm"
      title="Seitenleiste bearbeiten"
    >
      <div className={styles.body}>
        <DndContext
          collisionDetection={closestCenter}
          onDragCancel={() => setActiveNavId(null)}
          onDragEnd={handleNavDragEnd}
          onDragOver={handleNavDragOver}
          onDragStart={handleNavDragStart}
          sensors={navSensors}
        >
          <ul className={styles.list}>
            <FixedRow label={NAV_LABELS.all} />
            <SortableContext items={draft.navOrder} strategy={verticalListSortingStrategy}>
              {draft.navOrder.map((id) => (
                <SortableEditRow
                  id={id}
                  key={id}
                  label={NAV_LABELS[id]}
                  onToggleVisibility={isNavHideable(id) ? () => toggleHidden(id) : undefined}
                  showVisibility={isNavHideable(id)}
                  visible={!isNavHideable(id) || !hidden.has(id)}
                />
              ))}
            </SortableContext>
          </ul>
          {portalOverlay(
            <DragOverlay dropAnimation={null} style={{ zIndex: 200 }}>
              {activeNavId ? (
                <DnDGhostShell>
                  <ul className={styles.list}>
                    <GhostRow label={NAV_LABELS[activeNavId]} />
                  </ul>
                </DnDGhostShell>
              ) : null}
            </DragOverlay>,
          )}
        </DndContext>

        <DndContext
          collisionDetection={closestCenter}
          onDragCancel={() => setActiveSectionId(null)}
          onDragEnd={handleSectionDragEnd}
          onDragOver={handleSectionDragOver}
          onDragStart={handleSectionDragStart}
          sensors={sectionSensors}
        >
          <SortableContext items={draft.sectionOrder} strategy={verticalListSortingStrategy}>
            <ul className={styles.list}>
              {draft.sectionOrder.map((id) => (
                <SortableEditRow
                  id={id}
                  key={id}
                  label={SECTION_LABELS[id]}
                  onToggleVisibility={() => toggleHidden(id)}
                  showVisibility
                  visible={!hidden.has(id)}
                />
              ))}
            </ul>
          </SortableContext>
          {portalOverlay(
            <DragOverlay dropAnimation={null} style={{ zIndex: 200 }}>
              {activeSectionId ? (
                <DnDGhostShell>
                  <ul className={styles.list}>
                    <GhostRow label={SECTION_LABELS[activeSectionId]} />
                  </ul>
                </DnDGhostShell>
              ) : null}
            </DragOverlay>,
          )}
        </DndContext>
      </div>
    </Modal>
  );
}
