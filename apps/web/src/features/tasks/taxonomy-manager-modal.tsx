"use client";

import type { CategoryColorToken, CategoryDto, LabelDto } from "@fokuna/api-contracts";
import { FokunaIcon } from "@fokuna/icons";
import { Button, InputGroup, Modal, type ControlSize } from "@fokuna/ui";
import { useEffect, useId, useMemo, useState } from "react";

import {
  ConfirmDeleteModal,
  deleteConfirmCopy,
} from "@/components/confirm-delete-modal";
import { TAXONOMY_COLOR_OPTIONS, colorTokenToCssVar } from "./taxonomy";
import styles from "./taxonomy-manager-modal.module.css";

type TaxonomyKind = "category" | "label";
type TaxonomyItem = CategoryDto | LabelDto;

/** One control size for the whole create → manage → edit journey. */
const TAXONOMY_CONTROL_SIZE: ControlSize = "lg";

function defaultColor(kind: TaxonomyKind): CategoryColorToken {
  return kind === "category" ? "category.teal" : "category.coral";
}

function kindCopy(kind: TaxonomyKind) {
  if (kind === "category") {
    return {
      createTitle: "Neue Kategorie erstellen",
      nameLabel: "Name",
      namePlaceholder: "Name eingeben",
      createAction: "Kategorie erstellen",
      manageLink: "Kategorien verwalten",
      organizeTitle: "Kategorien verwalten",
      detailTitle: "Kategorie bearbeiten",
      empty: "Noch keine Kategorien.",
      deleteLabel: "Kategorie löschen",
      addNew: "Neue Kategorie",
      saveAction: "Speichern",
    };
  }
  return {
    createTitle: "Neues Label erstellen",
    nameLabel: "Name",
    namePlaceholder: "Name eingeben",
    createAction: "Label erstellen",
    manageLink: "Labels verwalten",
    organizeTitle: "Labels verwalten",
    detailTitle: "Label bearbeiten",
    empty: "Noch keine Labels.",
    deleteLabel: "Label löschen",
    addNew: "Neues Label",
    saveAction: "Speichern",
  };
}

function ColorField({
  value,
  onChange,
}: {
  value: CategoryColorToken;
  onChange: (token: CategoryColorToken) => void;
}) {
  const labelId = useId();

  return (
    <div className={styles.colorField} role="group" aria-labelledby={labelId}>
      <span className={styles.colorLabel} id={labelId}>
        Farbe
      </span>
      <div className={styles.swatches} role="listbox" aria-label="Farbe">
        {TAXONOMY_COLOR_OPTIONS.map((option) => (
          <button
            aria-label={option.label}
            aria-selected={value === option.token}
            className={styles.swatch}
            data-selected={value === option.token ? "true" : undefined}
            key={option.token}
            onClick={() => onChange(option.token)}
            style={{ background: option.cssVar }}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}

/** Create dialog (+ in sidebar / Neues hinzufügen): InputGroup + Farbe. Pattern Library §03. */
export function TaxonomyCreateModal({
  open,
  kind,
  onOpenChange,
  onCreate,
  onOpenManage,
}: {
  open: boolean;
  kind: TaxonomyKind;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: { name: string; colorToken: CategoryColorToken }) => Promise<void>;
  onOpenManage: () => void;
}) {
  const copy = kindCopy(kind);
  const [name, setName] = useState("");
  const [colorToken, setColorToken] = useState<CategoryColorToken>(() => defaultColor(kind));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setColorToken(defaultColor(kind));
      setBusy(false);
    }
  }, [open, kind]);

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      await onCreate({ name: trimmed, colorToken });
      setName("");
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      className={styles.taxonomyModal}
      footer={
        <>
          <Button
            buttonType="icon-text-inline"
            intent="tertiary"
            leadingIcon={<FokunaIcon name="edit" size={16} stroke={1.5} />}
            onClick={onOpenManage}
            type="button"
          >
            {copy.manageLink}
          </Button>
          <Button
            disabled={busy || !name.trim()}
            onClick={() => void handleCreate()}
            trailingIcon={<FokunaIcon name="chevron-right-small" size={16} stroke={1.5} />}
            type="button"
          >
            {copy.createAction}
          </Button>
        </>
      }
      onOpenChange={onOpenChange}
      open={open}
      size="sm"
      title={copy.createTitle}
    >
      <div className={styles.createForm}>
        <InputGroup
          autoFocus
          controlSize={TAXONOMY_CONTROL_SIZE}
          label={copy.nameLabel}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleCreate();
            }
          }}
          placeholder={copy.namePlaceholder}
          value={name}
        />
        <ColorField onChange={setColorToken} value={colorToken} />
      </div>
    </Modal>
  );
}

/**
 * Organizational mask: list → detail.
 * Pattern Library §03 — Organizational Modal (Create / List / Detail).
 */
