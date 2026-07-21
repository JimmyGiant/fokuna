import { z } from "zod";

import {
  DEMO_SESSION_COOKIE,
  authenticateDemoUser,
  createDemoSession,
  registerDemoUser,
} from "@/server/memory/demo-auth";
import { getDataDriver } from "@/server/env";
import { handleRouteError, jsonError, jsonOk, parseJson } from "@/server/http";

const credentialsSchema = z.object({
  action: z.enum(["sign-in", "sign-up", "sign-out"]),
  name: z.string().trim().min(1).max(120).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).max(200).optional(),
});

export async function POST(request: Request) {
  try {
    if (getDataDriver() !== "memory") {
      return jsonError(404, "auth_driver", "Demo-Auth ist nur im Memory-Modus verfügbar.");
    }

    const body = await parseJson(request, credentialsSchema);

    if (body.action === "sign-out") {
      const response = jsonOk({ ok: true });
      response.cookies.set(DEMO_SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
      return response;
    }

    if (!body.email || !body.password) {
      return jsonError(400, "validation_error", "E-Mail und Passwort sind erforderlich.");
    }

    if (body.action === "sign-up") {
      if (!body.name) {
        return jsonError(400, "validation_error", "Name ist erforderlich.");
      }
      try {
        const user = registerDemoUser({
          name: body.name,
          email: body.email,
          password: body.password,
        });
        const response = jsonOk({ user: { id: user.id, name: user.name, email: user.email } });
        response.cookies.set(DEMO_SESSION_COOKIE, createDemoSession(user.id), {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 14,
        });
        return response;
      } catch {
        return jsonError(409, "email_taken", "Diese E-Mail ist bereits registriert.");
      }
    }

    const user = authenticateDemoUser(body.email, body.password);
    if (!user) {
      return jsonError(401, "invalid_credentials", "E-Mail oder Passwort ist ungültig.");
    }

    const response = jsonOk({ user: { id: user.id, name: user.name, email: user.email } });
    response.cookies.set(DEMO_SESSION_COOKIE, createDemoSession(user.id), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
