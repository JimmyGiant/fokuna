"use client";

import { FokunaIcon } from "@fokuna/icons";
import {
  AddTask,
  Breadcrumb,
  Button,
  CalendarDrawer,
  CalendarItem,
  Callout,
  Card,
  Checkbox,
  DatePicker,
  Dropdown,
  FilterBar,
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
  Slider,
  Switch,
  Switcher,
  TabBar,
  TabSelect,
  Tag,
  TaskGroup,
  TaskGroupHeader,
  TaskListItem,
  TaskModalHeader,
  TaskModalMenu,
  TaskModalSlot,
  ToggleGroup,
  UiShell,
  type ControlSize,
} from "@fokuna/ui";
import { useState } from "react";

import styles from "./pattern-library.module.css";

const sizes: ControlSize[] = ["sm", "md", "lg", "xl"];
const sizeHeights: Record<ControlSize, number> = { sm: 28, md: 32, lg: 40, xl: 48 };

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

function CalendarItemSpecimen({ kind }: { kind: "task" | "event" | "block" }) {
  const content = {
    task: { title: "Landingpage prüfen", meta: "Ziel: Launch", tone: "teal" as const },
    event: { title: "Weekly Sync", meta: "Google Calendar", tone: "teal" as const },
    block: { title: "Deep Work", meta: "Pomodoro 25 min", tone: "purple" as const },
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

function TaskItems({ milestone = false }: { milestone?: boolean }) {
  return (
    <Matrix>
      <MatrixRow label="Default">
        <TaskListItem
          due="Morgen"
          goal="Website Launch"
          milestone={milestone}
          subtasks="1/3"
          tags={["Design"]}
          title={milestone ? "Meilenstein freigeben" : "Komponenten prüfen"}
        />
      </MatrixRow>
      <MatrixRow label="Favorite">
        <TaskListItem
          favorite
          milestone={milestone}
          title={milestone ? "Konzept bestätigt" : "Pattern Library freigeben"}
        />
      </MatrixRow>
      <MatrixRow label="Selected">
        <TaskListItem milestone={milestone} state="selected" title="Ausgewählter Eintrag" />
      </MatrixRow>
      <MatrixRow label="Dragged">
        <TaskListItem milestone={milestone} state="dragged" title="Gezogener Eintrag" />
      </MatrixRow>
      <MatrixRow label="Placeholder">
        <TaskListItem milestone={milestone} state="placeholder" title="Placeholder" />
      </MatrixRow>
    </Matrix>
  );
}

function TaskModalComposition({ editing = false }: { editing?: boolean }) {
  return (
    <TaskModalSlot
      footer={
        <>
          <Button buttonType="link">Aufgabe löschen</Button>
          <Button intent="secondary">Speichern</Button>
        </>
      }
      header={
        <TaskModalHeader
          defaultEditing={editing}
          description="Pattern-Library-Komponenten final prüfen."
          favorite
          title="Übergabe vorbereiten"
        />
      }
      menu={
        <TaskModalMenu
          items={[
            { label: "Priorität", value: "Hoch", content: <Tag tone="coral">Hoch</Tag> },
            { label: "Fälligkeit", value: "Morgen" },
            { label: "Zeitschätzung", value: "45 min" },
            { label: "Tags", value: "2" },
          ]}
        />
      }
    >
      <TaskGroup count={2} title="Unteraufgaben">
        <TaskListItem subtasks="1/2" title="Accessibility prüfen" />
        <TaskListItem title="Responsive QA abschließen" />
      </TaskGroup>
    </TaskModalSlot>
  );
}

export function PatternSpecimen({ slug }: { slug: string }) {
  const [tab, setTab] = useState("activity");
  const [toggle, setToggle] = useState("check-in");
  const [tabSelect, setTabSelect] = useState("ambient");
  const [dropdown, setDropdown] = useState("week");

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
          <MatrixRow label="Tertiary and link">
            {sizes.map((size) => (
              <SizeSample key={size} size={size}>
                <Button buttonType="outline" intent="tertiary" size={size}>
                  Button
                </Button>
              </SizeSample>
            ))}
            <Button buttonType="link">Button</Button>
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

    case "card-modal":
      return (
        <div className={styles.cardModalSpecimen}>
          <Card className={styles.referenceCard} elevated="medium">
            <div className={styles.cardHeaderDemo}>
              <FokunaIcon name="folder" size={24} />
              <strong>Active Projects</strong>
              <MetaMenu
                items={[
                  { label: "Bearbeiten", icon: "edit" },
                  { label: "Löschen", icon: "delete-alt", destructive: true },
                ]}
              />
            </div>
            <p>Ein neutraler Inhaltscontainer mit Surface, Border und optionaler Elevation.</p>
          </Card>
          <Modal
            description="Strukturierter Dialog auf Basis der produktiven Modal-Slots."
            footer={
              <>
                <Button buttonType="outline" intent="tertiary">
                  Abbrechen
                </Button>
                <Button intent="secondary">Speichern</Button>
              </>
            }
            title="Active Projects"
            trigger={
              <Button buttonType="outline" intent="tertiary">
                Modal öffnen
              </Button>
            }
          >
            <InputGroup label="Projektname" placeholder="Projektname eingeben" />
          </Modal>
        </div>
      );

    case "calendar-drawer":
      return (
        <CalendarDrawer
          actions={<Switcher size="sm" value="20. Juli" />}
          viewControl={
            <Dropdown
              aria-label="Kalenderansicht"
              controlSize="sm"
              defaultValue="day"
              options={[
                { value: "day", label: "Tag" },
                { value: "week", label: "Woche" },
              ]}
            />
          }
        >
          <CalendarItem
            kind="task"
            meta="Ziel: Launch"
            title="Landingpage prüfen"
            time="09:00"
            tone="teal"
          />
          <CalendarItem
            kind="event"
            meta="Google Calendar"
            title="Weekly Sync"
            time="11:30"
            tone="blue"
          />
          <CalendarItem
            kind="block"
            meta="Pomodoro 25 min"
            title="Deep Work"
            time="13:00"
            tone="purple"
          />
        </CalendarDrawer>
      );

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
          <MatrixRow label="Default">
            <Breadcrumb
              items={[
                { label: "Aufgaben", href: "#" },
                { label: "Alle Aufgaben", href: "#" },
                { label: "Heute" },
              ]}
            />
          </MatrixRow>
          <MatrixRow label="Collapsed">
            <Breadcrumb
              items={[
                { label: "Fokuna", href: "#" },
                { label: "…", href: "#" },
                { label: "Aufgabe bearbeiten" },
              ]}
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
          <MatrixRow label="state=default">
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
                  value={dropdown}
                />
              </SizeSample>
            ))}
          </MatrixRow>
          <MatrixRow label="state=disabled">
            <Dropdown disabled options={[{ value: "day", label: "Tag" }]} placeholder="Woche" />
          </MatrixRow>
          <MatrixRow label="type=key-value-pair">
            <Dropdown
              defaultValue="popular"
              keyLabel="Sortierung"
              options={[
                { value: "popular", label: "Beliebtheit" },
                { value: "recent", label: "Neueste zuerst" },
              ]}
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
          <Sidebar
            activeId="tasks"
            footer={<FokunaIcon name="settings-gear" />}
            items={[
              { id: "journal", label: "Journal", href: "#", icon: "notes" },
              { id: "calendar", label: "Kalender", href: "#", icon: "calendar" },
              { id: "tasks", label: "Aufgaben", href: "#", icon: "checklist" },
              { id: "goals", label: "Ziele", href: "#", icon: "focus-target" },
            ]}
            logo={<strong>F</strong>}
            secondaryActiveId="all"
            secondaryItems={[
              { id: "all", label: "Alle Aufgaben", href: "#", icon: "checklist" },
              { id: "today", label: "Heute", href: "#", icon: "calendar" },
              { id: "upcoming", label: "Demnächst", href: "#", icon: "clock" },
              { id: "completed", label: "Erledigt", href: "#", icon: "circle-check" },
            ]}
            secondaryTitle="Aufgaben"
          />
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
        <Matrix>
          <MatrixRow label="Content · full">
            <PageHeader
              actions={
                <>
                  <SearchField />
                  <Switcher size="md" value="20. – 26. Juli" />
                  <Button intent="secondary">Neue Aufgabe</Button>
                </>
              }
              breadcrumb={
                <Button aria-label="Zurück" buttonType="link" iconOnly leadingIcon="arrow-left">
                  Zurück
                </Button>
              }
              center={
                <ToggleGroup
                  aria-label="Ansicht"
                  defaultValue="list"
                  items={[
                    { value: "list", label: "Liste" },
                    { value: "board", label: "Board" },
                  ]}
                />
              }
              title="Alle Aufgaben"
            />
          </MatrixRow>
          <MatrixRow label="Content · reduced">
            <PageHeader
              actions={<Button intent="secondary">Neues Template</Button>}
              title="Templates"
            />
          </MatrixRow>
          <MatrixRow label="Calendar">
            <PageHeader
              actions={<Button intent="secondary">Neuer Eintrag</Button>}
              breadcrumb={<Switcher size="md" value="20. – 26. Juli" />}
              title="Kalender"
              variant="calendar"
            />
          </MatrixRow>
        </Matrix>
      );

    case "ui-shell":
      return (
        <div className={styles.shellSpecimen}>
          <UiShell
            sidebar={
              <Sidebar
                activeId="tasks"
                items={[
                  { id: "journal", label: "Journal", href: "#", icon: "notes" },
                  { id: "calendar", label: "Kalender", href: "#", icon: "calendar" },
                  { id: "tasks", label: "Aufgaben", href: "#", icon: "checklist" },
                  { id: "goals", label: "Ziele", href: "#", icon: "focus-target" },
                ]}
                logo={<strong>F</strong>}
                secondaryActiveId="all"
                secondaryItems={[
                  { id: "all", label: "Alle Aufgaben", href: "#", icon: "checklist" },
                  { id: "today", label: "Heute", href: "#", icon: "calendar" },
                  { id: "upcoming", label: "Demnächst", href: "#", icon: "clock" },
                ]}
                secondaryTitle="Aufgaben"
              />
            }
          >
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
          <MatrixRow label="Active">
            <AddTask expanded focusOnExpand={false} />
          </MatrixRow>
          <MatrixRow label="Subtask">
            <AddTask subtask />
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
      return (
        <Matrix>
          <MatrixRow label="Default">
            <TaskGroupHeader count={2} milestone title="Meilenstein A" />
          </MatrixRow>
          <MatrixRow label="Hover preview">
            <span className={styles.hoverPreview}>
              <TaskGroupHeader count={2} milestone title="Meilenstein A" />
            </span>
          </MatrixRow>
        </Matrix>
      );

    case "task-list-item":
      return <TaskItems />;

    case "task-group":
      return (
        <Matrix>
          <MatrixRow label="Expanded">
            <TaskGroup count={3} draggable title="Abschnitt 3">
              <TaskListItem
                due="Morgen"
                goal="Website Launch"
                subtasks="1/3"
                tags={["Design"]}
                title="Komponenten prüfen"
              />
              <TaskListItem favorite title="Pattern Library freigeben" />
              <TaskListItem title="Responsive QA abschließen" />
            </TaskGroup>
          </MatrixRow>
          <MatrixRow label="Collapsed">
            <TaskGroup count={3} expanded={false} title="Abschnitt 3" />
          </MatrixRow>
        </Matrix>
      );

    case "milestone-list-item":
      return <TaskItems milestone />;

    case "milestone-task-group":
      return (
        <MilestoneTaskGroup
          stages={[
            {
              id: "a",
              title: "Meilenstein A",
              count: "0/3",
              status: "current",
              children: (
                <>
                  <TaskListItem milestone title="Konzept bestätigen" />
                  <TaskListItem milestone title="Komponenten prüfen" />
                  <TaskListItem milestone title="Übergabe vorbereiten" />
                </>
              ),
            },
            {
              id: "b",
              title: "Meilenstein B",
              count: "0/1",
              children: <TaskListItem milestone title="Produktion starten" />,
            },
            { id: "c", title: "Meilenstein C", status: "completed" },
          ]}
        />
      );

    case "task-modal-header":
      return <TaskModalComposition editing />;

    case "task-modal-menu":
      return <TaskModalComposition />;

    case "task-modal-slot":
      return <TaskModalComposition />;

    default:
      return <p>Für dieses Pattern ist noch kein Live-Specimen hinterlegt.</p>;
  }
}
