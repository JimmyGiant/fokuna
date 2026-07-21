import { updateTaskInputSchema } from "@fokuna/api-contracts";

import { handleRouteError, jsonError, jsonOk, parseJson } from "@/server/http";
import { requireAppSession } from "@/server/session";
import * as taskService from "@/server/services/task-service";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ taskId: string }> }) {
  try {
    const session = await requireAppSession();
    const { taskId } = await context.params;
    const task = await taskService.getUserTask(session.user.id, taskId);
    if (!task) {
      return jsonError(404, "not_found", "Aufgabe nicht gefunden");
    }
    return jsonOk({ data: task });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ taskId: string }> }) {
  try {
    const session = await requireAppSession();
    const { taskId } = await context.params;
    const body = await parseJson(request, updateTaskInputSchema);
    const task = await taskService.updateUserTask(session.user.id, taskId, body);
    if (!task) {
      return jsonError(404, "not_found", "Aufgabe nicht gefunden");
    }
    return jsonOk({ data: task });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ taskId: string }> }) {
  try {
    const session = await requireAppSession();
    const { taskId } = await context.params;
    const task = await taskService.archiveUserTask(session.user.id, taskId);
    if (!task) {
      return jsonError(404, "not_found", "Aufgabe nicht gefunden");
    }
    return jsonOk({ data: task });
  } catch (error) {
    return handleRouteError(error);
  }
}
