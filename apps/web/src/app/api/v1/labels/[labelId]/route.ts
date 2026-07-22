import { updateLabelInputSchema } from "@fokuna/api-contracts";

import { handleRouteError, jsonError, jsonOk, parseJson } from "@/server/http";
import { requireAppSession } from "@/server/session";
import * as taxonomy from "@/server/services/taxonomy-service";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ labelId: string }> },
) {
  try {
    const session = await requireAppSession();
    const { labelId } = await context.params;
    const body = await parseJson(request, updateLabelInputSchema);
    const label = await taxonomy.updateLabel(session.user.id, labelId, body);
    if (!label) {
      return jsonError(404, "LABEL_NOT_FOUND", "Label not found");
    }
    return jsonOk({ data: label });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ labelId: string }> },
) {
  try {
    const session = await requireAppSession();
    const { labelId } = await context.params;
    const deleted = await taxonomy.deleteLabel(session.user.id, labelId);
    if (!deleted) {
      return jsonError(404, "LABEL_NOT_FOUND", "Label not found");
    }
    return jsonOk({ data: { id: labelId } });
  } catch (error) {
    return handleRouteError(error);
  }
}
