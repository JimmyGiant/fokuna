import { z } from "zod";

import { handleRouteError, jsonError, jsonOk, parseJson } from "@/server/http";
import { requireAppSession } from "@/server/session";
import * as catalog from "@/server/services/catalog-service";

export const dynamic = "force-dynamic";

const mutationSchema = z.object({
  provider: z.enum(["google_calendar", "microsoft_calendar"]),
  action: z.enum(["connect", "disconnect"]),
});

export async function GET() {
  try {
    const session = await requireAppSession();
    return jsonOk({ data: await catalog.listIntegrations(session.user.id) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAppSession();
    const body = await parseJson(request, mutationSchema);
    if (body.action === "connect") {
      return jsonOk({ data: await catalog.connectIntegration(session.user.id, body.provider) });
    }
    const integration = await catalog.disconnectIntegration(session.user.id, body.provider);
    if (!integration) {
      return jsonError(404, "not_found", "Integration nicht gefunden");
    }
    return jsonOk({ data: integration });
  } catch (error) {
    return handleRouteError(error);
  }
}
