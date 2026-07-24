"use client";

import type {
  BlockDto,
  BlockFocusConfig,
  BlockRhythm,
  BlockTimerConfig,
  UpdateBlockInput,
} from "@fokuna/api-contracts";
import { FokunaIcon, type IconName } from "@fokuna/icons";
import {
  Button,
  Callout,
  Dropdown,
  InputGroup,
  Switcher,
  TabBar,
  TabSelect,
  ViewOverlay,
} from "@fokuna/ui";
import { useMemo, useState } from "react";

import {
  BACKGROUND_COLORS,
  BLOCK_COLOR_OPTIONS,
  BLOCK_ICON_OPTIONS,
  DURATION_PRESETS,
  MUSIC_OPTIONS,
  POMODORO_PRESETS,
  blockIcon,
  formatDurationLabel,
} from "./block-utils";
import styles from "./block-edit-overlay.module.css";

type EditTab = "darstellung" | "rhythmus" | "fokus";

export interface BlockEditDraft {
  title: string;
  description: string;
  icon: IconName;
  colorToken: string;
  durationMinutes: number;
  rhythm: BlockRhythm;
  timerConfig: BlockTimerConfig;
  focusConfig: BlockFocusConfig;
}

function draftFromBlock(block: BlockDto): BlockEditDraft {
  const backgroundId =
    block.focusConfig?.backgroundId === "coral"
      ? "charcoal"
      : (block.focusConfig?.backgroundId ?? "teal");

  return {
    title: block.title,
    description: block.description ?? "",
    icon: blockIcon(block),
    colorToken: block.colorToken ?? "category.teal",
    durationMinutes: block.durationMinutes,
    rhythm: block.rhythm ?? { kind: "none", count: 1 },
    timerConfig: block.timerConfig ?? { kind: "none" },
    focusConfig: {
      musicId: block.focusConfig?.musicId ?? "none",
      backgroundKind: block.focusConfig?.backgroundKind ?? "colors",
      backgroundId,
    },
  };
}

export function emptyCreateDraft(): BlockEditDraft {
  return {
    title: "",
    description: "",
    icon: "focus-target",
    colorToken: "category.teal",
    durationMinutes: 45,
    rhythm: { kind: "none", count: 1 },
    timerConfig: { kind: "pomodoro", pomodoroPresetId: "steuererklaerung" },
    focusConfig: {
      musicId: "none",
      backgroundKind: "colors",
      backgroundId: "teal",
    },
  };
}

export function draftToUpdateInput(draft: BlockEditDraft): UpdateBlockInput {
  return {
    title: draft.title.trim() || "Neuer Zeitblock",
    description: draft.description.trim() || null,
    icon: draft.icon,
    colorToken: draft.colorToken,
    durationMinutes: draft.durationMinutes,
    rhythm: draft.rhythm,
    timerConfig: draft.timerConfig,
    focusConfig: draft.focusConfig,
    isTemplate: false,
  };
}

export interface BlockEditOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  block: BlockDto | null;
  onSave: (draft: BlockEditDraft) => Promise<void>;
  onDelete?: () => void;
}

