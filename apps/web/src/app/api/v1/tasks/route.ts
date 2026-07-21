import { createTaskInputSchema, listTasksQuerySchema } from "@fokuna/api-contracts";

import { handleRouteError, jsonError, jsonOk, parseJson } from "@/server/http";
import { requireAppSession } from "@/server/session";
import * as taskService from "@/server/services/task-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await requireAppSession();
    const url = new URL(request.url);
    const query = listTasksQuerySchema.parse({
      groupKey: url.searchParams.get("groupKey") ?? undefined,
      goalId: url.searchParams.get("goalId") ?? undefined,
      includeCompleted: url.searchParams.get("includeCompleted") ?? undefined,
    });
    const tasks = await taskService.listUserTasks(session.user.id, query);
    return jsonOk({ data: tasks });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAppSession();
    const body = await parseJson(request, createTaskInputSchema);
    const task = await taskService.createUserTask(session.user.id, body);
    return jsonOk({ data: task }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAppSession();
    const body = await request.json();
    if (body && typeof body === "object" && "orderedIds" in body) {
      const tasks = await taskService.reorderUserTasks(session.user.id, body);
      return jsonOk({ data: tasks });
    }
    return jsonError(400, "validation_error", "Ungültige Reorder-Anfrage");
  } catch (error) {
    return handleRouteError(error);
  }
}
