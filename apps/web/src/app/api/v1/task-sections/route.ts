import {
  createTaskSectionInputSchema,
  listTaskSectionsQuerySchema,
  reorderTaskSectionsInputSchema,
  setTaskSectionMembershipInputSchema,
} from "@fokuna/api-contracts";

import { handleRouteError, jsonError, jsonOk, parseJson } from "@/server/http";
import { requireAppSession } from "@/server/session";
import * as taskSections from "@/server/services/task-section-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await requireAppSession();
    const url = new URL(request.url);
    const query = listTaskSectionsQuerySchema.parse({
      categoryId: url.searchParams.get("categoryId") ?? undefined,
      labelId: url.searchParams.get("labelId") ?? undefined,
    });
    const [sections, memberships] = await Promise.all([
      taskSections.listTaskSections(session.user.id, query),
      taskSections.listTaskSectionMemberships(session.user.id, query),
    ]);
    return jsonOk({ data: { sections, memberships } });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAppSession();
    const body = await parseJson(request, createTaskSectionInputSchema);
    const section = await taskSections.createTaskSection(session.user.id, body);
    return jsonOk({ data: section }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAppSession();
    const body = await parseJson(request, reorderTaskSectionsInputSchema);
    const sections = await taskSections.reorderTaskSections(session.user.id, body);
    return jsonOk({ data: sections });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Invalid ")) {
      return jsonError(400, "validation_error", error.message);
    }
    return handleRouteError(error);
  }
}

/** Set or clear a task's section membership for the current list scope. */
export async function PATCH(request: Request) {
  try {
    const session = await requireAppSession();
    const body = await parseJson(request, setTaskSectionMembershipInputSchema);
    const membership = await taskSections.setTaskSectionMembership(session.user.id, body);
    return jsonOk({ data: membership });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "TASK_NOT_FOUND") {
        return jsonError(404, "TASK_NOT_FOUND", "Task not found");
      }
      if (error.message === "SECTION_NOT_FOUND") {
        return jsonError(404, "SECTION_NOT_FOUND", "Section not found");
      }
    }
    return handleRouteError(error);
  }
}
