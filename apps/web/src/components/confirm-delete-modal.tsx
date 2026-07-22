"use client";

import { Button, Modal } from "@fokuna/ui";
import { useState, type ReactNode } from "react";

import styles from "./confirm-delete-modal.module.css";

export type DeleteEntityKind = "task" | "category" | "label";

function Emph({ children }: { children: ReactNode }) {
  return <span className={styles.emphasis}>{children}</span>;
}

export function deleteConfirmCopy(
  kind: DeleteEntityKind,
  name: string,
  options?: { taskCount?: number },
): {
  title: string;
  description: ReactNode;
  confirmLabel: string;
} {
  const quotedName = <Emph>„{name}“</Emph>;
  switch (kind) {
    case "task":
      return {
        title: "Aufgabe wirklich löschen?",
        description: <>Die Aufgabe {quotedName} wird unwiderruflich entfernt.</>,
        confirmLabel: "Löschen",
      };
    case "category": {
      const count = options?.taskCount ?? 0;
      const tasksLabel =
        count === 1 ? <Emph>1 Aufgabe</Emph> : <Emph>{count} Aufgaben</Emph>;
      return {
        title: "Kategorie wirklich löschen?",
        description:
          count > 0 ? (
            <>
              Die Kategorie {quotedName} und ihre {tasksLabel} werden unwiderruflich entfernt.
            </>
          ) : (
            <>Die Kategorie {quotedName} wird unwiderruflich entfernt.</>
          ),
        confirmLabel: "Löschen",
      };
    }
    case "label":
      return {
        title: "Label wirklich löschen?",
        description: (
          <>
            Das Label {quotedName} wird unwiderruflich entfernt. Alle Aufgaben bleiben bestehen,
            verlieren aber das Label.
          </>
        ),
        confirmLabel: "Löschen",
      };
  }
}

export function ConfirmDeleteModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Löschen",
  cancelLabel = "Abbrechen",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
}) {
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    if (busy) return;
    setBusy(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      className={styles.confirmDelete}
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
            {cancelLabel}
          </Button>
          <Button
            disabled={busy}
            loading={busy}
            onClick={() => void handleConfirm()}
            trailingIcon={null}
            type="button"
          >
            {confirmLabel}
          </Button>
        </>
      }
      onOpenChange={(next) => {
        if (busy && !next) return;
        onOpenChange(next);
      }}
      open={open}
      size="sm"
      title={title}
    >
      <p className={styles.message}>{description}</p>
    </Modal>
  );
}
