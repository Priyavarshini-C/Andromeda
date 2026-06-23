// =============================================================================
// Andromeda — Database Singleton (SQLite + Drizzle ORM)
// =============================================================================

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";

// Resolve DB file path relative to project root
const DB_PATH = process.env.DATABASE_URL || path.join(process.cwd(), "andromeda.db");

// Create the SQLite connection
const sqlite = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

// Export the Drizzle ORM instance with full schema
export const db = drizzle(sqlite, { schema });

// Export the raw sqlite instance for migrations/raw queries
export { sqlite };
