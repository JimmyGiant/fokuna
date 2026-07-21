import { handleRouteError, jsonOk } from "@/server/http";
import { requireAppSession } from "@/server/session";
import * as catalog from "@/server/services/catalog-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAppSession();
    return jsonOk({ data: await catalog.listJournalTemplates(session.user.id) });
  } catch (error) {
    return handleRouteError(error);
  }
}
