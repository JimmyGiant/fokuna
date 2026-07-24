import { FokunaIcon } from "@fokuna/icons";
import {
  Sidebar,
  SidebarAvatar,
  UiShell,
  type SidebarItem,
  type SidebarSecondarySection,
} from "@fokuna/ui";
import Image from "next/image";
import type { ReactNode } from "react";

import styles from "./app-shell.module.css";

const primaryItems: SidebarItem[] = [
  { id: "calendar", label: "Kalender", href: "/app/kalender", icon: "calendar" },
  { id: "tasks", label: "Aufgaben", href: "/app/aufgaben", icon: "circle-check" },
  { id: "journal", label: "Journal", href: "/app/journal", icon: "writing" },
  { id: "goals", label: "Ziele", href: "/app/ziele", icon: "focus-target" },
  { id: "insights", label: "Insights", href: "/app/insights", icon: "trending" },
];

const footerItems: SidebarItem[] = [
  { id: "settings", label: "Einstellungen", href: "/app/einstellungen", icon: "settings-gear" },
];

const tasksSecondaryItems = [
  { id: "all", label: "Alle Aufgaben", href: "/app/aufgaben", icon: "checklist" as const },
  {
    id: "favorites",
    label: "Favoriten",
    href: "/app/aufgaben?filter=favorites",
    icon: "star" as const,
  },
  {
    id: "today",
    label: "Heute",
    href: "/app/aufgaben?filter=today",
    icon: "calendar-today" as const,
  },
  {
    id: "inbox",
    label: "Eingang",
    href: "/app/aufgaben?filter=inbox",
    icon: "inbox-empty" as const,
  },
];

const tasksSecondarySections: SidebarSecondarySection[] = [
  {
    id: "categories",
    label: "Kategorien",
    items: [
      {
        id: "buy",
        label: "Kaufen",
        href: "/app/aufgaben?category=buy",
        badge: "1",
        color: "var(--fk-color-category-teal)",
      },
      {
        id: "rent",
        label: "Mieten",
        href: "/app/aufgaben?category=rent",
        badge: "5",
        color: "var(--fk-color-category-coral)",
      },
    ],
  },
  {
    id: "goals",
    label: "Ziele",
    items: [
      {
        id: "marathon",
        label: "Berlin Marathon",
        href: "/app/aufgaben/ziele",
        icon: "focus-target",
        badge: "12",
      },
      {
        id: "novel",
        label: "Roman schreiben",
        href: "/app/aufgaben/ziele",
        icon: "focus-target",
        badge: "5",
      },
      {
        id: "my-goal",
        label: "Mein Ziel",
        href: "/app/aufgaben/ziele",
        icon: "focus-target",
        badge: "7",
      },
    ],
  },
  {
    id: "labels",
    label: "Labels",
    items: [
      {
        id: "label-buy",
        label: "Kaufen",
        href: "/app/aufgaben?label=kaufen",
        icon: "tag",
        badge: "2",
      },
      {
        id: "label-rent",
        label: "Mieten",
        href: "/app/aufgaben?label=mieten",
        icon: "tag",
        badge: "3",
      },
    ],
  },
];

export function AppShell({
  activeId,
  secondaryActiveId,
  children,
  overlay,
  /** When true, only the L1 icon rail is shown — no Aufgaben L2 sidebar. */
  primaryOnly = false,
}: {
  activeId: string;
  secondaryActiveId?: string;
  children: ReactNode;
  overlay?: ReactNode;
  primaryOnly?: boolean;
}) {
  const showTasksSecondary = activeId === "tasks" && !primaryOnly;

  return (
    <UiShell
      className={styles.shell}
      overlay={overlay}
      sidebar={
        <Sidebar
          activeId={activeId}
          footer={<SidebarAvatar alt="Demo Nutzer" src="/pattern-library/demo-profile.png" />}
          footerItems={footerItems}
          items={primaryItems}
          logo={
            <Image alt="Fokuna" height={32} src="/branding/fokuna_logo_no-text.svg" width={34} />
          }
          secondaryActiveId={showTasksSecondary ? secondaryActiveId : undefined}
          secondaryItems={showTasksSecondary ? tasksSecondaryItems : undefined}
          secondarySections={showTasksSecondary ? tasksSecondarySections : undefined}
        />
      }
    >
      <div className={styles.content}>{children}</div>
    </UiShell>
  );
}

export function ModuleEmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <section className={styles.empty}>
      <FokunaIcon name="rocket" size={24} stroke={1.5} />
      <h2>{title}</h2>
      <p>{description}</p>
      <a className={styles.emptyAction} href={actionHref}>
        {actionLabel}
      </a>
    </section>
  );
}
