import { updateCategoryInputSchema } from "@fokuna/api-contracts";

import { handleRouteError, jsonError, jsonOk, parseJson } from "@/server/http";
import { requireAppSession } from "@/server/session";
import * as taxonomy from "@/server/services/taxonomy-service";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ categoryId: string }> },
) {
  try {
    const session = await requireAppSession();
    const { categoryId } = await context.params;
    const body = await parseJson(request, updateCategoryInputSchema);
    const category = await taxonomy.updateCategory(session.user.id, categoryId, body);
    if (!category) {
      return jsonError(404, "CATEGORY_NOT_FOUND", "Category not found");
    }
    return jsonOk({ data: category });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ categoryId: string }> },
) {
  try {
    const session = await requireAppSession();
    const { categoryId } = await context.params;
    const deleted = await taxonomy.deleteCategory(session.user.id, categoryId);
    if (!deleted) {
      return jsonError(404, "CATEGORY_NOT_FOUND", "Category not found");
    }
    return jsonOk({ data: { id: categoryId } });
  } catch (error) {
    return handleRouteError(error);
  }
}