export function TaxonomyOrganizeModal({
  open,
  kind,
  items,
  initialSelectedId = null,
  onOpenChange,
  onOpenCreate,
  onUpdate,
  onDelete,
  getDeleteTaskCount,
}: {
  open: boolean;
  kind: TaxonomyKind;
  items: TaxonomyItem[];
  /** Open directly on the edit detail for this entity (e.g. sidebar context menu). */
  initialSelectedId?: string | null;
  onOpenChange: (open: boolean) => void;
  onOpenCreate: () => void;
  onUpdate: (
    id: string,
    input: { name?: string; colorToken?: CategoryColorToken },
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  /** For categories: number of tasks (incl. descendants) removed with the category. */
  getDeleteTaskCount?: (id: string) => number;
}) {
  const copy = kindCopy(kind);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColorToken, setEditColorToken] = useState<CategoryColorToken>(() => defaultColor(kind));
  const [busy, setBusy] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  /** True when opened from sidebar context-menu edit — no list back navigation. */
  const [directEdit, setDirectEdit] = useState(false);

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  const canSave = Boolean(
    selected &&
      editName.trim() &&
      (editName.trim() !== selected.name || editColorToken !== selected.colorToken),
  );

  useEffect(() => {
    if (!open) {
      setSelectedId(null);
      setEditName("");
      setEditColorToken(defaultColor(kind));
      setBusy(false);
      setConfirmDeleteOpen(false);
      setDirectEdit(false);
      return;
    }
    setSelectedId(initialSelectedId);
    setDirectEdit(Boolean(initialSelectedId));
  }, [initialSelectedId, open, kind]);

  useEffect(() => {
    if (selected) {
      setEditName(selected.name);
      setEditColorToken(selected.colorToken);
    }
  }, [selected]);

  async function handleSave() {
    if (!selected || busy || !canSave) return;
    const trimmed = editName.trim();
    setBusy(true);
    try {
      await onUpdate(selected.id, { name: trimmed, colorToken: editColorToken });
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!selected || busy) return;
    setBusy(true);
    try {
      await onDelete(selected.id);
      if (directEdit) {
        onOpenChange(false);
      } else {
        setSelectedId(null);
      }
    } finally {
      setBusy(false);
    }
  }

  const deleteCopy = selected
    ? deleteConfirmCopy(kind, selected.name, {
        taskCount: kind === "category" ? (getDeleteTaskCount?.(selected.id) ?? 0) : undefined,
      })
    : null;

  return (
    <>
      <Modal
        className={styles.taxonomyModal}
        footer={
          selected ? (
            <>
              <Button
                buttonType="icon-text-inline"
                className={styles.deleteAction}
                disabled={busy}
                leadingIcon={<FokunaIcon name="delete-alt" size={16} stroke={1.5} />}
                onClick={() => setConfirmDeleteOpen(true)}
                type="button"
              >
                {copy.deleteLabel}
              </Button>
              <Button
                disabled={busy || !canSave}
                onClick={() => void handleSave()}
                trailingIcon={null}
                type="button"
              >
                {copy.saveAction}
              </Button>
            </>
          ) : (
            <>
              <Button
                buttonType="icon-text-inline"
                leadingIcon={<FokunaIcon name="add-small" size={16} stroke={1.5} />}
                onClick={onOpenCreate}
                type="button"
              >
                {copy.addNew}
              </Button>
              <span aria-hidden="true" />
            </>
          )
        }
        onOpenChange={onOpenChange}
        open={open}
        size="sm"
        title={selected ? copy.detailTitle : copy.organizeTitle}
      >
      <div className={styles.organize} data-view={selected ? "detail" : "list"}>
        {selected ? (
          <div className={styles.detail}>
            {!directEdit ? (
              <Button
                buttonType="icon-text-inline"
                className={styles.navAction}
                leadingIcon={<FokunaIcon name="chevron-left" size={16} stroke={1.5} />}
                onClick={() => setSelectedId(null)}
                type="button"
              >
                Zurück
              </Button>
            ) : null}

            <InputGroup
              controlSize={TAXONOMY_CONTROL_SIZE}
              label={copy.nameLabel}
              onChange={(event) => setEditName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleSave();
                }
              }}
              placeholder={copy.namePlaceholder}
              value={editName}
            />

            <ColorField onChange={setEditColorToken} value={editColorToken} />
          </div>
        ) : (
          <>
            <ul className={styles.catalog}>
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    className={styles.catalogRow}
                    onClick={() => {
                      setDirectEdit(false);
                      setSelectedId(item.id);
                    }}
                    type="button"
                  >
                    {kind === "category" ? (
                      <span
                        aria-hidden="true"
                        className={styles.dot}
                        style={{ background: colorTokenToCssVar(item.colorToken) }}
                      />
                    ) : (
                      <FokunaIcon
                        name="tag"
                        size={16}
                        stroke={1.5}
                        style={{ color: colorTokenToCssVar(item.colorToken) }}
                      />
                    )}
                    <span className={styles.name}>{item.name}</span>
                    <span aria-hidden="true" className={styles.chevron}>
                      <FokunaIcon name="chevron-right" size={16} stroke={1.5} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {items.length === 0 ? <p className={styles.empty}>{copy.empty}</p> : null}
          </>
        )}
      </div>
      </Modal>
      {deleteCopy ? (
        <ConfirmDeleteModal
          confirmLabel={deleteCopy.confirmLabel}
          description={deleteCopy.description}
          onConfirm={() => handleDelete()}
          onOpenChange={setConfirmDeleteOpen}
          open={confirmDeleteOpen}
          title={deleteCopy.title}
        />
      ) : null}
    </>
  );
}
