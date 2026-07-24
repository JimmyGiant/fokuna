import { handleRouteError, jsonError, jsonOk } from "@/server/http";
import { requireAppSession } from "@/server/session";
import * as catalog from "@/server/services/catalog-service";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ blockId: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await requireAppSession();
    const { blockId } = await context.params;
    const body = (await request.json().catch(() => ({}))) as { asOwn?: boolean };
    const block = await catalog.duplicateBlock(session.user.id, blockId, {
      asOwn: body.asOwn ?? true,
    });
    if (!block) return jsonError(404, "not_found", "Zeitblock nicht gefunden");
    return jsonOk({ data: block }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
