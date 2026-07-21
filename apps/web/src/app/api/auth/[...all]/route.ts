import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/server/auth";
import { getDataDriver } from "@/server/env";
import { jsonError } from "@/server/http";

const handler = toNextJsHandler(auth);

async function guard(request: Request, method: "GET" | "POST") {
  if (getDataDriver() === "memory") {
    return jsonError(
      404,
      "auth_driver",
      "Better Auth ist im Memory-Modus deaktiviert. Nutze /api/auth/demo.",
    );
  }

  return method === "GET" ? handler.GET(request) : handler.POST(request);
}

export const GET = (request: Request) => guard(request, "GET");
export const POST = (request: Request) => guard(request, "POST");
