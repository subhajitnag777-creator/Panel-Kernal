import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Cache connections across hot reloads in serverless / development
declare global {
  // eslint-disable-next-line no-var
  var __dbInstance: ReturnType<typeof drizzle> | undefined;
}

function createDatabaseConnection() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    // If not configured, throw explicit actionable error
    throw new Error(
      "DATABASE_URL is not configured in process.env. Please provide a valid Neon Postgres connection string."
    );
  }

  // Optimize for serverless latency
  neonConfig.fetchConnectionCache = true;
  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}

export const db = global.__dbInstance || createDatabaseConnection();

if (process.env.NODE_ENV !== "production") {
  global.__dbInstance = db;
}