/** Remount via `key` from parent when create/edit target changes — resets draft without effects. */
export function BlockEditOverlay({
  open,
  onOpenChange,
  mode,
  block,
  onSave,
  onDelete,
}: BlockEditOverlayProps) {
  const [tab, setTab] = useState<EditTab>("darstellung");
  const [draft, setDraft] = useState<BlockEditDraft>(() =>
    block ? draftFromBlock(block) : emptyCreateDraft(),
  );
  const [saving, setSaving] = useState(false);
  /** Sticky Individuell mode — don't snap back to preset bubbles when the picker hits a preset value. */
  const [durationCustom, setDurationCustom] = useState(() => {
    const minutes = block?.durationMinutes ?? emptyCreateDraft().durationMinutes;
    return !DURATION_PRESETS.some((preset) => preset.minutes === minutes);
  });

  const tone =
    BLOCK_COLOR_OPTIONS.find((option) => option.token === draft.colorToken)?.tone ?? "teal";
  const title =
    mode === "create"
      ? "Neuer Zeitblock"
      : `“${draft.title || block?.title || "Zeitblock"}” bearbeiten`;

  const pomodoroRoundsHint = useMemo(() => {
    if (draft.timerConfig.kind !== "pomodoro") return null;
    const work = 25;
    const rounds = Math.max(1, Math.floor(draft.durationMinutes / work));
    return {
      roundsLabel: `${rounds} volle Runden`,
      suffix: ` bei Standarddauer von ${formatDurationLabel(draft.durationMinutes)}`,
    };
  }, [draft.durationMinutes, draft.timerConfig.kind]);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(draft);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ViewOverlay
      footerEnd={
        <>
          <Button
            buttonType="outline"
            intent="tertiary"
            onClick={() => onOpenChange(false)}
            size="lg"
            trailingIcon={null}
            type="button"
          >
            Verwerfen
          </Button>
          <Button
            disabled={saving || !draft.title.trim()}
            intent="secondary"
            onClick={() => void handleSave()}
            size="lg"
            trailingIcon={null}
            type="button"
          >
            Speichern
          </Button>
        </>
      }
      footerStart={
        mode === "edit" && onDelete ? (
          <Button
            buttonType="link"
            intent="primary"
            leadingIcon="delete"
            onClick={onDelete}
            size="lg"
            trailingIcon={null}
            type="button"
          >
            Template löschen
          </Button>
        ) : undefined
      }
      icon={
        <span className={styles.headerIcon} data-tone={tone}>
          <FokunaIcon name={draft.icon} radius={2} size={16} stroke={2} />
        </span>
      }
      onOpenChange={onOpenChange}
      open={open}
      title={title}
    >
      <div className={styles.content}>
        <TabBar
          items={[
            { value: "darstellung", label: "Darstellung" },
            { value: "rhythmus", label: "Rhythmus & Dauer" },
            { value: "fokus", label: "Fokusmodus" },
          ]}
          onValueChange={(value) => setTab(value as EditTab)}
          size="lg"
          value={tab}
        />

        {tab === "darstellung" ? (
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Symbol</p>
            <div className={styles.symbolRow}>
              <div className={styles.symbolPreview}>
                <span className={styles.symbolTile} data-tone={tone}>
                  <FokunaIcon name={draft.icon} radius={2} size={24} stroke={2} />
                </span>
              </div>
              <div className={styles.symbolControls}>
                <label className={styles.fieldLabel}>
                  Icon
                  <Dropdown
                    className={styles.iconDropdown}
                    leadingIcon={draft.icon}
                    onValueChange={(value) => {
                      if (!value) return;
                      setDraft((current) => ({ ...current, icon: value as IconName }));
                    }}
                    options={BLOCK_ICON_OPTIONS.map((option) => ({
                      value: option.id,
                      label: option.label,
                      icon: option.id,
                    }))}
                    controlSize="md"
                    value={draft.icon}
                  />
                </label>
                <div>
                  <p className={styles.fieldLabel}>Farbe</p>
                  <div className={styles.swatches}>
                    {BLOCK_COLOR_OPTIONS.map((option) => {
                      const selected = draft.colorToken === option.token;
                      return (
                        <button
                          aria-label={option.label}
                          aria-pressed={selected}
                          className={styles.swatch}
                          data-selected={selected || undefined}
                          key={option.token}
                          onClick={() =>
                            setDraft((current) => ({ ...current, colorToken: option.token }))
                          }
                          type="button"
                        >
                          <span className={styles.swatchFill} data-tone={option.tone} />
                          {selected ? (
                            <FokunaIcon
                              className={styles.swatchCheck}
                              name="check-small"
                              radius={2}
                              size={16}
                              stroke={2}
                            />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.fieldFull}>
              <InputGroup
                controlSize="lg"
                label="Titel"
                onChange={(event) =>
                  setDraft((current) => ({ ...current, title: event.target.value }))
                }
                value={draft.title}
              />
            </div>
            <div className={styles.fieldFull}>
              <InputGroup
                controlSize="lg"
                label="Beschreibung"
                onChange={(event) =>
                  setDraft((current) => ({ ...current, description: event.target.value }))
                }
                sublabel="Wird auf der Übersichtskarte angezeigt"
                value={draft.description}
              />
            </div>
          </div>
        ) : null}

        {tab === "rhythmus" ? (
          <div className={styles.section}>
            <Callout tone="info">
              Lege fest wie häufig du diesen Zeitblock in deine Zeitplanung integrieren möchtest.
              Fokuna hilft dir dabei diese Zeitblöcke in deine Planung zu integrieren.
            </Callout>
            <div className={styles.rhythmPanel}>
              <div className={styles.rhythmCol}>
                <p className={styles.panelTitle}>Rhythmus</p>
                <TabSelect
                  aria-label="Rhythmus"
                  className={styles.tabSelect}
                  items={[
                    { value: "none", label: "Kein Rhythmus" },
                    { value: "daily", label: "Täglich" },
                    { value: "weekly", label: "Wöchentlich" },
                    { value: "monthly", label: "Monatlich" },
                    { value: "yearly", label: "Jährlich" },
                  ]}
                  onValueChange={(value) => {
                    if (!value) return;
                    setDraft((current) => ({
                      ...current,
                      rhythm: {
                        kind: value as BlockRhythm["kind"],
                        count: current.rhythm.count || 1,
                      },
                    }));
                  }}
                  size="md"
                  value={draft.rhythm.kind}
                />
              </div>
              {draft.rhythm.kind !== "none" ? (
                <div className={styles.countCol}>
                  <p className={styles.panelTitle}>Anzahl</p>
                  <Switcher
                    fit
                    nextLabel="Erhöhen"
                    onNext={() =>
                      setDraft((current) => ({
                        ...current,
                        rhythm: {
                          ...current.rhythm,
                          count: Math.min(31, current.rhythm.count + 1),
                        },
                      }))
                    }
                    onPrevious={() =>
                      setDraft((current) => ({
                        ...current,
                        rhythm: {
                          ...current.rhythm,
                          count: Math.max(1, current.rhythm.count - 1),
                        },
                      }))
                    }
                    previousLabel="Verringern"
                    size="md"
                    value={`${draft.rhythm.count}×`}
                  />
                </div>
              ) : null}
            </div>
            <div className={styles.panel}>
              <p className={styles.panelTitle}>Standard Dauer</p>
              <TabSelect
                aria-label="Standard Dauer"
                className={styles.tabSelect}
                items={[
                  ...DURATION_PRESETS.map((preset) => ({
                    value: String(preset.minutes),
                    label: preset.label,
                  })),
                  { value: "custom", label: "Individuell" },
                ]}
                onValueChange={(value) => {
                  if (!value) return;
                  if (value === "custom") {
                    setDurationCustom(true);
                    setDraft((current) => ({
                      ...current,
                      durationMinutes: durationCustom ? current.durationMinutes : 55,
                    }));
                    return;
                  }
                  setDurationCustom(false);
                  setDraft((current) => ({
                    ...current,
                    durationMinutes: Number(value),
                  }));
                }}
                size="md"
                value={durationCustom ? "custom" : String(draft.durationMinutes)}
              />
              {durationCustom ? (
                <div className={styles.stepper}>
                  Individuelle Zeit
                  <Switcher
                    fit
                    nextLabel="Dauer erhöhen"
                    onNext={() =>
                      setDraft((current) => ({
                        ...current,
                        durationMinutes: Math.min(24 * 60, current.durationMinutes + 5),
                      }))
                    }
                    onPrevious={() =>
                      setDraft((current) => ({
                        ...current,
                        durationMinutes: Math.max(5, current.durationMinutes - 5),
                      }))
                    }
                    previousLabel="Dauer verringern"
                    size="md"
                    value={formatDurationLabel(draft.durationMinutes)}
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {tab === "fokus" ? (
          <div className={styles.section}>
            <Callout tone="info">
              Innerhalb des Fokusmodus kannst du für einen Zeitblock individuelle Timer und
              Musikeinstellungen wählen.
            </Callout>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <p className={styles.sectionTitle}>Timer Einstellungen</p>
                <TabSelect
                  aria-label="Timer"
                  className={styles.tabSelect}
                  items={[
                    { value: "none", label: "Kein Timer" },
                    { value: "pomodoro", label: "Pomodoro" },
                    { value: "countdown", label: "Countdown" },
                    { value: "stopwatch", label: "Stoppuhr" },
                    { value: "clock", label: "Uhrzeit" },
                  ]}
                  onValueChange={(value) => {
                    if (!value) return;
                    setDraft((current) => ({
                      ...current,
                      timerConfig: {
                        kind: value as BlockTimerConfig["kind"],
                        pomodoroPresetId:
                          value === "pomodoro"
                            ? current.timerConfig.pomodoroPresetId ?? "steuererklaerung"
                            : undefined,
                      },
                    }));
                  }}
                  size="md"
                  value={draft.timerConfig.kind}
                />
              </div>
              {draft.timerConfig.kind === "pomodoro" ? (
                <div className={styles.pomodoroTray}>
                  <div className={styles.pomodoroGrid}>
                    {POMODORO_PRESETS.map((preset) => {
                      const selected =
                        (draft.timerConfig.pomodoroPresetId ?? "steuererklaerung") === preset.id;
                      return (
                        <button
                          className={styles.pomodoroCard}
                          data-selected={selected || undefined}
                          key={preset.id}
                          onClick={() =>
                            setDraft((current) => ({
                              ...current,
                              timerConfig: {
                                kind: "pomodoro",
                                pomodoroPresetId: preset.id,
                              },
                            }))
                          }
                          type="button"
                        >
                          <span className={styles.pomodoroBadge}>
                            <span className={styles.pomodoroBadgeIcon}>
                              <FokunaIcon name="clock-alert" radius={2} size={24} stroke={2} />
                            </span>
                            <span className={styles.pomodoroBadgeLabel}>Pomodoro</span>
                          </span>
                          <span className={styles.pomodoroCopy}>
                            <span className={styles.pomodoroName}>{preset.label}</span>
                            <span className={styles.pomodoroDetail}>{preset.detail}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className={styles.pomodoroFooter}>
                    {pomodoroRoundsHint ? (
                      <span className={styles.pomodoroHint}>
                        <FokunaIcon name="info-circle" radius={2} size={16} stroke={2} />
                        <span>
                          <strong>{pomodoroRoundsHint.roundsLabel}</strong>
                          {pomodoroRoundsHint.suffix}
                        </span>
                      </span>
                    ) : (
                      <span />
                    )}
                    <Button
                      buttonType="icon-text-inline"
                      intent="tertiary"
                      leadingIcon="clock-alert"
                      size="lg"
                      type="button"
                    >
                      Pomodoros verwalten
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <p className={styles.sectionTitle}>Musik Einstellungen</p>
                <TabSelect
                  aria-label="Musik"
                  className={styles.tabSelectWrap}
                  items={MUSIC_OPTIONS.map((option) => ({
                    value: option.id,
                    label: option.label,
                    icon: option.icon,
                  }))}
                  onValueChange={(value) => {
                    if (!value) return;
                    setDraft((current) => ({
                      ...current,
                      focusConfig: { ...current.focusConfig, musicId: value },
                    }));
                  }}
                  size="md"
                  value={draft.focusConfig.musicId ?? "none"}
                />
              </div>
            </div>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <p className={styles.sectionTitle}>Hintergrund</p>
                <TabSelect
                  aria-label="Hintergrundart"
                  className={styles.tabSelect}
                  items={[
                    { value: "colors", label: "Farben" },
                    { value: "gradients", label: "Animierte Verläufe" },
                    { value: "shapes", label: "Shapes" },
                    { value: "nature", label: "Natur" },
                  ]}
                  onValueChange={(value) => {
                    if (!value) return;
                    setDraft((current) => ({
                      ...current,
                      focusConfig: {
                        ...current.focusConfig,
                        backgroundKind: value as BlockFocusConfig["backgroundKind"],
                      },
                    }));
                  }}
                  size="md"
                  value={draft.focusConfig.backgroundKind ?? "colors"}
                />
              </div>
              {(draft.focusConfig.backgroundKind ?? "colors") === "colors" ? (
                <div className={styles.bgSwatches}>
                  {BACKGROUND_COLORS.map((color) => {
                    const selected = draft.focusConfig.backgroundId === color.id;
                    return (
                      <button
                        aria-label={color.label}
                        aria-pressed={selected}
                        className={styles.bgSwatch}
                        data-selected={selected || undefined}
                        key={color.id}
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            focusConfig: { ...current.focusConfig, backgroundId: color.id },
                          }))
                        }
                        type="button"
                      >
                        <span
                          className={styles.bgSwatchFill}
                          style={{ backgroundImage: color.gradient }}
                        />
                        {selected ? (
                          <span className={styles.bgSwatchCheck} aria-hidden="true">
                            <FokunaIcon name="check-small" radius={2} size={16} stroke={2} />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className={styles.bgHint}>
                  Weitere Hintergründe folgen mit dem Fokusmodus (A6).
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </ViewOverlay>
  );
}
