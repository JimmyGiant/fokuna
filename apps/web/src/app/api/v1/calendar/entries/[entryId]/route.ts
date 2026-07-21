import { moveCalendarEntryInputSchema } from "@fokuna/api-contracts";

import { handleRouteError, jsonError, jsonOk, parseJson } from "@/server/http";
import { requireAppSession } from "@/server/session";
import * as catalog from "@/server/services/catalog-service";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ entryId: string }> }) {
  try {
    const session = await requireAppSession();
    const { entryId } = await context.params;
    const body = await parseJson(request, moveCalendarEntryInputSchema);
    const entry = await catalog.moveCalendarEntry(session.user.id, entryId, body);
    if (!entry) {
      return jsonError(404, "not_found", "Kalendereintrag nicht gefunden");
    }
    return jsonOk({ data: entry });
  } catch (error) {
    return handleRouteError(error);
  }
}
