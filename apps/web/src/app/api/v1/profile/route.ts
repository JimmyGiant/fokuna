import { updateUserProfileInputSchema } from "@fokuna/api-contracts";

import { handleRouteError, jsonOk, parseJson } from "@/server/http";
import { requireAppSession } from "@/server/session";
import * as profileService from "@/server/services/profile-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAppSession();
    return jsonOk({ data: await profileService.getOrCreateUserProfile(session.user.id) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireAppSession();
    const body = await parseJson(request, updateUserProfileInputSchema);
    const profile = await profileService.updateUserProfile(session.user.id, body);
    return jsonOk({ data: profile });
  } catch (error) {
    return handleRouteError(error);
  }
}
