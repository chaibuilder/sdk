import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

const sqlite = new Database("chaibuilder.db");
const db = drizzle(sqlite);

export { db };
