import { createCategoryInputSchema, reorderIdsInputSchema } from "@fokuna/api-contracts";

import { handleRouteError, jsonError, jsonOk, parseJson } from "@/server/http";
import { requireAppSession } from "@/server/session";
import * as taxonomy from "@/server/services/taxonomy-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAppSession();
    return jsonOk({ data: await taxonomy.listCategories(session.user.id) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAppSession();
    const body = await parseJson(request, createCategoryInputSchema);
    const category = await taxonomy.createCategory(session.user.id, body);
    return jsonOk({ data: category }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAppSession();
    const body = await parseJson(request, reorderIdsInputSchema);
    const categories = await taxonomy.reorderCategories(session.user.id, body);
    return jsonOk({ data: categories });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Invalid ")) {
      return jsonError(400, "validation_error", error.message);
    }
    return handleRouteError(error);
  }
}
