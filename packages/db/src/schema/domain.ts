import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

export const taskPriorityEnum = pgEnum("task_priority", [
  "none",
  "low",
  "medium",
  "high",
  "urgent",
]);

export const goalStatusEnum = pgEnum("goal_status", [
  "draft",
  "active",
  "paused",
  "completed",
  "archived",
]);

export const calendarEntrySourceEnum = pgEnum("calendar_entry_source", [
  "task",
  "block",
  "manual",
  "google",
  "microsoft",
]);

export const focusSessionStatusEnum = pgEnum("focus_session_status", [
  "running",
  "paused",
  "completed",
  "cancelled",
]);

export const journalEntryKindEnum = pgEnum("journal_entry_kind", ["check_in", "check_out"]);

export const integrationProviderEnum = pgEnum("integration_provider", [
  "google_calendar",
  "microsoft_calendar",
  "accuweather",
  "stripe",
]);

export const integrationStatusEnum = pgEnum("integration_status", [
  "disconnected",
  "connecting",
  "connected",
  "error",
  "syncing",
]);

export const userProfile = pgTable("user_profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  timezone: text("timezone").notNull().default("Europe/Berlin"),
  locale: text("locale").notNull().default("de"),
  weekStartsOn: integer("week_starts_on").notNull().default(1),
  /** Account-scoped UI prefs (sidebar layout, future theme, …) — Zod: uiPreferencesSchema. */
  uiPreferences: jsonb("ui_preferences").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const category = pgTable(
  "category",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    colorToken: text("color_token").notNull(),
    icon: text("icon"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("category_user_name_idx").on(table.userId, table.name)],
);

export const label = pgTable(
  "label",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    colorToken: text("color_token").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("label_user_name_idx").on(table.userId, table.name)],
);

export const goal = pgTable("goal", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  motivation: text("motivation"),
  status: goalStatusEnum("status").notNull().default("draft"),
  imageUrl: text("image_url"),
  rhythm: jsonb("rhythm"),
  onboardingStep: text("onboarding_step"),
  sortOrder: integer("sort_order").notNull().default(0),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const milestone = pgTable("milestone", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  goalId: text("goal_id")
    .notNull()
    .references(() => goal.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const task = pgTable("task", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  goalId: text("goal_id").references(() => goal.id, { onDelete: "set null" }),
  milestoneId: text("milestone_id").references(() => milestone.id, {
    onDelete: "set null",
  }),
  categoryId: text("category_id").references(() => category.id, { onDelete: "cascade" }),
  parentTaskId: text("parent_task_id"),
  groupKey: text("group_key").notNull().default("inbox"),
  title: text("title").notNull(),
  description: text("description"),
  priority: taskPriorityEnum("priority").notNull().default("none"),
  estimateMinutes: integer("estimate_minutes"),
  dueDate: date("due_date"),
  isFavorite: boolean("is_favorite").notNull().default(false),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  sortOrder: integer("sort_order").notNull().default(0),
  labelIds: jsonb("label_ids").$type<string[]>().notNull().default([]),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const block = pgTable("block", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  goalId: text("goal_id").references(() => goal.id, { onDelete: "set null" }),
  categoryId: text("category_id").references(() => category.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  durationMinutes: integer("duration_minutes").notNull().default(25),
  icon: text("icon"),
  colorToken: text("color_token"),
  isTemplate: boolean("is_template").notNull().default(false),
  isPreset: boolean("is_preset").notNull().default(false),
  rhythm: jsonb("rhythm"),
  timerConfig: jsonb("timer_config"),
  focusConfig: jsonb("focus_config"),
  sortOrder: integer("sort_order").notNull().default(0),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const calendarEntry = pgTable("calendar_entry", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  source: calendarEntrySourceEnum("source").notNull(),
  taskId: text("task_id").references(() => task.id, { onDelete: "cascade" }),
  blockId: text("block_id").references(() => block.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  allDay: boolean("all_day").notNull().default(false),
  timezone: text("timezone").notNull().default("Europe/Berlin"),
  recurrenceRule: text("recurrence_rule"),
  externalId: text("external_id"),
  externalCalendarId: text("external_calendar_id"),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const focusSession = pgTable("focus_session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  taskId: text("task_id").references(() => task.id, { onDelete: "set null" }),
  blockId: text("block_id").references(() => block.id, { onDelete: "set null" }),
  status: focusSessionStatusEnum("status").notNull().default("running"),
  plannedDurationSeconds: integer("planned_duration_seconds").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  pausedAt: timestamp("paused_at", { withTimezone: true }),
  accumulatedPauseSeconds: integer("accumulated_pause_seconds").notNull().default(0),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  isMinimized: boolean("is_minimized").notNull().default(false),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const journalTemplate = pgTable("journal_template", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  isDefault: boolean("is_default").notNull().default(false),
  checkInElements: jsonb("check_in_elements").$type<unknown[]>().notNull().default([]),
  checkOutElements: jsonb("check_out_elements").$type<unknown[]>().notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const journalEntry = pgTable(
  "journal_entry",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    templateId: text("template_id").references(() => journalTemplate.id, {
      onDelete: "set null",
    }),
    kind: journalEntryKindEnum("kind").notNull(),
    entryDate: date("entry_date").notNull(),
    answers: jsonb("answers").$type<Record<string, unknown>>().notNull().default({}),
    mood: integer("mood"),
    energy: integer("energy"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("journal_entry_user_kind_date_idx").on(table.userId, table.kind, table.entryDate),
  ],
);

export const integration = pgTable(
  "integration",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    provider: integrationProviderEnum("provider").notNull(),
    status: integrationStatusEnum("status").notNull().default("disconnected"),
    encryptedCredentials: text("encrypted_credentials"),
    syncCursor: text("sync_cursor"),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    lastError: text("last_error"),
    meta: jsonb("meta"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("integration_user_provider_idx").on(table.userId, table.provider)],
);

export const billingCustomer = pgTable("billing_customer", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id").notNull().unique(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  planId: text("plan_id"),
  status: text("status").notNull().default("none"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const goalRelations = relations(goal, ({ many }) => ({
  milestones: many(milestone),
  tasks: many(task),
  blocks: many(block),
}));

export const milestoneRelations = relations(milestone, ({ one, many }) => ({
  goal: one(goal, { fields: [milestone.goalId], references: [goal.id] }),
  tasks: many(task),
}));

export const taskRelations = relations(task, ({ one }) => ({
  goal: one(goal, { fields: [task.goalId], references: [goal.id] }),
  milestone: one(milestone, { fields: [task.milestoneId], references: [milestone.id] }),
  category: one(category, { fields: [task.categoryId], references: [category.id] }),
}));

export const categoryRelations = relations(category, ({ many }) => ({
  tasks: many(task),
  blocks: many(block),
}));

export const labelRelations = relations(label, () => ({}));
