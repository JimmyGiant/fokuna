import { updateTaskSectionInputSchema } from "@fokuna/api-contracts";

import { handleRouteError, jsonError, jsonOk, parseJson } from "@/server/http";
import { requireAppSession } from "@/server/session";
import * as taskSections from "@/server/services/task-section-service";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ sectionId: string }> },
) {
  try {
    const session = await requireAppSession();
    const { sectionId } = await context.params;
    const body = await parseJson(request, updateTaskSectionInputSchema);
    const section = await taskSections.updateTaskSection(session.user.id, sectionId, body);
    if (!section) {
      return jsonError(404, "SECTION_NOT_FOUND", "Section not found");
    }
    return jsonOk({ data: section });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ sectionId: string }> },
) {
  try {
    const session = await requireAppSession();
    const { sectionId } = await context.params;
    const deleted = await taskSections.deleteTaskSection(session.user.id, sectionId);
    if (!deleted) {
      return jsonError(404, "SECTION_NOT_FOUND", "Section not found");
    }
    return jsonOk({ data: { id: sectionId } });
  } catch (error) {
    return handleRouteError(error);
  }
}
