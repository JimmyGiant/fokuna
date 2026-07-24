import { updateBlockInputSchema } from "@fokuna/api-contracts";

import { handleRouteError, jsonError, jsonOk, parseJson } from "@/server/http";
import { requireAppSession } from "@/server/session";
import * as catalog from "@/server/services/catalog-service";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ blockId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await requireAppSession();
    const { blockId } = await context.params;
    const block = await catalog.getBlock(session.user.id, blockId);
    if (!block) return jsonError(404, "not_found", "Zeitblock nicht gefunden");
    return jsonOk({ data: block });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await requireAppSession();
    const { blockId } = await context.params;
    const body = await parseJson(request, updateBlockInputSchema);
    const block = await catalog.updateBlock(session.user.id, blockId, body);
    if (!block) return jsonError(404, "not_found", "Zeitblock nicht gefunden");
    return jsonOk({ data: block });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await requireAppSession();
    const { blockId } = await context.params;
    const result = await catalog.deleteBlock(session.user.id, blockId);
    if (!result) return jsonError(404, "not_found", "Zeitblock nicht gefunden");
    return jsonOk({ data: result });
  } catch (error) {
    return handleRouteError(error);
  }
}
