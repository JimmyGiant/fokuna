"use client";

import { FokunaIcon } from "@fokuna/icons";
import {
  ConfirmDeleteModal,
  deleteConfirmCopy,
} from "@/components/confirm-delete-modal";
import {
  AddTask,
  AddGroup,
  BlockCard,
  BlockRail,
  BlockTile,
  Breadcrumb,
  Button,
  CalendarDrawer,
  CalendarItem,
  Callout,
  Card,
  Checkbox,
  collapseBreadcrumbItems,
  DatePicker,
  Dropdown,
  FilterBar,
  getCalendarEntryPosition,
  GoalCard,
  InsightActivityCard,
  InsightBarList,
  InsightCard,
  InsightConsistencyGrid,
  InsightDeadlineContent,
  InsightMetricContent,
  InsightMilestonesContent,
  InsightPlaceCard,
  InsightPrioritiesContent,
  InsightProgressRing,
  InsightQuoteCard,
  InsightSegmentGauge,
  InputField,
  InputGroup,
  MetaMenu,
  MilestoneTaskGroup,
  Modal,
  PageHeader,
  Radio,
  RadioGroupRoot,
  SearchField,
  Sidebar,
  SidebarAvatar,
  Slider,
  Switch,
  Switcher,
  TabBar,
  TabSelect,
  Tag,
  TagItemPriority,
  TaskGroup,
  TaskGroupHeader,
  TaskListItem,
  TaskModalHeader,
  TaskModalMenu,
  TaskModalSlot,
  TemplateCard,
  ToastSpecimen,
  ToggleGroup,
  UiShell,
  useToast,
  ViewOverlay,
  type BlockRailItem,
  type ControlSize,
  type FokunaContextMenuEntry,
} from "@fokuna/ui";
import { useState } from "react";
import Image from "next/image";

import styles from "./pattern-library.module.css";

const sizes: ControlSize[] = ["sm", "md", "lg", "xl"];
const sizeHeights: Record<ControlSize, number> = { sm: 28, md: 32, lg: 40, xl: 48 };

function ToastLiveTriggers() {
  const { toast } = useToast();

  return (
    <div className={styles.toastTriggerRow}>
      <Button
        intent="secondary"
        onClick={() =>
          toast({
            title: "Nach „Arbeit“ verschoben",
            action: {
              label: "Rückgängig",
              altText: "Verschieben rückgängig machen",
              leadingIcon: "arrow-undo-down",
              onClick: () => undefined,
            },
          })
        }
        size="sm"
        trailingIcon={null}
      >
        Toast zeigen
      </Button>
    </div>
  );
}

const blockRailItems: BlockRailItem[] = [
  { id: "reading", label: "Lesen", icon: "newspaper", tone: "coral" },
  { id: "lunch", label: "Mittagessen", icon: "fork-spoon", tone: "purple" },
  { id: "training", label: "Training", icon: "tennis", tone: "gold" },
  { id: "movement", label: "Bewegung", icon: "tennis", tone: "blue" },
  { id: "recovery", label: "Regeneration", icon: "tennis", tone: "pink" },
  { id: "focus", label: "Fokus", icon: "focus-target", tone: "teal", badge: 3 },
];

function Matrix({ children }: { children: React.ReactNode }) {
  return <div className={styles.specimenMatrix}>{children}</div>;
}

function MatrixRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.specimenRow}>
      <strong>{label}</strong>
      <div>{children}</div>
    </div>
  );
}

/** In-specimen block title — same weight/color as MatrixRow labels, never page sectionLabel. */
function SpecimenBlock({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={[styles.specimenBlock, className].filter(Boolean).join(" ")}>
      <strong className={styles.specimenBlockLabel}>{label}</strong>
      {children}
    </section>
  );
}

function SizeSample({
  size,
  wide = false,
  children,
}: {
  size: ControlSize;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.sizeSample} data-wide={wide || undefined}>
      <span>
        {size.toUpperCase()} · {sizeHeights[size]} px
      </span>
      {children}
    </div>
  );
}

function AufgabenSidebar() {
  return (
    <Sidebar
      activeId="tasks"
      footer={
        <SidebarAvatar alt="Demo Nutzer" src="/pattern-library/demo-profile.png" />
      }
      footerItems={[{ id: "settings", label: "Einstellungen", href: "#", icon: "settings-gear" }]}
      items={[
        { id: "calendar", label: "Kalender", href: "#", icon: "calendar" },
        { id: "tasks", label: "Aufgaben", href: "#", icon: "circle-check" },
        { id: "journal", label: "Journal", href: "#", icon: "writing" },
        { id: "goals", label: "Ziele", href: "#", icon: "focus-target" },
        { id: "insights", label: "Insights", href: "#", icon: "trending" },
      ]}
      logo={
        <Image
          alt="Fokuna"
          height={32}
          priority
          src="/branding/fokuna_logo_no-text.svg"
          width={34}
        />
      }
      secondaryActiveId="all"
      secondaryItems={[
        { id: "all", label: "Alle Aufgaben", href: "#", icon: "checklist" },
        { id: "favorites", label: "Favoriten", href: "#", icon: "star" },
        { id: "today", label: "Heute", href: "#", icon: "calendar-today" },
        { id: "inbox", label: "Eingang", href: "#", icon: "inbox-empty", badge: "3" },
      ]}
      secondarySections={[
        {
          id: "categories",
          label: "Kategorien",
          items: [
            {
              id: "work",
              label: "Arbeit",
              href: "#",
              badge: "12",
              color: "var(--fk-color-category-teal)",
            },
            {
              id: "private",
              label: "Privat",
              href: "#",
              badge: "8",
              color: "var(--fk-color-category-purple)",
            },
            {
              id: "health",
              label: "Gesundheit",
              href: "#",
              badge: "4",
              color: "var(--fk-color-category-coral)",
            },
          ],
        },
        {
          id: "goals",
          label: "Ziele",
          items: [
            { id: "launch", label: "Website Launch", href: "#", icon: "focus-target", badge: "6" },
            {
              id: "marathon",
              label: "Berlin Marathon",
              href: "#",
              icon: "focus-target",
              badge: "4",
            },
          ],
        },
        {
          id: "labels",
          label: "Labels",
          items: [
            { id: "deep", label: "Deep Work", href: "#", icon: "tag", badge: "8" },
            { id: "quick", label: "Quick Win", href: "#", icon: "tag", badge: "5" },
          ],
        },
      ]}
      secondaryTitle="Aufgaben"
    />
  );
}

function HeaderMetaMenu() {
  return (
    <MetaMenu
      items={[
        { label: "Ansicht anpassen", icon: "settings-sliders" },
        { label: "Exportieren", icon: "external-link" },
      ]}
    />
  );
}

function HeaderSearch() {
  return <SearchField collapsedWidth={152} expandedWidth={240} placeholder="Suchen..." />;
}

function AufgabenPageHeaderSpecimen() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <PageHeader
      actions={
        <>
          <HeaderMetaMenu />
          <HeaderSearch />
          <Button
            intent="secondary"
            leadingIcon={<FokunaIcon fill="on" name="magic-eye" size={16} />}
            trailingIcon={null}
          >
            Fokus
          </Button>
          <Button
            aria-label={drawerOpen ? "Kalenderleiste schließen" : "Kalenderleiste öffnen"}
            aria-pressed={drawerOpen}
            buttonType="outline"
            iconOnly
            intent="tertiary"
            leadingIcon={
              <FokunaIcon
                name="sidebar-left-arrow"
                size={16}
                style={drawerOpen ? { transform: "scaleX(-1)" } : undefined}
              />
            }
            onClick={() => setDrawerOpen((value) => !value)}
          >
            Kalenderleiste
          </Button>
        </>
      }
    />
  );
}

function CalendarItemSpecimen({ kind }: { kind: "task" | "event" | "block" }) {
  const content = {
    task: { title: "Landingpage prüfen", meta: "Ziel: Launch", tone: "neutral" as const },
    event: { title: "Weekly Sync", meta: "Google Calendar", tone: "teal" as const },
    block: {
      title: "Deep Work",
      meta: "Pomodoro 25 min",
      tone: "purple" as const,
      icon: "clock" as const,
    },
  }[kind];

  return (
    <Matrix>
      <MatrixRow label="Default">
        <CalendarItem kind={kind} {...content} time="09:00" />
      </MatrixRow>
      <MatrixRow label="Selected">
        <CalendarItem kind={kind} {...content} state="selected" time="09:00" />
      </MatrixRow>
      <MatrixRow label="Dragged">
        <CalendarItem kind={kind} {...content} state="dragged" time="09:00" />
      </MatrixRow>
      <MatrixRow label="Placeholder">
        <CalendarItem kind={kind} {...content} state="drag-placeholder" />
      </MatrixRow>
    </Matrix>
  );
}

