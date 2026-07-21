import { cookies, headers } from "next/headers";

import { auth } from "./auth";
import { getDataDriver } from "./env";
import {
  DEMO_SESSION_COOKIE,
  createDemoSession,
  deleteDemoSession,
  getDemoSession,
} from "./memory/demo-auth";

export interface AppSession {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export async function getAppSession(): Promise<AppSession | null> {
  if (getDataDriver() === "memory") {
    const cookieStore = await cookies();
    return getDemoSession(cookieStore.get(DEMO_SESSION_COOKIE)?.value);
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    },
  };
}

export async function requireAppSession(): Promise<AppSession> {
  const session = await getAppSession();
  if (!session) {
    throw new Response(
      JSON.stringify({ error: { code: "unauthorized", message: "Unauthorized" } }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
  return session;
}

export { createDemoSession, deleteDemoSession, DEMO_SESSION_COOKIE };
