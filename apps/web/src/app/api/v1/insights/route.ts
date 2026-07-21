import { initialInsightMetrics } from "@fokuna/domain";

import { handleRouteError, jsonOk } from "@/server/http";
import { requireAppSession } from "@/server/session";
import * as taskService from "@/server/services/task-service";
import * as catalog from "@/server/services/catalog-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAppSession();
    const [tasks, goals, focus] = await Promise.all([
      taskService.listUserTasks(session.user.id, { includeCompleted: true }),
      catalog.listGoals(session.user.id),
      catalog.getActiveFocusSession(session.user.id),
    ]);

    const completed = tasks.filter((task) => task.isCompleted).length;
    const activeGoals = goals.filter((goal) => goal.status === "active").length;

    return jsonOk({
      data: {
        contracts: initialInsightMetrics,
        cards: [
          {
            id: "tasks_completed_7d",
            title: "Aufgaben abgeschlossen",
            value: String(completed),
            hint: completed === 0 ? "Schließe deine erste Aufgabe ab." : "Weiter so.",
          },
          {
            id: "goal_progress_active",
            title: "Aktive Ziele",
            value: String(activeGoals),
            hint: activeGoals === 0 ? "Lege dein erstes Ziel an." : "Ziele im Blick behalten.",
          },
          {
            id: "focus_minutes_7d",
            title: "Aktive Fokus Session",
            value: focus ? `${Math.round(focus.elapsedSeconds / 60)} min` : "—",
            hint: focus ? "Session läuft." : "Starte einen Fokusblock aus Aufgaben.",
          },
        ],
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
