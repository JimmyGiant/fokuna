"use client";

import type { BlockDto } from "@fokuna/api-contracts";
import { FokunaIcon } from "@fokuna/icons";
import { Button, InsightActivityPanel, Modal, Tag } from "@fokuna/ui";

import {
  blockIcon,
  blockTone,
  formatDurationLabel,
  musicLabelFromBlock,
} from "./block-utils";
import styles from "./block-detail-modal.module.css";

function rhythmDetailLabel(block: BlockDto): string {
  if (!block.rhythm || block.rhythm.kind === "none") return "Kein Rhythmus";
  if (block.rhythm.kind === "daily") return "Täglich";
  if (block.rhythm.kind === "weekly") return `${block.rhythm.count}/Wo.`;
  if (block.rhythm.kind === "monthly") return `${block.rhythm.count}/Mo.`;
  return `${block.rhythm.count}/J.`;
}

function timerDetailLabel(block: BlockDto): string {
  switch (block.timerConfig?.kind) {
    case "pomodoro":
      return "Pomodoro";
    case "countdown":
      return "Countdown";
    case "stopwatch":
      return "Stoppuhr";
    case "clock":
      return "Uhrzeit";
    default:
      return "Kein Timer";
  }
}

function formatLastAt(lastAt: string | null | undefined): string {
  if (!lastAt) return "—";
  const date = new Date(lastAt);
  if (Number.isNaN(date.getTime())) {
    const parts = lastAt.split("-");
    if (parts.length === 3) {
      const months = [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember",
      ];
      const month = months[Number(parts[1]) - 1] ?? parts[1];
      return `${Number(parts[2])}. ${month}`;
    }
    return lastAt;
  }
  return date.toLocaleDateString("de-DE", { day: "numeric", month: "long" });
}

export interface BlockDetailModalProps {
  block: BlockDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (block: BlockDto) => void;
}

export function BlockDetailModal({
  block,
  open,
  onOpenChange,
  onEdit,
}: BlockDetailModalProps) {
  if (!block) return null;

  const tone = blockTone(block);
  const icon = blockIcon(block);
  const insights = block.insights;
  const weeks = insights?.weeks?.length
    ? insights.weeks
    : [
        { label: "KW 22", value: 1 },
        { label: "KW 23", value: 2 },
        { label: "KW 24", value: 1 },
        { label: "KW 25", value: 3 },
        { label: "KW 26", value: 2 },
      ];
  const music = musicLabelFromBlock(block) ?? "—";

  return (
    <Modal
      className={styles.modal}
      footer={
        <Button
          buttonType="icon-text-inline"
          intent="secondary"
          leadingIcon="edit"
          onClick={() => onEdit(block)}
          size="md"
          type="button"
        >
          Bearbeiten
        </Button>
      }
      icon={
        <span className={styles.headerIcon}>
          <FokunaIcon name="layers" radius={2} size={16} stroke={1.5} />
        </span>
      }
      onOpenChange={onOpenChange}
      open={open}
      size="lg"
      title="Zeitblock"
    >
      <div className={styles.body}>
        <div className={styles.intro}>
          <div className={styles.titleRow}>
            <span className={styles.blockIcon} data-tone={tone}>
              <FokunaIcon name={icon} radius={2} size={24} stroke={2} />
            </span>
            <h2 className={styles.title}>{block.title}</h2>
          </div>
          {block.description ? (
            <p className={styles.description}>{block.description}</p>
          ) : null}
          <div className={styles.tags}>
            <Tag icon="clock" size="md">
              {formatDurationLabel(block.durationMinutes)}
            </Tag>
            <Tag icon="calendar" size="md">
              {rhythmDetailLabel(block)}
            </Tag>
            <Tag icon="clock-alert" size="md">
              {timerDetailLabel(block)}
            </Tag>
            <Tag icon="music" size="md">
              {music}
            </Tag>
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <FokunaIcon name="refresh" size={16} stroke={1.5} />
              <p className={styles.statLabel}>Anzahl</p>
            </div>
            <p className={styles.statValue}>{String(insights?.count ?? 0)}</p>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <FokunaIcon name="clock" size={16} stroke={1.5} />
              <p className={styles.statLabel}>Durch. Dauer</p>
            </div>
            <p className={styles.statValue}>
              {formatDurationLabel(insights?.avgDurationMinutes ?? 0)}
            </p>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <FokunaIcon name="calendar" size={16} stroke={1.5} />
              <p className={styles.statLabel}>Zuletzt</p>
            </div>
            <p className={styles.statValue}>{formatLastAt(insights?.lastAt)}</p>
          </div>
        </div>

        <InsightActivityPanel
          threshold={insights?.threshold ?? 4}
          weeks={weeks}
        />
      </div>
    </Modal>
  );
}