function TaskItems({
  variant = "task",
}: {
  variant?: "task" | "milestone-header" | "milestone-task";
}) {
  const isMilestoneHeader = variant === "milestone-header";
  const isMilestoneTask = variant === "milestone-task";
  const sharedMilestoneProps = isMilestoneHeader
    ? { milestone: true }
    : isMilestoneTask
      ? { milestoneTask: true }
      : {};
  const milestoneGoal = isMilestoneHeader || isMilestoneTask ? "Mein Ziel" : undefined;

  return (
    <Matrix>
      <MatrixRow label="Default">
        <TaskListItem
          due="Morgen"
          dueTone="coral"
          goal={isMilestoneHeader || isMilestoneTask ? "Mein Ziel" : "Website Launch"}
          priority="urgent"
          subtasks="1/3"
          tags={["Design"]}
          title={isMilestoneHeader ? "Meilenstein A" : "Komponenten prüfen"}
          {...sharedMilestoneProps}
        />
      </MatrixRow>
      <MatrixRow label="Priority Meta (Tag Item Priority)">
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <TagItemPriority priority="urgent" />
            <TagItemPriority priority="high" />
            <TagItemPriority priority="medium" />
            <TagItemPriority priority="low" />
          </div>
          <TaskListItem
            due="Morgen"
            dueTone="coral"
            priority="high"
            subtasks="0/2"
            tags={["Etikettenname"]}
            title="Aufgabenname"
            {...sharedMilestoneProps}
          />
          <TaskListItem
            priority="medium"
            subtasks="0/2"
            tags={["Etikettenname"]}
            title="Unteraufgabenname"
            {...sharedMilestoneProps}
            indentLevel={1}
          />
        </div>
      </MatrixRow>
      <MatrixRow label="Fälligkeit (Datum, neutral)">
        <TaskListItem
          due="28. Jul."
          dueTone="neutral"
          goal={milestoneGoal}
          title="Späterer Termin — graue Meta"
          {...sharedMilestoneProps}
        />
      </MatrixRow>
      <MatrixRow label="Favorite">
        <TaskListItem
          favorite
          goal={milestoneGoal}
          title={isMilestoneHeader ? "Meilenstein B" : "Pattern Library freigeben"}
          {...sharedMilestoneProps}
        />
      </MatrixRow>
      <MatrixRow label="Selected">
        <TaskListItem
          goal={milestoneGoal}
          state="selected"
          title="Ausgewählter Eintrag"
          {...sharedMilestoneProps}
        />
      </MatrixRow>
      <MatrixRow label="Dragged">
        <TaskListItem
          goal={milestoneGoal}
          state="dragged"
          title="Gezogener Eintrag"
          {...sharedMilestoneProps}
        />
      </MatrixRow>
      <MatrixRow label="Placeholder">
        <TaskListItem
          goal={milestoneGoal}
          state="placeholder"
          title="Placeholder"
          {...sharedMilestoneProps}
        />
      </MatrixRow>
    </Matrix>
  );
}

