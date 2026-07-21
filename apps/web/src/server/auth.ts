import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import * as schema from "@fokuna/db/schema";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Resend } from "resend";

import { getDatabase } from "./db";
import { getAppUrl, getDataDriver, getEnv, requireAuthSecret } from "./env";

function createEmailSender() {
  const env = getEnv();
  if (!env.RESEND_API_KEY) {
    return async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
      console.info("[auth-email:dev]", { to, subject, htmlLength: html.length });
    };
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const from = env.RESEND_FROM_EMAIL ?? "Fokuna <onboarding@resend.dev>";

  return async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
    await resend.emails.send({ from, to, subject, html });
  };
}

const sendEmail = createEmailSender();

function createNeonAuth() {
  const db = getDatabase();

  return betterAuth({
    appName: "Fokuna",
    baseURL: getAppUrl(),
    secret: requireAuthSecret(),
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: Boolean(getEnv().RESEND_API_KEY),
      sendResetPassword: async ({ user, url }) => {
        await sendEmail({
          to: user.email,
          subject: "Fokuna Passwort zurücksetzen",
          html: `<p>Hallo ${user.name},</p><p><a href="${url}">Passwort zurücksetzen</a></p>`,
        });
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        await sendEmail({
          to: user.email,
          subject: "Fokuna E-Mail bestätigen",
          html: `<p>Hallo ${user.name},</p><p><a href="${url}">E-Mail bestätigen</a></p>`,
        });
      },
    },
    plugins: [nextCookies()],
  });
}

type AuthInstance = ReturnType<typeof createNeonAuth>;

let cachedAuth: AuthInstance | null = null;

export function getAuth(): AuthInstance {
  if (getDataDriver() === "memory") {
    throw new Error("Better Auth is unavailable in memory mode. Use demo auth.");
  }
  if (!cachedAuth) {
    cachedAuth = createNeonAuth();
  }
  return cachedAuth;
}

/** Lazy proxy so importing this module in memory mode does not require DATABASE_URL. */
export const auth = new Proxy({} as AuthInstance, {
  get(_target, property, receiver) {
    const instance = getAuth();
    const value = Reflect.get(instance, property, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
