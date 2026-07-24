"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
  type AnimateLayoutChanges,
} from "@dnd-kit/sortable";
import type { BlockDto, CreateBlockInput } from "@fokuna/api-contracts";
import { FokunaIcon, type IconName } from "@fokuna/icons";
import {
  BlockCard,
  BlockTile,
  Button,
  FokunaContextMenu,
  MetaMenu,
  PageHeader,
  SearchField,
  TabBar,
  useToast,
  type BlockRailItem,
  type BlockTone,
  type FokunaContextMenuEntry,
} from "@fokuna/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal, flushSync } from "react-dom";

import {
  ConfirmDeleteModal,
  deleteConfirmCopy,
} from "@/components/confirm-delete-modal";
import { DnDGhostShell, sortableItemStyle } from "@/components/dnd";
import { apiGet, apiSend } from "@/lib/api";

import { BlockDetailModal } from "./block-detail-modal";
import {
  BlockEditOverlay,
  draftToUpdateInput,
  type BlockEditDraft,
} from "./block-edit-overlay";
import {
  MAX_BLOCK_RAIL,
  blockIcon,
  blockMetaTags,
  blockSourceKind,
  blockTone,
  blockWeekBadge,
  formatDurationLabel,
} from "./block-utils";
import { useBlocksPreferences } from "./use-blocks-preferences";
import styles from "./blocks-view.module.css";

type BlockTab = "all" | "own" | "goals" | "templates";

/** Skip post-drop layout animation; live onDragOver owns order while dragging. */
const railAnimateLayoutChanges: AnimateLayoutChanges = () => false;

/** Dock-like poof duration — keep in sync with `fk-block-tile-poof` (`--fk-motion-duration-slow` = 240ms). */
const RAIL_POOF_MS = 240;

type RailPoof = {
  blockId: string;
  icon: IconName;
  tone: BlockTone;
  badge?: number | string;
  left: number;
  top: number;
};

function prefersReducedMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function sameRailIds(a: string[], b: string[]) {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

function isRailDropTarget(overId: string | number | undefined, overType: unknown) {
  if (overId == null) return false;
  return (
    overId === "block-rail-drop" ||
    overType === "rail" ||
    overType === "rail-drop" ||
    String(overId).startsWith("rail:")
  );
}

/** Prefer pointer hit (icon under cursor) over card-rect closestCenter. */
const blocksCollisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  if (pointerHits.length > 0) return pointerHits;
  return closestCenter(args);
};

function isOwn(block: BlockDto) {
  return blockSourceKind(block) === "own";
}

function isGoal(block: BlockDto) {
  return blockSourceKind(block) === "goal";
}

function isTemplate(block: BlockDto) {
  return blockSourceKind(block) === "template";
}

