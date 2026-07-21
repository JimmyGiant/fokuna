import { createDb, getDb, type Database } from "@fokuna/db";

import { getDataDriver, getEnv } from "./env";

export function getDatabase(): Database {
  if (getDataDriver() !== "neon") {
    throw new Error("Neon database is only available when FOKUNA_DATA_DRIVER=neon.");
  }

  const url = getEnv().DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required for the neon data driver.");
  }

  return getDb(url);
}

export function createDatabase(connectionString: string): Database {
  return createDb(connectionString);
}
