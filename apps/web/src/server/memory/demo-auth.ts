import { createId } from "@fokuna/domain";
import { createHmac, timingSafeEqual } from "node:crypto";

import { requireAuthSecret } from "../env";

export const DEMO_SESSION_COOKIE = "fokuna_demo_session";

/** Stable id so seed data and demo sessions survive HMR / module reloads. */
export const DEMO_SEED_USER_ID = "user_demo_seed";

interface DemoUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

interface DemoSessionPayload {
  userId: string;
  exp: number;
}

const globalDemoAuth = globalThis as typeof globalThis & {
  __fokunaDemoUsers?: Map<string, DemoUser>;
};

function getUsers(): Map<string, DemoUser> {
  if (!globalDemoAuth.__fokunaDemoUsers) {
    globalDemoAuth.__fokunaDemoUsers = new Map();
  }
  return globalDemoAuth.__fokunaDemoUsers;
}

function sign(value: string): string {
  return createHmac("sha256", requireAuthSecret()).update(value).digest("base64url");
}

function encodeSession(payload: DemoSessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decodeSession(token: string | undefined): DemoSessionPayload | null {
  if (!token) {
    return null;
  }

  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return null;
  }

  const expected = sign(body);
  const left = new Uint8Array(Buffer.from(signature));
  const right = new Uint8Array(Buffer.from(expected));
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as DemoSessionPayload;
    if (payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function registerDemoUser(input: {
  name: string;
  email: string;
  password: string;
}): DemoUser {
  const users = getUsers();
  const email = input.email.trim().toLowerCase();
  if ([...users.values()].some((user) => user.email === email)) {
    throw new Error("EMAIL_TAKEN");
  }

  const user: DemoUser = {
    id: createId("user"),
    name: input.name.trim(),
    email,
    password: input.password,
  };
  users.set(user.id, user);
  return user;
}

export function authenticateDemoUser(email: string, password: string): DemoUser | null {
  const users = getUsers();
  const normalized = email.trim().toLowerCase();
  const user = [...users.values()].find((entry) => entry.email === normalized);
  if (!user || user.password !== password) {
    return null;
  }
  return user;
}

export function createDemoSession(userId: string): string {
  return encodeSession({
    userId,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 14,
  });
}

export function getDemoSession(token: string | undefined): {
  user: { id: string; name: string; email: string };
} | null {
  const payload = decodeSession(token);
  if (!payload) {
    return null;
  }
  const user = getUsers().get(payload.userId);
  if (!user) {
    return null;
  }
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}

export function deleteDemoSession(): void {
  // Cookie clearing is handled by the route handler.
}

/** Seed a predictable local user for Playwright and first-run demos. */
export function ensureDemoSeedUser(): DemoUser {
  const users = getUsers();
  const existing = [...users.values()].find((user) => user.email === "demo@fokuna.app");
  if (existing) {
    return existing;
  }
  const user: DemoUser = {
    id: DEMO_SEED_USER_ID,
    name: "Demo Nutzer",
    email: "demo@fokuna.app",
    password: "demo-password-123",
  };
  users.set(user.id, user);
  return user;
}

ensureDemoSeedUser();
