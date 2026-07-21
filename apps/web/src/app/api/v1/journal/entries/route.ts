import { upsertJournalEntryInputSchema } from "@fokuna/api-contracts";

import { handleRouteError, jsonOk, parseJson } from "@/server/http";
import { requireAppSession } from "@/server/session";
import * as catalog from "@/server/services/catalog-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await requireAppSession();
    const body = await parseJson(request, upsertJournalEntryInputSchema);
    const entry = await catalog.upsertJournalEntry(session.user.id, body);
    return jsonOk({ data: entry });
  } catch (error) {
    return handleRouteError(error);
  }
}