function TaskModalComposition({
  editing = false,
  showBreadcrumb = true,
}: {
  editing?: boolean;
  showBreadcrumb?: boolean;
}) {
  const [priority, setPriority] = useState("none");
  const [dueDate, setDueDate] = useState<Date>();
  const [estimate, setEstimate] = useState("");
  const [openProperty, setOpenProperty] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "Admin",
    "Communication",
    "Recovery",
  ]);
  const priorityOptions = [
    { value: "urgent", label: "Hoch", color: "var(--fk-color-task-priority-urgent)" },
    { value: "medium", label: "Mittel", color: "var(--fk-color-task-priority-medium)" },
    { value: "low", label: "Niedrig", color: "var(--fk-color-task-priority-low)" },
    { value: "none", label: "Keine", color: "var(--fk-color-icon-tertiary)" },
  ];
  const priorityOption = priorityOptions.find((option) => option.value === priority);
  const estimateMinutes = [60, 75, 90, 105, 120, 135, 150, 165, 180, 240, 300, 360];
  const estimateOptions = estimateMinutes.map((minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return {
      value: String(minutes),
      label: minutes < 180 ? `${hours}:${String(remainder).padStart(2, "0")} Std` : `${hours} Std`,
    };
  });
  const estimateLabel =
    estimate === "30"
      ? "30 Min"
      : estimateOptions.find((option) => option.value === estimate)?.label;
  const tags = [
    {
      label: "Admin",
      color: "var(--fk-color-category-teal)",
      surface: "var(--fk-color-category-teal-10)",
      tone: "teal" as const,
    },
    {
      label: "Communication",
      color: "var(--fk-color-category-blue)",
      surface: "var(--fk-color-category-blue-10)",
      tone: "blue" as const,
    },
    {
      label: "Planning",
      color: "var(--fk-color-category-gold)",
      surface: "var(--fk-color-category-gold-10)",
      tone: "gold" as const,
    },
    {
      label: "Recovery",
      color: "var(--fk-color-category-purple)",
      surface: "var(--fk-color-category-purple-10)",
      tone: "purple" as const,
    },
    {
      label: "Research",
      color: "var(--fk-color-category-pink)",
      surface: "var(--fk-color-category-pink-10)",
      tone: "pink" as const,
    },
  ];
  const dueDateLabel = dueDate
    ? new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(dueDate)
    : undefined;
  return (
    <TaskModalSlot
      actions={
        <MetaMenu
          items={[{ label: "Aufgabe löschen", icon: "delete", destructive: true }]}
          label="Weitere Aufgabenaktionen"
          trigger={
            <button
              aria-label="Weitere Aufgabenaktionen"
              className={styles.taskModalOverflowTrigger}
              type="button"
            >
              <FokunaIcon name="more-horizontal" size={16} stroke={1.5} />
            </button>
          }
        />
      }
      breadcrumb={
        showBreadcrumb ? (
          <Breadcrumb
            items={[{ label: "Motoraufhängung bestellen", href: "#" }, { label: "Components" }]}
          />
        ) : undefined
      }
      header={
        <TaskModalHeader
          defaultEditing={editing}
          description="Typischerweise wird der Motor mit einer Motorbrücke oder einem Heber abgestützt, während die Schrauben der Lager gelöst und die alten Einheiten entfernt werden."
          title="Motoraufhängung bestellen"
        />
      }
      menu={
        <TaskModalMenu
          items={[
            {
              label: "Priorität",
              onOpenChange: (open) => setOpenProperty(open ? "priority" : null),
              open: openProperty === "priority",
              value:
                priorityOption && priorityOption.value !== "none" ? (
                  <span className={styles.taskRailPreview}>
                    <FokunaIcon
                      fill="on"
                      name="flag"
                      size={16}
                      stroke={1.5}
                      style={{ color: priorityOption.color }}
                    />
                    <span>{priorityOption.label}</span>
                  </span>
                ) : undefined,
              content: (
                <div aria-label="Priorität auswählen" className={styles.taskPriorityMenu}>
                  {priorityOptions.map((option) => (
                    <button
                      aria-pressed={priority === option.value}
                      data-selected={priority === option.value || undefined}
                      key={option.value}
                      onClick={() => {
                        setPriority(option.value);
                        setOpenProperty(null);
                      }}
                      type="button"
                    >
                      <FokunaIcon
                        fill={option.value === "none" ? "off" : "on"}
                        name="flag"
                        size={16}
                        stroke={1.5}
                        style={{ color: option.color }}
                      />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              ),
            },
            {
              label: "Fälligkeit",
              onOpenChange: (open) => setOpenProperty(open ? "due-date" : null),
              open: openProperty === "due-date",
              value: dueDateLabel ? (
                <span className={styles.taskRailPreview}>
                  <FokunaIcon name="calendar" size={16} stroke={1.5} />
                  <span>{dueDateLabel}</span>
                </span>
              ) : undefined,
              content: (
                <div className={styles.taskPropertyDate}>
                  <DatePicker
                    aria-label="Fälligkeit auswählen"
                    inline
                    onValueChange={(nextValue) => {
                      setDueDate(nextValue instanceof Date ? nextValue : undefined);
                      if (nextValue instanceof Date) setOpenProperty(null);
                    }}
                    value={dueDate}
                  />
                </div>
              ),
            },
            {
              label: "Zeitschätzung",
              onOpenChange: (open) => setOpenProperty(open ? "estimate" : null),
              open: openProperty === "estimate",
              value: estimateLabel ? (
                <span className={styles.taskRailPreview}>
                  <FokunaIcon name="clock" size={16} stroke={1.5} />
                  <span>{estimateLabel}</span>
                </span>
              ) : undefined,
              content: (
                <div className={styles.taskEstimateMenu}>
                  <div className={styles.taskEstimateQuickSelect}>
                    {(
                      [
                        ["30", "30 Min"],
                        ["60", "1 Std"],
                        ["120", "2 Std"],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        aria-pressed={estimate === value}
                        data-selected={estimate === value || undefined}
                        key={value}
                        onClick={() => {
                          setEstimate(value);
                          setOpenProperty(null);
                        }}
                        type="button"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <Dropdown
                    aria-label="Zeitschätzung auswählen"
                    controlSize="md"
                    onValueChange={(value) => {
                      setEstimate(value);
                      setOpenProperty(null);
                    }}
                    options={estimateOptions}
                    placeholder="Dauer wählen"
                    value={estimate}
                  />
                </div>
              ),
            },
            {
              label: "Labels",
              onOpenChange: (open) => setOpenProperty(open ? "labels" : null),
              open: openProperty === "labels",
              value: selectedTags.length ? (
                <div aria-label="Ausgewählte Labels" className={styles.taskRailTags}>
                  {tags
                    .filter((tag) => selectedTags.includes(tag.label))
                    .map((tag) => (
                      <Tag
                        icon="tag"
                        key={tag.label}
                        onRemove={() =>
                          setSelectedTags((current) =>
                            current.filter((label) => label !== tag.label),
                          )
                        }
                        removable
                        size="sm"
                        tone={tag.tone}
                      >
                        {tag.label}
                      </Tag>
                    ))}
                </div>
              ) : undefined,
              content: (
                <div className={styles.taskTagManager}>
                  <SearchField
                    aria-label="Labels durchsuchen"
                    collapsedWidth={278}
                    controlSize="md"
                    expandedWidth={278}
                    placeholder="Label suchen oder erstellen ..."
                  />
                  <div aria-label="Labels" className={styles.taskTagManagerList}>
                    {tags.map((tag) => (
                      <button
                        aria-pressed={selectedTags.includes(tag.label)}
                        data-selected={selectedTags.includes(tag.label) || undefined}
                        key={tag.label}
                        onClick={() =>
                          setSelectedTags((current) =>
                            current.includes(tag.label)
                              ? current.filter((label) => label !== tag.label)
                              : [...current, tag.label],
                          )
                        }
                        style={{ "--task-tag-surface": tag.surface } as React.CSSProperties}
                        type="button"
                      >
                        <FokunaIcon
                          className={styles.taskTagIcon}
                          name="tag"
                          size={16}
                          style={{ color: tag.color }}
                        />
                        <span>{tag.label}</span>
                        {selectedTags.includes(tag.label) ? (
                          <FokunaIcon
                            className={styles.taskTagCheck}
                            name="check-small"
                            size={16}
                            stroke={2}
                          />
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              ),
            },
          ]}
        />
      }
    >
      <TaskGroup
        addLabel="Unteraufgabe hinzufügen"
        addNamePlaceholder="Unteraufgabenname"
        count={3}
        title="Unteraufgaben"
      >
        <TaskListItem due="Morgen" dueTone="coral" subtasks="0/2" title="Recherchieren" />
        <TaskListItem title="Teile bestellen" />
        <TaskListItem title="Unteraufgabenname" />
      </TaskGroup>
    </TaskModalSlot>
  );
}

export function PatternSpecimen({ slug }: { slug: string }) {
  const [tab, setTab] = useState("activity");
  const [toggle, setToggle] = useState("check-in");
  const [tabSelect, setTabSelect] = useState("ambient");
  const [dropdown, setDropdown] = useState("week");
  const [activeBlock, setActiveBlock] = useState("focus");
  const [showTaskModalBreadcrumb, setShowTaskModalBreadcrumb] = useState(true);
  const [viewOverlayOpen, setViewOverlayOpen] = useState(false);
  const [viewOverlayTab, setViewOverlayTab] = useState("darstellung");
  const [orgModalView, setOrgModalView] = useState<"create" | "list" | "detail">("create");
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmKind, setDeleteConfirmKind] = useState<"task" | "category" | "label">(
    "category",
  );

  switch (slug) {
    case "button":
      return (
        <Matrix>
          <MatrixRow label="Filled · default">
            {sizes.map((size) => (
              <SizeSample key={size} size={size}>
                <Button size={size}>Button</Button>
              </SizeSample>
            ))}
            {sizes.map((size) => (
              <SizeSample key={`secondary-${size}`} size={size}>
                <Button intent="secondary" size={size}>
                  Button
                </Button>
              </SizeSample>
            ))}
          </MatrixRow>
          <MatrixRow label="Filled · hover preview">
            {sizes.map((size) => (
              <SizeSample key={size} size={size}>
                <Button data-preview-state="hover" size={size}>
                  Button
                </Button>
              </SizeSample>
            ))}
            {sizes.map((size) => (
              <SizeSample key={`secondary-${size}`} size={size}>
                <Button data-preview-state="hover" intent="secondary" size={size}>
                  Button
                </Button>
              </SizeSample>
            ))}
          </MatrixRow>
          <MatrixRow label="Outline">
            {sizes.map((size) => (
              <SizeSample key={size} size={size}>
                <Button buttonType="outline" size={size}>
                  Button
                </Button>
              </SizeSample>
            ))}
            {sizes.map((size) => (
              <SizeSample key={`secondary-${size}`} size={size}>
                <Button buttonType="outline" intent="secondary" size={size}>
                  Button
                </Button>
              </SizeSample>
            ))}
          </MatrixRow>
          <MatrixRow label="Tertiary outline">
            {sizes.map((size) => (
              <SizeSample key={size} size={size}>
                <Button buttonType="outline" intent="tertiary" size={size}>
                  Button
                </Button>
              </SizeSample>
            ))}
          </MatrixRow>
          <MatrixRow label="Link (semibold, gap 6)">
            {sizes.map((size) => (
              <SizeSample key={size} size={size}>
                <Button buttonType="link" size={size}>
                  Button
                </Button>
              </SizeSample>
            ))}
          </MatrixRow>
          <MatrixRow label="Icon-text-inline (regular, gap 4)">
            {sizes.map((size) => (
              <SizeSample key={size} size={size}>
                <Button buttonType="icon-text-inline" leadingIcon="add-small" size={size}>
                  Button
                </Button>
              </SizeSample>
            ))}
            {sizes.map((size) => (
              <SizeSample key={`inline-trail-${size}`} size={size}>
                <Button
                  buttonType="icon-text-inline"
                  size={size}
                  trailingIcon="chevron-right-small"
                >
                  Button
                </Button>
              </SizeSample>
            ))}
          </MatrixRow>
          <MatrixRow label="Icon-text-inline · tertiary (… verwalten)">
            {sizes.map((size) => (
              <SizeSample key={`inline-tertiary-${size}`} size={size}>
                <Button
                  buttonType="icon-text-inline"
                  intent="tertiary"
                  leadingIcon="edit"
                  size={size}
                >
                  Labels verwalten
                </Button>
              </SizeSample>
            ))}
          </MatrixRow>
          <MatrixRow label="Disabled and loading">
            <Button disabled>Button</Button>
            <Button loading>Button</Button>
          </MatrixRow>
          <MatrixRow label="Icon only">
            {sizes.map((size) => (
              <SizeSample key={size} size={size}>
                <Button aria-label={`Hinzufügen ${size}`} iconOnly size={size}>
                  Hinzufügen
                </Button>
              </SizeSample>
            ))}
          </MatrixRow>
        </Matrix>
      );

    case "callout":
      return (
        <Matrix>
          <MatrixRow label="Line">
            <div className={styles.calloutStack}>
              <Callout title="Hinweis">
                Diese Einstellung kann später erneut geändert werden.
              </Callout>
              <Callout tone="info" title="Information">
                Der Zeitblock wurde synchronisiert.
              </Callout>
              <Callout tone="warning" title="Achtung">
                Der Zeitraum überschneidet sich.
              </Callout>
              <Callout tone="error" title="Fehler">
                Die Änderung konnte nicht gespeichert werden.
              </Callout>
            </div>
          </MatrixRow>
          <MatrixRow label="With icon">
            <div className={styles.calloutStack}>
              <Callout title="Hinweis" type="icon">
                Diese Einstellung kann später erneut geändert werden.
              </Callout>
              <Callout tone="info" title="Information" type="icon">
                Der Zeitblock wurde synchronisiert.
              </Callout>
              <Callout tone="warning" title="Achtung" type="icon">
                Der Zeitraum überschneidet sich.
              </Callout>
              <Callout tone="error" title="Fehler" type="icon">
                Die Änderung konnte nicht gespeichert werden.
              </Callout>
            </div>
          </MatrixRow>
        </Matrix>
      );

    case "toast":
      return (
        <Matrix>
          <MatrixRow label="Einzeilig">
            <ToastSpecimen title="Nach „Arbeit“ verschoben" />
          </MatrixRow>
          <MatrixRow label="Live">
            <ToastLiveTriggers />
          </MatrixRow>
        </Matrix>
      );

    case "cards-slots":
    case "card-modal":
      return (
        <div className={styles.cardModalSpecimen}>
          <SpecimenBlock label="Card">
            <Card aria-label="Card Oberfläche" className={styles.referenceCard} elevated="medium" />
          </SpecimenBlock>
        </div>
      );

    case "modals":
    case "confirmation-modal":
    case "task-modal":
    case "delete-confirm":
      return (
        <div className={styles.cardModalSpecimen}>
          <SpecimenBlock className={styles.organizationalModalSpecimen} label="Organizational Modal">
            <p className={styles.specimenBlockCopy}>
              Create → Liste → Detail auf Modal <code>size=sm</code>. Inset 32 · Titel→Body 16 ·
              Body→Footer 24. Footer immer: Create (verwalten + CTA), Liste (Neues …), Detail
              (Löschen + Speichern). Referenz: Kategorien/Labels.
            </p>
            <div className={styles.organizationalModalActions}>
              <Button
                buttonType="outline"
                intent="tertiary"
                onClick={() => {
                  setOrgModalView("create");
                  setOrgModalOpen(true);
                }}
                type="button"
              >
                Create öffnen
              </Button>
              <Button
                buttonType="outline"
                intent="tertiary"
                onClick={() => {
                  setOrgModalView("list");
                  setOrgModalOpen(true);
                }}
                type="button"
              >
                Liste öffnen
              </Button>
              <Button
                buttonType="outline"
                intent="tertiary"
                onClick={() => {
                  setOrgModalView("detail");
                  setOrgModalOpen(true);
                }}
                type="button"
              >
                Detail öffnen
              </Button>
            </div>

            <Modal
              className={styles.organizationalModal}
              footer={
                orgModalView === "create" ? (
                  <>
                    <Button
                      buttonType="icon-text-inline"
                      intent="tertiary"
                      leadingIcon={<FokunaIcon name="edit" size={16} stroke={1.5} />}
                      onClick={() => setOrgModalView("list")}
                      type="button"
                    >
                      Labels verwalten
                    </Button>
                    <Button
                      trailingIcon={<FokunaIcon name="chevron-right-small" size={16} stroke={1.5} />}
                      type="button"
                    >
                      Label erstellen
                    </Button>
                  </>
                ) : orgModalView === "list" ? (
                  <>
                    <Button
                      buttonType="icon-text-inline"
                      leadingIcon={<FokunaIcon name="add-small" size={16} stroke={1.5} />}
                      onClick={() => setOrgModalView("create")}
                      type="button"
                    >
                      Neues Label
                    </Button>
                    <span aria-hidden="true" />
                  </>
                ) : (
                  <>
                    <Button
                      buttonType="icon-text-inline"
                      className={styles.orgDeleteAction}
                      leadingIcon={<FokunaIcon name="delete-alt" size={16} stroke={1.5} />}
                      type="button"
                    >
                      Label löschen
                    </Button>
                    <Button trailingIcon={null} type="button">
                      Speichern
                    </Button>
                  </>
                )
              }
              onOpenChange={setOrgModalOpen}
              open={orgModalOpen}
              size="sm"
              title={
                orgModalView === "create"
                  ? "Neues Label erstellen"
                  : orgModalView === "list"
                    ? "Labels verwalten"
                    : "Label bearbeiten"
              }
            >
              {orgModalView === "create" ? (
                <div className={styles.orgForm}>
                  <InputGroup
                    controlSize="lg"
                    label="Name"
                    placeholder="Name eingeben"
                    defaultValue=""
                  />
                  <div className={styles.orgColorField}>
                    <span className={styles.orgColorLabel}>Farbe</span>
                    <div className={styles.orgSwatches} role="listbox" aria-label="Farbe">
                      {["coral", "teal", "blue", "purple"].map((tone, index) => (
                        <span
                          aria-hidden="true"
                          className={styles.orgSwatch}
                          data-selected={index === 0 ? "true" : undefined}
                          key={tone}
                          style={{ background: `var(--fk-color-category-${tone})` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
              {orgModalView === "list" ? (
                <ul className={styles.orgCatalog}>
                  {["Fokus", "Privat", "Warteschlange"].map((name) => (
                    <li key={name}>
                      <button
                        className={styles.orgCatalogRow}
                        onClick={() => setOrgModalView("detail")}
                        type="button"
                      >
                        <FokunaIcon
                          name="tag"
                          size={16}
                          stroke={1.5}
                          style={{ color: "var(--fk-color-category-coral)" }}
                        />
                        <span className={styles.orgCatalogName}>{name}</span>
                        <span aria-hidden="true" className={styles.orgChevron}>
                          <FokunaIcon name="chevron-right" size={16} stroke={1.5} />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {orgModalView === "detail" ? (
                <div className={styles.orgForm}>
                  <Button
                    buttonType="icon-text-inline"
                    leadingIcon={<FokunaIcon name="chevron-left" size={16} stroke={1.5} />}
                    onClick={() => setOrgModalView("list")}
                    type="button"
                  >
                    Zurück
                  </Button>
                  <InputGroup controlSize="lg" defaultValue="Fokus" label="Name" />
                  <div className={styles.orgColorField}>
                    <span className={styles.orgColorLabel}>Farbe</span>
                    <div className={styles.orgSwatches} role="listbox" aria-label="Farbe">
                      {["coral", "teal", "blue", "purple"].map((tone, index) => (
                        <span
                          aria-hidden="true"
                          className={styles.orgSwatch}
                          data-selected={index === 0 ? "true" : undefined}
                          key={tone}
                          style={{ background: `var(--fk-color-category-${tone})` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </Modal>
          </SpecimenBlock>

          <SpecimenBlock label="Confirmation Modal">
            <p className={styles.specimenBlockCopy}>
              Eigenes Modal auf dem Organizational-Shell-Contract (32 / 16 / 24). Name und
              Aufgabenanzahl in Label-Gewicht. Footer rechts: Abbrechen direkt neben Primary.
              Varianten: Aufgabe, Kategorie (Cascade), Label.
            </p>
            <div className={styles.organizationalModalActions}>
              <Button
                buttonType="outline"
                intent="tertiary"
                onClick={() => {
                  setDeleteConfirmKind("task");
                  setDeleteConfirmOpen(true);
                }}
                trailingIcon={null}
                type="button"
              >
                Aufgabe
              </Button>
              <Button
                buttonType="outline"
                intent="tertiary"
                onClick={() => {
                  setDeleteConfirmKind("category");
                  setDeleteConfirmOpen(true);
                }}
                trailingIcon={null}
                type="button"
              >
                Kategorie
              </Button>
              <Button
                buttonType="outline"
                intent="tertiary"
                onClick={() => {
                  setDeleteConfirmKind("label");
                  setDeleteConfirmOpen(true);
                }}
                trailingIcon={null}
                type="button"
              >
                Label
              </Button>
            </div>
            <ConfirmDeleteModal
              {...(deleteConfirmKind === "task"
                ? deleteConfirmCopy("task", "Wochenbericht fertigstellen")
                : deleteConfirmKind === "category"
                  ? deleteConfirmCopy("category", "Fokus", { taskCount: 2 })
                  : deleteConfirmCopy("label", "Deep Work"))}
              onConfirm={() => undefined}
              onOpenChange={setDeleteConfirmOpen}
              open={deleteConfirmOpen}
            />
          </SpecimenBlock>

          <SpecimenBlock className={styles.taskModalSpecimen} label="Aufgaben Modal">
            <p className={styles.specimenBlockCopy}>
              Task-Detail auf dem Aufgaben-Modal-Slot (Header, Subtasks, Property-Rail). Bausteine
              siehe Pattern-Docs §33–§35. Delete nutzt Confirmation Modal.
            </p>
            <ToggleGroup
              aria-label="Breadcrumb-Darstellung"
              items={[
                { value: "with", label: "Mit Breadcrumb" },
                { value: "without", label: "Ohne Breadcrumb" },
              ]}
              onValueChange={(value) => value && setShowTaskModalBreadcrumb(value === "with")}
              size="md"
              value={showTaskModalBreadcrumb ? "with" : "without"}
            />
            <TaskModalComposition showBreadcrumb={showTaskModalBreadcrumb} />
          </SpecimenBlock>
        </div>
      );

    case "calendar-drawer": {
      const specimenDay = new Date(2026, 6, 2);
      const specimenRange = { startHour: 7, hourCount: 11 } as const;
      const entryAt = (hour: number, minute: number, durationMinutes: number) => {
        const startsAt = new Date(specimenDay);
        startsAt.setHours(hour, minute, 0, 0);
        const endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000);
        return getCalendarEntryPosition(startsAt, endsAt, specimenRange);
      };

      return (
        <div className={styles.calendarDrawerSpecimen}>
          <CalendarDrawer
            actions={<Switcher size="md" value="Do, 2. Juli 2026" />}
            endHour={18}
            startHour={7}
            viewControl={
              <Dropdown
                appearance="text"
                aria-label="Kalenderfilter"
                controlSize="md"
                defaultValue="all"
                leadingIcon="calendar"
                options={[
                  { value: "all", label: "Alle" },
                  { value: "tasks", label: "Aufgaben" },
                  { value: "blocks", label: "Blocks" },
                ]}
              />
            }
          >
            <CalendarItem
              kind="task"
              meta="Ziel: Launch"
              style={entryAt(7, 20, 55)}
              time="07:20"
              title="Aufgabenname"
            />
            <CalendarItem
              kind="event"
              meta="Privat"
              style={entryAt(8, 45, 50)}
              time="08:45"
              title="Kalendereintrag"
              tone="neutral"
            />
            <CalendarItem
              icon="tennis"
              kind="block"
              meta="Sport"
              style={entryAt(10, 0, 60)}
              time="10:00"
              title="Blockname"
              tone="teal"
            />
            <CalendarItem
              kind="event"
              meta="Arbeit"
              style={entryAt(13, 0, 60)}
              time="13:00"
              title="Kalendereintrag"
              tone="teal"
            />
            <CalendarItem
              icon="newspaper"
              kind="block"
              meta="Lesen"
              style={entryAt(12, 0, 55)}
              time="12:00"
              title="Blockname"
              tone="coral"
            />
            <CalendarItem
              icon="fork-spoon"
              kind="block"
              meta="Essen"
              style={entryAt(14, 30, 55)}
              time="14:30"
              title="Blockname"
              tone="purple"
            />
          </CalendarDrawer>
        </div>
      );
    }

    case "checkbox":
      return (
        <Matrix>
          <MatrixRow label="Unchecked">
            {sizes.slice(0, 3).map((size) => (
              <Checkbox controlSize={size} key={size} label={size.toUpperCase()} />
            ))}
          </MatrixRow>
          <MatrixRow label="Checked">
            {sizes.slice(0, 3).map((size) => (
              <Checkbox controlSize={size} defaultChecked key={size} label={size.toUpperCase()} />
            ))}
          </MatrixRow>
          <MatrixRow label="Indeterminate">
            <Checkbox checked="indeterminate" label="Teilweise ausgewählt" />
          </MatrixRow>
          <MatrixRow label="Priority · unchecked">
            {(["low", "medium", "high", "urgent"] as const).map((priority) => (
              <Checkbox aria-label={`Priorität ${priority}`} key={priority} priority={priority} />
            ))}
          </MatrixRow>
          <MatrixRow label="Priority · checked">
            {(["low", "medium", "high", "urgent"] as const).map((priority) => (
              <Checkbox
                aria-label={`Priorität ${priority} ausgewählt`}
                defaultChecked
                key={priority}
                priority={priority}
              />
            ))}
          </MatrixRow>
          <MatrixRow label="Disabled">
            <Checkbox disabled label="Unchecked" />
            <Checkbox defaultChecked disabled label="Checked" />
          </MatrixRow>
          <MatrixRow label="Favorite">
            {sizes.slice(0, 3).map((size) => (
              <Checkbox
                aria-label={`Favorisieren ${size}`}
                controlSize={size}
                key={size}
                variant="favorite"
              />
            ))}
            {sizes.slice(0, 3).map((size) => (
              <Checkbox
                aria-label={`Favorisiert ${size}`}
                controlSize={size}
                defaultChecked
                key={size}
                variant="favorite"
              />
            ))}
          </MatrixRow>
          <MatrixRow label="Milestone · unchecked / checked">
            {sizes.slice(0, 3).map((size) => (
              <Checkbox
                aria-label={`Meilenstein ${size}`}
                controlSize={size}
                key={`off-${size}`}
                variant="milestone"
              />
            ))}
            {sizes.slice(0, 3).map((size) => (
              <Checkbox
                aria-label={`Meilenstein ${size} ausgewählt`}
                controlSize={size}
                defaultChecked
                key={`on-${size}`}
                variant="milestone"
              />
            ))}
          </MatrixRow>
        </Matrix>
      );

    case "radiobox":
      return (
        <Matrix>
          <MatrixRow label="state=unfilled">
            {sizes.slice(0, 3).map((size) => (
              <RadioGroupRoot key={size}>
                <Radio controlSize={size} label={`${size.toUpperCase()} option`} value={size} />
              </RadioGroupRoot>
            ))}
          </MatrixRow>
          <MatrixRow label="state=filled">
            {sizes.slice(0, 3).map((size) => (
              <RadioGroupRoot defaultValue={size} key={size}>
                <Radio controlSize={size} label={`${size.toUpperCase()} option`} value={size} />
              </RadioGroupRoot>
            ))}
          </MatrixRow>
          <MatrixRow label="state=disabled">
            <RadioGroupRoot>
              <Radio disabled label="Disabled" value="disabled" />
            </RadioGroupRoot>
          </MatrixRow>
        </Matrix>
      );

    case "breadcrumb":
      return (
        <Matrix>
          <MatrixRow label="Default (≤2)">
            <Breadcrumb
              items={[
                { label: "Aufgaben", href: "#" },
                { label: "Heute" },
              ]}
            />
          </MatrixRow>
          <MatrixRow label="Collapsed (≥3)">
            <Breadcrumb
              items={collapseBreadcrumbItems([
                { label: "Trainingsplan finalisieren", href: "#" },
                { label: "Intervall-Einheiten eintragen", href: "#" },
                { label: "Dienstag 8x1000m planen" },
              ])}
            />
          </MatrixRow>
        </Matrix>
      );

    case "switcher":
      return (
        <Matrix>
          {sizes.map((size) => (
            <MatrixRow key={size} label={`${size.toUpperCase()} · ${sizeHeights[size]} px`}>
              <Switcher size={size} value="20. – 26. Juli" />
            </MatrixRow>
          ))}
        </Matrix>
      );

    case "form":
      return (
        <Matrix>
          <MatrixRow label="Default">
            {sizes.map((size) => (
              <SizeSample key={size} size={size} wide>
                <InputField aria-label={`Input ${size}`} controlSize={size} placeholder="Email" />
              </SizeSample>
            ))}
          </MatrixRow>
          <MatrixRow label="Hover preview">
            {sizes.map((size) => (
              <SizeSample key={size} size={size} wide>
                <span className={styles.hoverPreview}>
                  <InputField
                    aria-label={`Input hover ${size}`}
                    controlSize={size}
                    placeholder="Email"
                  />
                </span>
              </SizeSample>
            ))}
          </MatrixRow>
          <MatrixRow label="Filled">
            {sizes.map((size) => (
              <SizeSample key={size} size={size} wide>
                <InputField
                  aria-label={`Input filled ${size}`}
                  controlSize={size}
                  defaultValue="mail@fokuna.de"
                />
              </SizeSample>
            ))}
          </MatrixRow>
          <MatrixRow label="Tinted">
            {sizes.map((size) => (
              <SizeSample key={size} size={size} wide>
                <InputField
                  aria-label={`Input tinted ${size}`}
                  controlSize={size}
                  placeholder="Email"
                  tone="tinted"
                />
              </SizeSample>
            ))}
          </MatrixRow>
          <MatrixRow label="Disabled">
            {sizes.map((size) => (
              <SizeSample key={size} size={size} wide>
                <InputField
                  aria-label={`Input disabled ${size}`}
                  controlSize={size}
                  disabled
                  placeholder="Email"
                />
              </SizeSample>
            ))}
          </MatrixRow>
          <MatrixRow label="Input group">
            <div className={styles.formSpecimen}>
              <InputGroup
                label="Email"
                placeholder="Email"
                sublabel="This is your public display name."
              />
              <InputGroup
                action={{ children: "Speichern", intent: "secondary" }}
                label="Mit Aktion"
                placeholder="Wert"
              />
            </div>
          </MatrixRow>
        </Matrix>
      );

    case "date-picker":
      return (
        <div className={styles.datePickerSpecimen}>
          <DatePicker defaultValue={new Date(2026, 6, 20)} />
          <DatePicker
            defaultValue={{ from: new Date(2026, 6, 20), to: new Date(2026, 6, 24) }}
            mode="range"
          />
          <DatePicker invalid placeholder="Ungültiges Datum" />
        </div>
      );

    case "dropdown":
      return (
        <Matrix>
          <MatrixRow label="form=button · type=single">
            {sizes.map((size) => (
              <SizeSample key={size} size={size}>
                <Dropdown
                  controlSize={size}
                  onValueChange={setDropdown}
                  options={[
                    { value: "day", label: "Tag" },
                    { value: "week", label: "Woche" },
                    { value: "month", label: "Monat" },
                  ]}
                  placeholder="Choose"
                  value={dropdown}
                />
              </SizeSample>
            ))}
          </MatrixRow>
          <MatrixRow label="form=button · type=icon">
            {sizes.map((size) => (
              <SizeSample key={size} size={size}>
                <Dropdown
                  controlSize={size}
                  defaultValue="alpha"
                  leadingIcon="diamond"
                  options={[
                    { value: "alpha", label: "Alphabetically" },
                    { value: "recent", label: "Neueste zuerst" },
                  ]}
                />
              </SizeSample>
            ))}
          </MatrixRow>
          <MatrixRow label="form=button · type=key-value">
            {sizes.map((size) => (
              <SizeSample key={size} size={size}>
                <Dropdown
                  controlSize={size}
                  defaultValue="popular"
                  keyLabel="Sort"
                  options={[
                    { value: "popular", label: "Alphabetically" },
                    { value: "recent", label: "Neueste zuerst" },
                  ]}
                />
              </SizeSample>
            ))}
          </MatrixRow>
          <MatrixRow label="form=text · type=single">
            {sizes.map((size) => (
              <SizeSample key={size} size={size}>
                <Dropdown
                  appearance="text"
                  controlSize={size}
                  defaultValue="week"
                  options={[
                    { value: "day", label: "Tag" },
                    { value: "week", label: "Choose" },
                    { value: "month", label: "Monat" },
                  ]}
                />
              </SizeSample>
            ))}
          </MatrixRow>
          <MatrixRow label="form=text · type=icon">
            {sizes.map((size) => (
              <SizeSample key={size} size={size}>
                <Dropdown
                  appearance="text"
                  controlSize={size}
                  defaultValue="alpha"
                  leadingIcon="diamond"
                  options={[
                    { value: "alpha", label: "Alphabetically" },
                    { value: "recent", label: "Neueste zuerst" },
                  ]}
                />
              </SizeSample>
            ))}
          </MatrixRow>
          <MatrixRow label="form=text · type=key-value">
            {sizes.map((size) => (
              <SizeSample key={size} size={size}>
                <Dropdown
                  appearance="text"
                  controlSize={size}
                  defaultValue="popular"
                  keyLabel="Sort"
                  options={[
                    { value: "popular", label: "Alphabetically" },
                    { value: "recent", label: "Neueste zuerst" },
                  ]}
                />
              </SizeSample>
            ))}
          </MatrixRow>
          <MatrixRow label="state=disabled">
            <Dropdown disabled options={[{ value: "day", label: "Tag" }]} placeholder="Woche" />
            <Dropdown
              appearance="text"
              disabled
              leadingIcon="diamond"
              options={[{ value: "day", label: "Alphabetically" }]}
              value="day"
            />
          </MatrixRow>
          <MatrixRow label="Meta menu">
            <MetaMenu
              items={[
                { label: "Bearbeiten", icon: "edit" },
                { label: "Duplizieren", icon: "layers" },
                { label: "Löschen", icon: "delete-alt", destructive: true },
              ]}
            />
          </MatrixRow>
        </Matrix>
      );

    case "filter-bar":
      return (
        <FilterBar
          filters={
            <TabBar
              aria-label="Aufgabenansicht"
              defaultValue="all"
              items={[
                { value: "all", label: "Alle Aufgaben" },
                { value: "goals", label: "Ziele" },
                { value: "focus", label: "Task Mode" },
                { value: "archive", label: "Archiv" },
              ]}
            />
          }
          search={<SearchField />}
          sort={
            <Dropdown
              keyLabel="Sort"
              options={[
                { value: "alphabetical", label: "Alphabetisch" },
                { value: "due", label: "Fälligkeit" },
              ]}
              defaultValue="alphabetical"
            />
          }
        />
      );

    case "sidebar":
      return (
        <div className={styles.sidebarSpecimen}>
          <AufgabenSidebar />
        </div>
      );

    case "block-rail":
      return (
        <div className={styles.blockRailSpecimen}>
          <section>
            <strong>BlockTile · Kategorievarianten</strong>
            <div className={styles.blockTilePalette}>
              {blockRailItems.map((item) => (
                <BlockTile
                  badge={item.badge}
                  icon={item.icon}
                  key={item.id}
                  label={item.label}
                  onClick={() => setActiveBlock(item.id)}
                  selected={activeBlock === item.id}
                  tone={item.tone}
                />
              ))}
            </div>
          </section>
          <section>
            <strong>state=default · Timeline</strong>
            <BlockRail
              activeId={activeBlock}
              items={blockRailItems}
              onActiveChange={setActiveBlock}
            />
          </section>
          <section>
            <strong>state=editable · Edit Rail</strong>
            <BlockRail
              activeId={activeBlock}
              items={blockRailItems}
              onActiveChange={setActiveBlock}
              state="editable"
            />
          </section>
        </div>
      );

    case "goal-card":
      return (
        <Matrix>
          <MatrixRow label="Figma default">
            <GoalCard
              href="#goal-card"
              imageAlt="Läuferinnen und Läufer beim Berlin Marathon"
              imageSrc="/pattern-library/goal-card-marathon.png"
              location="Berlin"
              milestones={[
                {
                  id: "one",
                  title: "Meilenstein Name",
                  completed: true,
                  subtasks: { completed: 0, total: 2 },
                  dueDate: "27. Juli 2026",
                },
                {
                  id: "two",
                  title: "Meilenstein Name",
                  subtasks: { completed: 0, total: 2 },
                  dueDate: "27. Juli 2026",
                },
              ]}
              progress={85}
              tags={[{ label: "Healthy", icon: "heart" }, { label: "Sport" }]}
              title="Berlin Marathon"
              totalMilestones={12}
            />
          </MatrixRow>
          <MatrixRow label="Ohne Ort, Tags und Subtasks">
            <GoalCard
              imageAlt="Läuferinnen und Läufer beim Berlin Marathon"
              imageSrc="/pattern-library/goal-card-marathon.png"
              milestones={[
                { id: "start", title: "Trainingsplan festlegen", completed: true },
                { id: "finish", title: "Marathon absolvieren", dueDate: "27. September 2026" },
                { id: "recover", title: "Regeneration planen" },
              ]}
              progress={42}
              title="Mein nächstes Laufziel"
            />
          </MatrixRow>
          <MatrixRow label="Leeres Ziel">
            <GoalCard
              emptyMilestoneActionHref="#create-milestone"
              progress={0}
              title="Neues Ziel"
            />
          </MatrixRow>
        </Matrix>
      );

    case "insight-cards": {
      const activityWeeks = [
        { label: "KW 21", value: 4 },
        { label: "KW 22", value: 3 },
        { label: "KW 23", value: 1 },
        { label: "KW 24", value: 2 },
        { label: "KW 25", value: 4 },
        { label: "KW 26", value: 4 },
        { label: "KW 27", value: 3 },
        { label: "KW 28", value: 5 },
        { label: "KW 29", value: 0 },
        { label: "KW 30", value: 0 },
      ];
      const consistencyStrong = Array.from({ length: 11 }, () => "strong" as const);
      return (
        <div className={styles.insightCardsSpecimen}>
          <MatrixRow label="Small · Deadline, Metric, Quote, Place, Ring, Priorities">
            <div className={styles.insightCardsRow}>
              <InsightCard
                elevated="micro"
                icon="calendar"
                size="sm"
                subtitle="noch 23 Tage"
                title="Zeitpunkt"
              >
                <InsightDeadlineContent day="28." month="Juli" year="2026" />
              </InsightCard>
              <InsightCard elevated="subtle" size="sm" subtitle="Aktuell" title="Aufgaben">
                <InsightMetricContent value={47} />
              </InsightCard>
              <InsightQuoteCard quote="Seit meiner Kindheit träume ich davon." />
              <InsightPlaceCard latitude={52.52} longitude={13.405} mapLabel="Berlin" zoom={12} />
              <InsightCard size="sm" title="Fortschritt Ziele">
                <InsightProgressRing value={79} />
              </InsightCard>
              <InsightCard size="sm" subtitle="Diese Woche" title="Prioritäten">
                <InsightPrioritiesContent
                  items={[
                    { id: "low", label: "Niedrig", count: 12, tone: "low" },
                    { id: "medium", label: "Mittel", count: 5, tone: "medium" },
                    { id: "high", label: "Hoch", count: 8, tone: "high" },
                    { id: "urgent", label: "Dringend", count: 3, tone: "urgent" },
                  ]}
                />
              </InsightCard>
            </div>
          </MatrixRow>
          <MatrixRow label="Medium · Activity, Segment Gauge, Consistency">
            <div className={styles.insightCardsRow}>
              <InsightActivityCard defaultThreshold={4} weeks={activityWeeks} />
              <InsightActivityCard
                showThresholdControl={false}
                subtitle="Aktivität"
                title="Aufgaben pro Woche"
                weeks={activityWeeks}
              />
              <InsightCard size="md" subtitle="85%" title="Termingerechte Zielerreichung">
                <InsightSegmentGauge value={85} />
              </InsightCard>
              <InsightCard size="md" subtitle="12 Tage" title="Journal Konsistenz">
                <InsightConsistencyGrid
                  rows={[
                    {
                      id: "in",
                      label: "Check-In",
                      days: [
                        "partial",
                        "empty",
                        "empty",
                        "strong",
                        "empty",
                        "empty",
                        ...consistencyStrong.slice(0, 8),
                        "partial",
                      ],
                    },
                    {
                      id: "out",
                      label: "Check-Out",
                      days: [
                        "empty",
                        "full",
                        "strong",
                        "full",
                        "empty",
                        ...consistencyStrong.slice(0, 9),
                        "empty",
                      ],
                    },
                  ]}
                />
              </InsightCard>
            </div>
          </MatrixRow>
          <MatrixRow label="Large · Milestones & Bars">
            <div className={styles.insightCardsRow}>
              <InsightCard
                action={
                  <Button
                    aria-label="Meilensteine öffnen"
                    buttonType="outline"
                    iconOnly
                    intent="tertiary"
                    leadingIcon="chevron-right-small"
                    size="sm"
                  >
                    Öffnen
                  </Button>
                }
                icon="flag"
                size="lg"
                subtitle="11 von 12 verbleibend"
                title="Meilensteine"
              >
                <InsightMilestonesContent
                  items={[
                    {
                      id: "1",
                      title: "Laufcoach engagieren",
                      completed: true,
                      dueDate: "27. Juli 2026",
                      subtasks: { completed: 0, total: 2 },
                    },
                    {
                      id: "2",
                      title: "Teilnahmeanmeldung einreichen",
                      dueDate: "27. Juli 2026",
                      subtasks: { completed: 0, total: 1 },
                    },
                    {
                      id: "3",
                      title: "Pace steigern",
                      dueDate: "27. Juli 2026",
                      subtasks: { completed: 0, total: 6 },
                    },
                    {
                      id: "4",
                      title: "Tempoläufe ins Training einbringen",
                      dueDate: "27. Juli 2026",
                      subtasks: { completed: 0, total: 6 },
                    },
                    {
                      id: "5",
                      title: "Lauf Equipment besorgen",
                      dueDate: "27. Juli 2026",
                      subtasks: { completed: 0, total: 9 },
                    },
                  ]}
                />
              </InsightCard>
              <InsightCard
                size="lg"
                subtitle="Über alle Ziele hinweg"
                title="Meilenstein Fortschritt"
              >
                <InsightBarList
                  items={[
                    { id: "pers", label: "Persönlich", valueLabel: "14h", progress: 86 },
                    { id: "work", label: "Arbeit", valueLabel: "10h", progress: 60 },
                    { id: "sport", label: "Sport", valueLabel: "6h", progress: 46 },
                    { id: "learn", label: "Lernen", valueLabel: "3h", progress: 32 },
                    { id: "rest", label: "Erholung", valueLabel: "1.5h", progress: 15 },
                    { id: "other", label: "Andere", valueLabel: "1.5h", progress: 7 },
                  ]}
                />
              </InsightCard>
            </div>
          </MatrixRow>
        </div>
      );
    }

    case "block-card":
      return (
        <Matrix>
          <MatrixRow label="Default · Meditation">
            <BlockCard
              description="Ruhiger Block mit entspannter Hintergrundmusik."
              durationLabel="15 min"
              icon="balance"
              meta={[
                { id: "pomodoro", label: "Pomodoro", icon: "clock-alert" },
                { id: "sound", label: "Woods", icon: "music" },
              ]}
              title="Meditation"
              tone="pink"
            />
          </MatrixRow>
        </Matrix>
      );

    case "template-card":
      return (
        <Matrix>
          <MatrixRow label="Default · Eat that Frog">
            <TemplateCard
              description="Starte mit dem Wichtigsten und gestalte den Rest des Tages bewusst."
              meta={[
                { id: "morning", label: "5 Elemente", icon: "sunrise" },
                { id: "evening", label: "3 Elemente", icon: "sunset" },
              ]}
              title="Eat that Frog"
            />
          </MatrixRow>
        </Matrix>
      );

    case "view-overlay":
      return (
        <div className={styles.viewOverlaySpecimen}>
          <p>
            Globale Shell für größere Bearbeitungsmodi (Journal Templates, Ziel bearbeiten, Block
            bearbeiten). Inhalt gehört in den mittleren Slot.
          </p>
          <Button intent="secondary" onClick={() => setViewOverlayOpen(true)} type="button">
            Overlay öffnen
          </Button>
          <ViewOverlay
            footerEnd={
              <>
                <Button buttonType="link" intent="tertiary" size="lg">
                  Verwerfen
                </Button>
                <Button intent="secondary" leadingIcon="save" size="lg">
                  Speichern
                </Button>
              </>
            }
            footerStart={
              <Button
                buttonType="link"
                intent="primary"
                leadingIcon="delete"
                size="lg"
                trailingIcon={null}
              >
                Template löschen
              </Button>
            }
            icon={
              <span className={styles.viewOverlayBlockIcon} data-tone="coral">
                <FokunaIcon name="newspaper" radius={2} size={24} stroke={2} />
              </span>
            }
            onOpenChange={setViewOverlayOpen}
            open={viewOverlayOpen}
            title={'"Lesen" bearbeiten'}
          >
            <TabBar
              items={[
                { value: "darstellung", label: "Darstellung" },
                { value: "rhythmus", label: "Rhythmus & Dauer" },
                { value: "fokus", label: "Fokusmodus" },
              ]}
              onValueChange={setViewOverlayTab}
              value={viewOverlayTab}
            />
            <div className={styles.viewOverlaySection}>
              <InputGroup defaultValue="Lesen" label="Titel" />
              <InputGroup
                defaultValue="Non Fiction Leseeinheit für den gebildeten morgen."
                label="Beschreibung"
                sublabel="Wird auf der Übersichtskarte angezeigt"
              />
            </div>
          </ViewOverlay>
        </div>
      );

    case "switch":
      return (
        <Matrix>
          <MatrixRow label="Off">
            <Switch label="Benachrichtigungen" />
          </MatrixRow>
          <MatrixRow label="On">
            <Switch defaultChecked label="Benachrichtigungen" />
          </MatrixRow>
          <MatrixRow label="Disabled">
            <Switch disabled label="Nicht verfügbar" />
          </MatrixRow>
        </Matrix>
      );

    case "slider":
      return (
        <div className={styles.sliderSpecimen}>
          <Slider defaultValue={[65]} label="Intensität" showValue />
          <Slider defaultValue={[40]} label="Schritte" showSteps showValue step={10} />
        </div>
      );

    case "tab-select":
      return (
        <Matrix>
          {sizes.map((size) => (
            <MatrixRow key={size} label={`${size.toUpperCase()} · ${sizeHeights[size]} px`}>
              <TabSelect
                aria-label={`Fokusklang ${size}`}
                addItem={{ label: "Option hinzufügen" }}
                items={[
                  { value: "ambient", label: "Deadline", icon: "calendar" },
                  { value: "energy", label: "Deadline", icon: "calendar" },
                  { value: "off", label: "Deadline", icon: "calendar" },
                ]}
                onValueChange={(value) => value && setTabSelect(value)}
                size={size}
                value={tabSelect}
              />
            </MatrixRow>
          ))}
        </Matrix>
      );

    case "tab-bar":
      return (
        <Matrix>
          {sizes.map((size) => (
            <MatrixRow key={size} label={`${size.toUpperCase()} · ${sizeHeights[size]} px`}>
              <TabBar
                aria-label={`Tabs ${size}`}
                items={[
                  { value: "overview", label: "Übersicht" },
                  { value: "activity", label: "Aktivität" },
                  { value: "settings", label: "Einstellungen" },
                ]}
                onValueChange={setTab}
                size={size}
                value={tab}
              />
            </MatrixRow>
          ))}
        </Matrix>
      );

    case "tags":
      return (
        <Matrix>
          {sizes.map((size) => (
            <MatrixRow key={size} label={`${size.toUpperCase()} · ${sizeHeights[size]} px`}>
              {(["neutral", "coral", "teal", "blue", "purple", "pink", "gold"] as const).map(
                (tone) => (
                  <Tag icon="tag" key={tone} size={size} tone={tone}>
                    {tone}
                  </Tag>
                ),
              )}
            </MatrixRow>
          ))}
        </Matrix>
      );

    case "toggle-group":
      return (
        <Matrix>
          {sizes.map((size) => (
            <MatrixRow key={size} label={`${size.toUpperCase()} · ${sizeHeights[size]} px`}>
              <ToggleGroup
                aria-label={`Journalphase ${size}`}
                items={[
                  { value: "check-in", label: "Deadline", icon: "clock" },
                  { value: "check-out", label: "Deadline", icon: "clock" },
                  { value: "later", label: "Deadline", icon: "clock" },
                ]}
                onValueChange={(value) => value && setToggle(value)}
                size={size}
                value={toggle}
              />
            </MatrixRow>
          ))}
        </Matrix>
      );

    case "search-field":
      return (
        <Matrix>
          <MatrixRow label="Default">
            {sizes.map((size) => (
              <SizeSample key={size} size={size}>
                <SearchField controlSize={size} placeholder="Suchen…" />
              </SizeSample>
            ))}
          </MatrixRow>
          <MatrixRow label="Hover preview">
            {sizes.map((size) => (
              <SizeSample key={size} size={size}>
                <span className={styles.hoverPreview}>
                  <SearchField controlSize={size} placeholder="Suchen…" />
                </span>
              </SizeSample>
            ))}
          </MatrixRow>
          <MatrixRow label="Focused width">
            {sizes.map((size) => (
              <SizeSample key={size} size={size} wide>
                <span className={styles.focusWidthPreview}>
                  <SearchField controlSize={size} placeholder="Suchen…" />
                </span>
              </SizeSample>
            ))}
          </MatrixRow>
          <MatrixRow label="Filled">
            {sizes.map((size) => (
              <SizeSample key={size} size={size} wide>
                <SearchField controlSize={size} defaultValue="Ziele suchen" />
              </SizeSample>
            ))}
          </MatrixRow>
        </Matrix>
      );

    case "page-header":
      return (
        <div className={styles.pageHeaderVariants}>
          <MatrixRow label="Journal">
            <PageHeader
              actions={
                <>
                  <HeaderMetaMenu />
                  <Switcher size="md" value="Do, 2. Juli 2026" />
                </>
              }
              center={
                <ToggleGroup
                  aria-label="Journalphase"
                  defaultValue="check-in"
                  items={[
                    { value: "check-in", label: "Check-In" },
                    { value: "check-out", label: "Check-Out" },
                  ]}
                />
              }
              title="Journal"
            />
          </MatrixRow>
          <MatrixRow label="Templates">
            <PageHeader
              actions={
                <>
                  <HeaderMetaMenu />
                  <HeaderSearch />
                  <Button leadingIcon="add-small" trailingIcon={null}>
                    Neues Template
                  </Button>
                </>
              }
              title="Templates"
            />
          </MatrixRow>
          <MatrixRow label="Alle Aufgaben">
            <AufgabenPageHeaderSpecimen />
          </MatrixRow>
          <MatrixRow label="Zeitblöcke">
            <PageHeader
              actions={
                <>
                  <HeaderMetaMenu />
                  <HeaderSearch />
                  <Button leadingIcon="add-small" trailingIcon={null}>
                    Neuer Zeitblock
                  </Button>
                </>
              }
              title="Zeitblöcke"
            />
          </MatrixRow>
          <MatrixRow label="Ziele">
            <PageHeader
              actions={
                <>
                  <HeaderMetaMenu />
                  <Button leadingIcon="add-small" trailingIcon={null}>
                    Neues Ziel
                  </Button>
                </>
              }
              center={
                <ToggleGroup
                  aria-label="Zielansicht"
                  defaultValue="all"
                  items={[
                    { value: "all", label: "Alle Ziele" },
                    { value: "timeline", label: "Timeline" },
                  ]}
                />
              }
              title="Ziele"
            />
          </MatrixRow>
          <MatrixRow label="Zieldetail">
            <PageHeader
              actions={
                <>
                  <HeaderMetaMenu />
                  <HeaderSearch />
                  <Button intent="secondary" leadingIcon="focus-target" trailingIcon={null}>
                    Ziel bearbeiten
                  </Button>
                </>
              }
              breadcrumb={
                <Button
                  aria-label="Zurück"
                  buttonType="outline"
                  iconOnly
                  intent="tertiary"
                  leadingIcon="chevron-left-small"
                >
                  Zurück
                </Button>
              }
              title="Berlin Marathon"
            />
          </MatrixRow>
          <MatrixRow label="Ziel erstellen">
            <PageHeader title="Ziel erstellen" />
          </MatrixRow>
          <MatrixRow label="Kalender">
            <PageHeader
              breadcrumb={<Switcher size="md" value="Heute" />}
              center={
                <ToggleGroup
                  aria-label="Kalenderansicht"
                  defaultValue="day"
                  items={[
                    { value: "day", label: "Tag" },
                    { value: "week", label: "Woche" },
                    { value: "month", label: "Monat" },
                  ]}
                />
              }
              title="Kalender"
              variant="calendar"
            />
          </MatrixRow>
          <MatrixRow label="Insights">
            <PageHeader title="Insights" />
          </MatrixRow>
          <MatrixRow label="Einstellungen">
            <PageHeader title="Einstellungen" />
          </MatrixRow>
        </div>
      );

    case "ui-shell":
      return (
        <div className={styles.shellSpecimen}>
          <UiShell sidebar={<AufgabenSidebar />}>
            <PageHeader
              actions={<Button intent="secondary">Neue Aufgabe</Button>}
              subtitle="Desktop Shell"
              title="Alle Aufgaben"
            />
            <Card className={styles.shellBody}>View-spezifischer Inhalt</Card>
          </UiShell>
        </div>
      );

    case "calendar-item-task":
      return <CalendarItemSpecimen kind="task" />;
    case "calendar-item-imported":
      return <CalendarItemSpecimen kind="event" />;
    case "calendar-item-block":
      return <CalendarItemSpecimen kind="block" />;

    case "task-add-item":
      return (
        <Matrix>
          <MatrixRow label="Inactive">
            <AddTask />
          </MatrixRow>
          <MatrixRow label="Active (compact)">
            <AddTask defaultExpanded focusOnExpand={false} />
          </MatrixRow>
          <MatrixRow label="Active with description">
            <AddTask
              defaultExpanded
              focusOnExpand={false}
              initialDescription={"Zeile eins\nZeile zwei — wächst mit dem Inhalt."}
              initialTitle="Aufgabenname"
            />
          </MatrixRow>
          <MatrixRow label="Active after list item">
            <div className="fk-task-list">
              <TaskListItem title="Aufgabenname" />
              <AddTask defaultExpanded focusOnExpand={false} />
            </div>
          </MatrixRow>
        </Matrix>
      );

    case "task-add-group":
      return (
        <Matrix>
          <MatrixRow label="Inactive">
            <AddGroup />
          </MatrixRow>
          <MatrixRow label="Active">
            <AddGroup defaultExpanded focusOnExpand={false} />
          </MatrixRow>
          <MatrixRow label="After add task (≥40px)">
            <div className="fk-task-list">
              <AddTask />
              <AddGroup />
            </div>
          </MatrixRow>
        </Matrix>
      );

    case "task-group-header":
      return (
        <Matrix>
          <MatrixRow label="Default">
            <TaskGroupHeader count={4} draggable title="Abschnitt 4" />
          </MatrixRow>
          <MatrixRow label="Hover preview">
            <span className={styles.hoverPreview}>
              <TaskGroupHeader count={4} draggable title="Abschnitt 4" />
            </span>
          </MatrixRow>
        </Matrix>
      );

    case "milestone-group-header":
      return <TaskItems variant="milestone-header" />;

    case "task-list-item":
      return (
        <Matrix>
          <MatrixRow label="States">
            <TaskItems />
          </MatrixRow>
          <MatrixRow label="Hierarchie (5 Ebenen)">
            <TaskListItem subtasks="1/1" title="Ebene 1">
              <TaskListItem indentLevel={1} subtasks="1/1" title="Ebene 2">
                <TaskListItem indentLevel={2} subtasks="1/1" title="Ebene 3">
                  <TaskListItem indentLevel={3} subtasks="1/1" title="Ebene 4">
                    <TaskListItem indentLevel={4} title="Ebene 5" />
                  </TaskListItem>
                </TaskListItem>
              </TaskListItem>
            </TaskListItem>
          </MatrixRow>
          <MatrixRow label="Rechtsklick-Kontextmenü">
            <div style={{ maxWidth: 480 }}>
              <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--fk-color-text-secondary)" }}>
                Rechtsklick: Priorität, Fälligkeit, Zeitschätzung und Tags als Level-2-Submenus
                (Panels wie in der Modal-Rail).
              </p>
              <TaskListItem
                contextMenuItems={
                  [
                    { label: "Bearbeiten", icon: "edit" },
                    {
                      type: "submenu",
                      label: "Priorität",
                      icon: "flag",
                      children: [
                        {
                          label: "Hoch",
                          checked: true,
                          leading: (
                            <FokunaIcon
                              fill="on"
                              name="flag"
                              size={16}
                              stroke={1.5}
                              style={{ color: "var(--fk-color-task-priority-urgent)" }}
                            />
                          ),
                        },
                        {
                          label: "Mittel",
                          leading: (
                            <FokunaIcon
                              fill="on"
                              name="flag"
                              size={16}
                              stroke={1.5}
                              style={{ color: "var(--fk-color-task-priority-medium)" }}
                            />
                          ),
                        },
                        {
                          label: "Niedrig",
                          leading: (
                            <FokunaIcon
                              fill="on"
                              name="flag"
                              size={16}
                              stroke={1.5}
                              style={{ color: "var(--fk-color-task-priority-low)" }}
                            />
                          ),
                        },
                        {
                          label: "Keine",
                          leading: (
                            <FokunaIcon
                              fill="off"
                              name="flag"
                              size={16}
                              stroke={1.5}
                              style={{ color: "var(--fk-color-icon-tertiary)" }}
                            />
                          ),
                        },
                      ],
                    },
                    {
                      type: "submenu",
                      label: "Fälligkeit",
                      icon: "calendar",
                      panel: true,
                      content: (
                        <div className="fk-task-property-panel">
                          <div className="fk-task-property-quick">
                            <button type="button">Heute</button>
                            <button type="button">Morgen</button>
                            <button type="button">Kein</button>
                          </div>
                          <span style={{ fontSize: 12, color: "var(--fk-color-text-tertiary)" }}>
                            DatePicker (inline) im Submenu
                          </span>
                        </div>
                      ),
                    },
                    {
                      type: "submenu",
                      label: "Zeitschätzung",
                      icon: "clock",
                      panel: true,
                      content: (
                        <div className="fk-task-property-panel">
                          <div className="fk-task-property-quick">
                            <button type="button">30 Min</button>
                            <button type="button">1 Std</button>
                            <button type="button">2 Std</button>
                          </div>
                          <span style={{ fontSize: 12, color: "var(--fk-color-text-tertiary)" }}>
                            Dauer-Dropdown im Submenu
                          </span>
                        </div>
                      ),
                    },
                    {
                      type: "submenu",
                      label: "Labels",
                      icon: "tag",
                      panel: true,
                      content: (
                        <div className="fk-task-tag-manager">
                          <span style={{ fontSize: 12, color: "var(--fk-color-text-tertiary)" }}>
                            Suche + Labels-Liste + Labels verwalten (wie Modal-Rail)
                          </span>
                        </div>
                      ),
                    },
                    {
                      type: "submenu",
                      label: "Verschieben",
                      icon: "folder",
                      children: [
                        { label: "Ohne Abschnitt" },
                        { label: "Heute", checked: true },
                        { label: "Eingang" },
                      ],
                    },
                    { label: "Duplizieren", icon: "layers" },
                    { type: "separator" },
                    { label: "Löschen", icon: "delete", destructive: true },
                  ] satisfies FokunaContextMenuEntry[]
                }
                due="Morgen"
                dueTone="coral"
                goal="Website Launch"
                subtasks="1/3"
                tags={["Design"]}
                title="Komponenten prüfen"
              />
            </div>
          </MatrixRow>
        </Matrix>
      );

    case "task-group":
      return (
        <Matrix>
          <MatrixRow label="Expanded">
            <TaskGroup count={3} draggable title="Abschnitt 3">
              <TaskListItem
                due="Morgen"
                dueTone="coral"
                goal="Website Launch"
                subtasks="1/3"
                tags={["Design"]}
                title="Komponenten prüfen"
              >
                <TaskListItem
                  favorite
                  indentLevel={1}
                  title="Pattern Library freigeben – geplant"
                />
              </TaskListItem>
              <TaskListItem title="Responsive QA abschließen" />
            </TaskGroup>
          </MatrixRow>
          <MatrixRow label="Collapsed">
            <TaskGroup count={3} defaultExpanded={false} title="Abschnitt 3" />
          </MatrixRow>
          <MatrixRow label="Hierarchie (5 Ebenen)">
            <TaskGroup count={5} title="Einrückung">
              <TaskListItem subtasks="1/1" title="Ebene 1">
                <TaskListItem indentLevel={1} subtasks="1/1" title="Ebene 2">
                  <TaskListItem indentLevel={2} subtasks="1/1" title="Ebene 3">
                    <TaskListItem indentLevel={3} subtasks="1/1" title="Ebene 4">
                      <TaskListItem indentLevel={4} title="Ebene 5" />
                    </TaskListItem>
                  </TaskListItem>
                </TaskListItem>
              </TaskListItem>
            </TaskGroup>
          </MatrixRow>
        </Matrix>
      );

    case "milestone-list-item":
      return <TaskItems variant="milestone-task" />;

    case "milestone-task-group":
      return (
        <MilestoneTaskGroup
          stages={[
            {
              id: "a",
              title: "Meilenstein A",
              count: "0/3",
              goal: "Mein Ziel",
              due: "Morgen",
              tags: ["Design", "Launch"],
              status: "current",
              children: (
                <>
                  <TaskListItem goal="Mein Ziel" milestoneTask title="Konzept bestätigen" />
                  <TaskListItem
                    goal="Mein Ziel"
                    milestoneTask
                    subtasks="0/2"
                    title="Komponenten prüfen"
                  />
                  <TaskListItem goal="Mein Ziel" milestoneTask title="Übergabe vorbereiten" />
                </>
              ),
            },
            {
              id: "b",
              title: "Meilenstein B",
              count: "0/1",
              goal: "Mein Ziel",
              due: "Morgen",
              children: <TaskListItem goal="Mein Ziel" milestoneTask title="Produktion starten" />,
            },
            { id: "c", title: "Meilenstein C", status: "completed" },
          ]}
        />
      );

    default:
      return <p>Für dieses Pattern ist noch kein Live-Specimen hinterlegt.</p>;
  }
}
