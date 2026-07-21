import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "./schema";

export type Database = NeonHttpDatabase<typeof schema>;

let cached: Database | null = null;

export function createDb(connectionString: string): Database {
  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}

/** Lazy singleton — only connects when first called with a DATABASE_URL. */
export function getDb(connectionString = process.env.DATABASE_URL): Database {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Configure Neon PostgreSQL before using the data layer.",
    );
  }

  if (!cached) {
    cached = createDb(connectionString);
  }

  return cached;
}

export function resetDbForTests(): void {
  cached = null;
}
