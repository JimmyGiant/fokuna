export type TaskPriority = "none" | "low" | "medium" | "high" | "urgent";

export type GoalStatus = "draft" | "active" | "paused" | "completed" | "archived";

export type CalendarEntrySource = "task" | "block" | "manual" | "google" | "microsoft";

export type FocusSessionStatus = "running" | "paused" | "completed" | "cancelled";

export type JournalEntryKind = "check_in" | "check_out";

export type IntegrationProvider =
  "google_calendar" | "microsoft_calendar" | "accuweather" | "stripe";

export type IntegrationStatus = "disconnected" | "connecting" | "connected" | "error" | "syncing";

export interface TaskEntity {
  id: string;
  userId: string;
  goalId: string | null;
  milestoneId: string | null;
  parentTaskId: string | null;
  groupKey: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  estimateMinutes: number | null;
  dueDate: string | null;
  isFavorite: boolean;
  isCompleted: boolean;
  completedAt: string | null;
  sortOrder: number;
  tags: string[];
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FocusSessionEntity {
  id: string;
  userId: string;
  taskId: string | null;
  blockId: string | null;
  status: FocusSessionStatus;
  plannedDurationSeconds: number;
  startedAt: string;
  pausedAt: string | null;
  accumulatedPauseSeconds: number;
  endedAt: string | null;
  isMinimized: boolean;
}

export interface InsightMetricContract {
  id: string;
  label: string;
  description: string;
  dataSources: string[];
  period: "7d" | "30d" | "90d" | "custom";
  formula: string;
}
