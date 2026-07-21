import { startFocusSessionInputSchema, updateFocusSessionInputSchema } from "@fokuna/api-contracts";

import { handleRouteError, jsonError, jsonOk, parseJson } from "@/server/http";
import { requireAppSession } from "@/server/session";
import * as catalog from "@/server/services/catalog-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAppSession();
    return jsonOk({ data: await catalog.getActiveFocusSession(session.user.id) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAppSession();
    const body = await parseJson(request, startFocusSessionInputSchema);
    const focus = await catalog.startFocusSession(session.user.id, body);
    return jsonOk({ data: focus }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "FOCUS_ALREADY_ACTIVE") {
      return jsonError(409, "focus_active", "Es läuft bereits eine Fokus Session.");
    }
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireAppSession();
    const body = await request.json();
    const sessionId = body?.sessionId;
    if (typeof sessionId !== "string") {
      return jsonError(400, "validation_error", "sessionId ist erforderlich");
    }
    const patch = updateFocusSessionInputSchema.parse(body);
    const focus = await catalog.updateFocusSession(session.user.id, sessionId, patch);
    if (!focus) {
      return jsonError(404, "not_found", "Fokus Session nicht gefunden");
    }
    return jsonOk({ data: focus });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_FOCUS_TRANSITION") {
      return jsonError(409, "invalid_transition", "Ungültiger Fokus-Statuswechsel");
    }
    return handleRouteError(error);
  }
}
