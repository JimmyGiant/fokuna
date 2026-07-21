import { createGoalInputSchema } from "@fokuna/api-contracts";

import { handleRouteError, jsonOk, parseJson } from "@/server/http";
import { requireAppSession } from "@/server/session";
import * as catalog from "@/server/services/catalog-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAppSession();
    return jsonOk({ data: await catalog.listGoals(session.user.id) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAppSession();
    const body = await parseJson(request, createGoalInputSchema);
    const goal = await catalog.createGoal(session.user.id, body);
    return jsonOk({ data: goal }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