function LibraryCard({
  block,
  menu,
  onOpen,
}: {
  block: BlockDto;
  menu: ReactNode;
  onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library:${block.id}`,
    data: { type: "library", blockId: block.id },
  });

  return (
    <div
      className={styles.cardDrag}
      data-dragging={isDragging || undefined}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      <BlockCard
        badge={blockWeekBadge(block)}
        description={block.description ?? undefined}
        durationLabel={formatDurationLabel(block.durationMinutes)}
        icon={blockIcon(block)}
        menu={menu}
        meta={blockMetaTags(block)}
        onClick={onOpen}
        role="button"
        tabIndex={0}
        title={block.title}
        tone={blockTone(block)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpen();
          }
        }}
      />
    </div>
  );
}

function SortableRailTile({
  item,
  layoutLocked,
  exiting,
  onRemove,
}: {
  item: BlockRailItem;
  /** Suppress transforms for the whole rail while a rail item is dragging (live DOM reorder). */
  layoutLocked: boolean;
  exiting: boolean;
  onRemove: (blockId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `rail:${item.id}`,
    animateLayoutChanges: railAnimateLayoutChanges,
    data: { type: "rail", blockId: item.id },
    disabled: exiting,
  });

  const menuItems: FokunaContextMenuEntry[] = [
    {
      label: "Aus Favoriten entfernen",
      icon: "star",
      onSelect: () => onRemove(item.id),
    },
  ];

  return (
    <FokunaContextMenu items={menuItems}>
      <li
        ref={setNodeRef}
        data-exiting={exiting || undefined}
        data-placeholder={isDragging || undefined}
        style={sortableItemStyle({
          transform,
          transition,
          layoutControlled: layoutLocked || isDragging || exiting,
        })}
      >
        <BlockTile
          badge={item.badge}
          icon={item.icon}
          label={item.label}
          tone={item.tone}
          {...(isDragging || exiting ? {} : { ...attributes, ...listeners })}
        />
      </li>
    </FokunaContextMenu>
  );
}

export function BlocksView() {
  const [tab, setTab] = useState<BlockTab>("all");
  const [search, setSearch] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeDrag, setActiveDrag] = useState<{
    blockId: string;
    from: "library" | "rail";
  } | null>(null);
  /** Local rail order while dragging — persist only on drag end (not every over). */
  const [railDraftIds, setRailDraftIds] = useState<string[] | null>(null);
  /** Library-card measure so DragOverlay host matches card; icon stays centered under cursor. */
  const [dragOverlayBox, setDragOverlayBox] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [exitingId, setExitingId] = useState<string | null>(null);
  const [railPoof, setRailPoof] = useState<RailPoof | null>(null);
  const poofTimerRef = useRef<number | null>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const railDropNodeRef = useRef<HTMLElement | null>(null);
  /** Snapshot of rail ids at drag start — undo source of truth after remove. */
  const railOriginIdsRef = useRef<string[]>([]);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { prefs, setRailIds, addToRail, dismissHubHint, railHasSlot } = useBlocksPreferences();
  const activeRailIds = railDraftIds ?? prefs.railIds;

  useEffect(() => {
    return () => {
      if (poofTimerRef.current != null) {
        window.clearTimeout(poofTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!activeDrag) {
      pointerRef.current = null;
      return;
    }
    const track = (event: PointerEvent) => {
      pointerRef.current = { x: event.clientX, y: event.clientY };
    };
    window.addEventListener("pointermove", track, { passive: true });
    return () => window.removeEventListener("pointermove", track);
  }, [activeDrag]);

  const blocksQuery = useQuery({
    queryKey: ["blocks"],
    queryFn: () => apiGet<BlockDto[]>("/api/v1/blocks"),
  });

  const blocks = useMemo(() => blocksQuery.data ?? [], [blocksQuery.data]);
  const blocksById = useMemo(() => new Map(blocks.map((block) => [block.id, block])), [blocks]);

  const createMutation = useMutation({
    mutationFn: (input: CreateBlockInput) => apiSend<BlockDto>("/api/v1/blocks", "POST", input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["blocks"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: ReturnType<typeof draftToUpdateInput> }) =>
      apiSend<BlockDto>(`/api/v1/blocks/${id}`, "PATCH", input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["blocks"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiSend<{ id: string }>(`/api/v1/blocks/${id}`, "DELETE"),
    onSuccess: async (_data, id) => {
      setRailIds(prefs.railIds.filter((railId) => railId !== id));
      await queryClient.invalidateQueries({ queryKey: ["blocks"] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) =>
      apiSend<BlockDto>(`/api/v1/blocks/${id}/duplicate`, "POST", { asOwn: true }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["blocks"] });
    },
  });

  const ownBlocks = useMemo(() => blocks.filter(isOwn), [blocks]);
  const goalBlocks = useMemo(() => blocks.filter(isGoal), [blocks]);
  const templateBlocks = useMemo(() => blocks.filter(isTemplate), [blocks]);

  const sections = useMemo(() => {
    const match = (list: BlockDto[]) => {
      const query = search.trim().toLowerCase();
      if (!query) return list;
      return list.filter(
        (block) =>
          block.title.toLowerCase().includes(query) ||
          (block.description ?? "").toLowerCase().includes(query),
      );
    };
    if (tab === "own") return [{ id: "own", title: "Eigene", blocks: match(ownBlocks) }];
    if (tab === "goals") return [{ id: "goals", title: "Ziele", blocks: match(goalBlocks) }];
    if (tab === "templates") {
      return [{ id: "templates", title: "Vorlagen", blocks: match(templateBlocks) }];
    }
    return [
      { id: "own", title: "Eigene", blocks: match(ownBlocks) },
      { id: "goals", title: "Ziele", blocks: match(goalBlocks) },
      { id: "templates", title: "Vorlagen", blocks: match(templateBlocks) },
    ];
  }, [tab, search, ownBlocks, goalBlocks, templateBlocks]);

  const railItems: BlockRailItem[] = activeRailIds
    .map((id) => blocksById.get(id))
    .filter((block): block is BlockDto => Boolean(block))
    .map((block) => ({
      id: block.id,
      label: block.title,
      icon: blockIcon(block),
      tone: blockTone(block),
      badge: blockWeekBadge(block),
    }));

  const emptySlots = Math.max(0, MAX_BLOCK_RAIL - railItems.length);
  const railDragActive = activeDrag?.from === "rail";
  const { setNodeRef: setRailDroppableRef, isOver: railIsOver } = useDroppable({
    id: "block-rail-drop",
    data: { type: "rail-drop" },
  });
  const setRailDropRef = useCallback(
    (node: HTMLElement | null) => {
      railDropNodeRef.current = node;
      setRailDroppableRef(node);
    },
    [setRailDroppableRef],
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const detailBlock = detailId ? (blocksById.get(detailId) ?? null) : null;
  const editBlock = editId ? (blocksById.get(editId) ?? null) : null;
  const deleteBlock = deleteId ? (blocksById.get(deleteId) ?? null) : null;
  const dragBlock = activeDrag ? blocksById.get(activeDrag.blockId) : null;

  function cardMenu(block: BlockDto) {
    const kind = blockSourceKind(block);
    const inFavorites = prefs.railIds.includes(block.id);
    const items = [];

    if (inFavorites) {
      items.push({
        label: "Aus Favoriten entfernen",
        icon: "star" as const,
        onSelect: () => {
          commitRemoveFromRail(block.id, [...prefs.railIds]);
        },
      });
    } else {
      items.push({
        label: "Zu Favoriten",
        icon: "star" as const,
        disabled: !railHasSlot,
        onSelect: () => {
          addToRail(block.id);
          dismissHubHint();
        },
      });
    }

    if (kind === "own") {
      items.push(
        {
          label: "Bearbeiten",
          icon: "edit" as const,
          onSelect: () => setEditId(block.id),
        },
        {
          label: "Duplizieren",
          icon: "layers" as const,
          onSelect: () => void duplicateMutation.mutateAsync(block.id),
        },
        {
          label: "Löschen",
          icon: "delete" as const,
          destructive: true,
          onSelect: () => setDeleteId(block.id),
        },
      );
    }
    if (kind === "template") {
      items.push({
        label: "Duplizieren als eigene",
        icon: "layers" as const,
        onSelect: () => void duplicateMutation.mutateAsync(block.id),
      });
    }
    return (
      <div
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <MetaMenu
          items={items}
          label={`Optionen für ${block.title}`}
          trigger={
            <Button
              aria-label={`Optionen für ${block.title}`}
              buttonType="outline"
              iconOnly
              intent="tertiary"
              leadingIcon="more-vertical"
              onClick={(event) => event.stopPropagation()}
              size="sm"
              type="button"
            >
              Optionen
            </Button>
          }
        />
      </div>
    );
  }

  function isPointerInsideRail() {
    const pointer = pointerRef.current;
    const node = railDropNodeRef.current;
    if (!pointer || !node) return false;
    const rect = node.getBoundingClientRect();
    const pad = 12;
    return (
      pointer.x >= rect.left - pad &&
      pointer.x <= rect.right + pad &&
      pointer.y >= rect.top - pad &&
      pointer.y <= rect.bottom + pad
    );
  }

  function isPointerOutsideRail() {
    return pointerRef.current != null && railDropNodeRef.current != null && !isPointerInsideRail();
  }

  function handleDragStart(event: DragStartEvent) {
    const blockId = String(event.active.data.current?.blockId ?? "");
    const from = event.active.data.current?.type === "rail" ? "rail" : "library";
    if (!blockId) return;
    const activator = event.activatorEvent;
    if (activator && "clientX" in activator && "clientY" in activator) {
      pointerRef.current = {
        x: (activator as PointerEvent).clientX,
        y: (activator as PointerEvent).clientY,
      };
    }
    if (from === "rail") {
      railOriginIdsRef.current = [...prefs.railIds];
      setRailDraftIds([...prefs.railIds]);
      setDragOverlayBox(null);
    } else {
      const initial = event.active.rect.current.initial;
      setDragOverlayBox(
        initial ? { width: initial.width, height: initial.height } : null,
      );
    }
    setActiveDrag({ blockId, from });
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.data.current?.type !== "rail" || over.data.current?.type !== "rail") {
      return;
    }
    const activeBlockId = String(active.data.current?.blockId ?? "");
    const overBlockId = String(over.data.current?.blockId ?? "");
    if (!activeBlockId || !overBlockId || activeBlockId === overBlockId) return;

    setRailDraftIds((current) => {
      const ids = current ?? prefs.railIds;
      const oldIndex = ids.indexOf(activeBlockId);
      const newIndex = ids.indexOf(overBlockId);
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return current;
      return arrayMove(ids, oldIndex, newIndex);
    });
  }

  function clearDragSession() {
    setActiveDrag(null);
    setRailDraftIds(null);
    setDragOverlayBox(null);
    railOriginIdsRef.current = [];
  }

  function clearPoofTimer() {
    if (poofTimerRef.current != null) {
      window.clearTimeout(poofTimerRef.current);
      poofTimerRef.current = null;
    }
  }

  function notifyRemovedFromFavorites(previousIds: string[]) {
    toast({
      id: "block-rail-remove",
      title: "Zeitblock aus Favoriten entfernt",
      action: {
        label: "Rückgängig",
        altText: "Zeitblock wieder zur Favoritenleiste hinzufügen",
        leadingIcon: "arrow-undo-down",
        onClick: () => {
          setRailIds(previousIds.slice(0, MAX_BLOCK_RAIL));
        },
      },
    });
  }

  function commitRemoveFromRail(blockId: string, previousIds: string[]) {
    const next = previousIds.filter((id) => id !== blockId);
    flushSync(() => {
      setRailIds(next);
    });
    notifyRemovedFromFavorites(previousIds);
  }

  function removeRailFavoriteInPlace(blockId: string) {
    const previousIds = [...prefs.railIds];
    if (!previousIds.includes(blockId) || exitingId || railPoof) return;

    if (prefersReducedMotion()) {
      commitRemoveFromRail(blockId, previousIds);
      return;
    }

    setExitingId(blockId);
    clearPoofTimer();
    poofTimerRef.current = window.setTimeout(() => {
      setExitingId(null);
      poofTimerRef.current = null;
      commitRemoveFromRail(blockId, previousIds);
    }, RAIL_POOF_MS);
  }

  function removeRailFavoriteAtPoint(
    blockId: string,
    previousIds: string[],
    point: { left: number; top: number } | null,
  ) {
    const block = blocksById.get(blockId);
    flushSync(() => {
      setRailIds(previousIds.filter((id) => id !== blockId));
    });

    if (!block || prefersReducedMotion()) {
      notifyRemovedFromFavorites(previousIds);
      return;
    }

    const tile = 40;
    const pointer = pointerRef.current;
    const left = point?.left ?? (pointer ? pointer.x - tile / 2 : null);
    const top = point?.top ?? (pointer ? pointer.y - tile / 2 : null);
    if (left == null || top == null) {
      notifyRemovedFromFavorites(previousIds);
      return;
    }

    flushSync(() => {
      setRailPoof({
        blockId,
        icon: blockIcon(block),
        tone: blockTone(block),
        badge: blockWeekBadge(block),
        left,
        top,
      });
    });
    clearPoofTimer();
    poofTimerRef.current = window.setTimeout(() => {
      setRailPoof(null);
      poofTimerRef.current = null;
      notifyRemovedFromFavorites(previousIds);
    }, RAIL_POOF_MS);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const activeBlockId = String(active.data.current?.blockId ?? "");
    if (!activeBlockId) {
      clearDragSession();
      return;
    }

    const overType = over?.data.current?.type;
    const overBlockId =
      overType === "rail" ? String(over?.data.current?.blockId ?? "") : undefined;
    const overRail = isRailDropTarget(over?.id, overType);

    if (active.data.current?.type === "library") {
      // Icon is snapped to cursor; card collision rect often misses the thin rail.
      const dropOnRail = overRail || isPointerInsideRail();
      if (dropOnRail) {
        if (prefs.railIds.includes(activeBlockId)) {
          toast({
            id: "block-rail-already",
            title: "Zeitblock ist bereits Teil der Favoriten",
          });
          clearDragSession();
          return;
        }
        if (prefs.railIds.length >= MAX_BLOCK_RAIL) {
          clearDragSession();
          return;
        }
        const next = [...prefs.railIds];
        if (overBlockId && next.includes(overBlockId) && over) {
          const index = next.indexOf(overBlockId);
          const pointer = pointerRef.current;
          const midY = over.rect.top + over.rect.height / 2;
          const insertAt =
            pointer && pointer.y > midY ? index + 1 : index;
          next.splice(insertAt, 0, activeBlockId);
        } else {
          next.push(activeBlockId);
        }
        flushSync(() => {
          setRailIds(next.slice(0, MAX_BLOCK_RAIL));
        });
        dismissHubHint();
      }
      clearDragSession();
      return;
    }

    if (active.data.current?.type === "rail") {
      const dropOutside = isPointerOutsideRail();
      if (dropOutside) {
        const previousIds = [...railOriginIdsRef.current];
        const tile = 40;
        const pointer = pointerRef.current;
        const point = pointer
          ? { left: pointer.x - tile / 2, top: pointer.y - tile / 2 }
          : null;
        clearDragSession();
        removeRailFavoriteAtPoint(activeBlockId, previousIds, point);
        return;
      }

      const next = railDraftIds ?? railOriginIdsRef.current;
      if (!sameRailIds(next, prefs.railIds)) {
        flushSync(() => {
          setRailIds(next);
        });
      }
    }

    clearDragSession();
  }

  function handleDragCancel() {
    clearDragSession();
  }

  async function handleSaveEdit(draft: BlockEditDraft) {
    if (createOpen) {
      const input = draftToUpdateInput(draft);
      await createMutation.mutateAsync({
        title: input.title ?? "Neuer Zeitblock",
        description: input.description ?? undefined,
        durationMinutes: input.durationMinutes ?? 45,
        icon: input.icon ?? undefined,
        colorToken: input.colorToken ?? undefined,
        rhythm: input.rhythm ?? undefined,
        timerConfig: input.timerConfig ?? undefined,
        focusConfig: input.focusConfig ?? undefined,
        isTemplate: false,
      });
      setCreateOpen(false);
      return;
    }
    if (!editId) return;
    await updateMutation.mutateAsync({ id: editId, input: draftToUpdateInput(draft) });
    setEditId(null);
  }

  return (
    <DndContext
      collisionDetection={blocksCollisionDetection}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <div className={styles.page}>
        <div className={styles.header}>
          <PageHeader
            actions={
              <>
                {/* Overflow visual per Figma; menu items not specified — no invented actions. */}
                <button
                  aria-label="Weitere Aktionen"
                  className="fk-meta-trigger"
                  data-size="md"
                  type="button"
                >
                  <FokunaIcon name="more-vertical" size={16} stroke={1.5} />
                </button>
                <SearchField
                  collapsedWidth={152}
                  expandedWidth={240}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Suchen..."
                  value={search}
                />
                <Button
                  leadingIcon="add-small"
                  onClick={() => {
                    setEditId(null);
                    setCreateOpen(true);
                  }}
                  trailingIcon={null}
                  type="button"
                >
                  Neuer Zeitblock
                </Button>
              </>
            }
            title="Zeitblöcke"
          />
        </div>

        <div className={styles.main}>
          <div className={styles.center}>
            <TabBar
              aria-label="Zeitblock-Ansichten"
              className={styles.tabs}
              items={[
                { value: "all", label: "Alle" },
                { value: "own", label: "Eigene" },
                { value: "goals", label: "Ziele" },
                { value: "templates", label: "Vorlagen" },
              ]}
              onValueChange={(value) => setTab(value as BlockTab)}
              size="lg"
              value={tab}
            />

            <div className={styles.content}>
              {sections.map((section) =>
                section.blocks.length === 0 && tab !== "all" ? (
                  <p className={styles.empty} key={section.id}>
                    Keine Zeitblöcke in „{section.title}“.
                  </p>
                ) : section.blocks.length === 0 ? null : (
                  <section className={styles.section} key={section.id}>
                    {tab === "all" ? (
                      <h2 className={styles.sectionTitle}>{section.title}</h2>
                    ) : null}
                    <div className={styles.grid}>
                      {section.blocks.map((block) => (
                        <LibraryCard
                          block={block}
                          key={block.id}
                          menu={cardMenu(block)}
                          onOpen={() => setDetailId(block.id)}
                        />
                      ))}
                    </div>
                  </section>
                ),
              )}
            </div>
          </div>
        </div>

        {!prefs.hubHintSeen ? (
          <div className={styles.hintLayer} aria-live="polite">
            {/* eslint-disable-next-line @next/next/no-img-element -- static handoff SVG asset */}
            <img
              alt="Elemente einfach in die Block Leiste ziehen"
              className={styles.hintArt}
              height={294}
              src="/blocks/zeitbloecke_empty_state.svg"
              width={228}
            />
          </div>
        ) : null}

        <aside className={styles.railAside}>
          <div
            className={styles.railDrop}
            data-over={railIsOver || undefined}
            ref={setRailDropRef}
          >
            <nav
              aria-label="Zeitblöcke bearbeiten"
              className={`fk-block-rail ${styles.rail}`}
              data-state="editable"
            >
              <SortableContext
                items={railItems.map((item) => `rail:${item.id}`)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="fk-block-rail__items">
                  {railItems.map((item) => (
                    <SortableRailTile
                      exiting={exitingId === item.id}
                      item={item}
                      key={item.id}
                      layoutLocked={railDragActive}
                      onRemove={removeRailFavoriteInPlace}
                    />
                  ))}
                  {Array.from({ length: emptySlots }, (_, index) => (
                    <li key={`empty-${index}`}>
                      <BlockTile empty label={`Freier Zeitblock-Slot ${index + 1}`} />
                    </li>
                  ))}
                </ul>
              </SortableContext>
            </nav>
          </div>
        </aside>
      </div>

      <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
        {dragBlock ? (
          <div
            className={styles.dragGhostHost}
            style={
              dragOverlayBox
                ? { width: dragOverlayBox.width, height: dragOverlayBox.height }
                : undefined
            }
          >
            <DnDGhostShell variant="compact">
              <BlockTile
                badge={blockWeekBadge(dragBlock)}
                icon={blockIcon(dragBlock)}
                label={dragBlock.title}
                tone={blockTone(dragBlock)}
              />
            </DnDGhostShell>
          </div>
        ) : null}
      </DragOverlay>

      {railPoof && typeof document !== "undefined"
        ? createPortal(
            <div
              aria-hidden="true"
              className="fk-block-tile-poof"
              style={{ left: railPoof.left, top: railPoof.top }}
            >
              <BlockTile
                badge={railPoof.badge}
                icon={railPoof.icon}
                label=""
                tone={railPoof.tone}
              />
            </div>,
            document.body,
          )
        : null}

      <BlockDetailModal
        block={detailBlock}
        onEdit={(block) => {
          setDetailId(null);
          setEditId(block.id);
        }}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
        open={Boolean(detailBlock)}
      />

      <BlockEditOverlay
        block={createOpen ? null : editBlock}
        key={createOpen ? "create" : editId ?? "closed"}
        mode={createOpen ? "create" : "edit"}
        onDelete={
          editBlock && isOwn(editBlock)
            ? () => {
                setDeleteId(editBlock.id);
              }
            : undefined
        }
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            setEditId(null);
          }
        }}
        onSave={handleSaveEdit}
        open={createOpen || Boolean(editBlock)}
      />

      {deleteBlock ? (
        <ConfirmDeleteModal
          {...deleteConfirmCopy("block", deleteBlock.title)}
          onConfirm={async () => {
            await deleteMutation.mutateAsync(deleteBlock.id);
            setDeleteId(null);
            setEditId(null);
            setDetailId(null);
          }}
          onOpenChange={(open) => {
            if (!open) setDeleteId(null);
          }}
          open={Boolean(deleteBlock)}
        />
      ) : null}
    </DndContext>
  );
}
