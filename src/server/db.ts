import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./drizzle/schema";

const connectionString = import.meta.env.VITE_CHAIBUILDER_DATABASE_URL;

let db: PostgresJsDatabase<typeof schema> | null = null;

if (connectionString) {
  const client = postgres(connectionString, { max: 10 });
  db = drizzle(client, { schema });
}

export { db };

export { schema };

type DbResult<T> = { data: T; error: null } | { data: null; error: Error };

export async function safeQuery<T>(queryFn: () => Promise<T>): Promise<DbResult<T>> {
  try {
    if (!db) {
      return {
        data: null,
        error: new Error("Database not configured. Please set CHAIBUILDER_DATABASE_URL environment variable."),
      };
    }
    const data = await queryFn();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
