import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().optional(),
  FOKUNA_DATA_DRIVER: z.enum(["neon", "memory"]).optional(),
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  MICROSOFT_CLIENT_ID: z.string().optional(),
  MICROSOFT_CLIENT_SECRET: z.string().optional(),
  ACCUWEATHER_API_KEY: z.string().optional(),
  INTEGRATION_ENCRYPTION_KEY: z.string().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

let cached: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (!cached) {
    cached = envSchema.parse(process.env);
  }
  return cached;
}

export function getAppUrl(): string {
  const env = getEnv();
  return env.BETTER_AUTH_URL ?? env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function getDataDriver(): "neon" | "memory" {
  const env = getEnv();
  if (env.FOKUNA_DATA_DRIVER) {
    return env.FOKUNA_DATA_DRIVER;
  }
  return env.DATABASE_URL ? "neon" : "memory";
}

export function requireAuthSecret(): string {
  const secret = getEnv().BETTER_AUTH_SECRET;
  if (secret) {
    return secret;
  }
  if (getEnv().NODE_ENV === "production") {
    throw new Error("BETTER_AUTH_SECRET must be set in production.");
  }
  return "fokuna-dev-only-secret-change-me-32chars";
}
