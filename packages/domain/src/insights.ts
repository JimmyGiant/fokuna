import type { InsightMetricContract } from "./types";

/** Initial P0 insight metric contracts — values must be computed from these rules. */
export const initialInsightMetrics: InsightMetricContract[] = [
  {
    id: "tasks_completed_7d",
    label: "Aufgaben abgeschlossen",
    description: "Anzahl abgeschlossener Aufgaben in den letzten 7 Tagen.",
    dataSources: ["task.completedAt"],
    period: "7d",
    formula: "count(tasks where completedAt in last 7 days and archivedAt is null)",
  },
  {
    id: "goal_progress_active",
    label: "Zielerreichung",
    description: "Anteil erledigter Meilensteine über alle aktiven Ziele.",
    dataSources: ["goal.status", "milestone.completedAt"],
    period: "30d",
    formula: "completed_milestones / total_milestones for goals with status=active",
  },
  {
    id: "focus_minutes_7d",
    label: "Fokuszeit",
    description: "Summe der abgeschlossenen Fokusminuten der letzten 7 Tage.",
    dataSources: ["focus_session.startedAt", "focus_session.endedAt", "focus_session.status"],
    period: "7d",
    formula: "sum(elapsed_seconds of completed sessions in last 7 days) / 60",
  },
];
