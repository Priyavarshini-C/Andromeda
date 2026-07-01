// =============================================================================
// Andromeda — Resilient Database Singleton (PostgreSQL + Drizzle ORM Proxy)
// =============================================================================

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { PgDatabase } from "drizzle-orm/pg-core";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

// Audit and validate the environment configuration
const isMissingOrPlaceholder = 
  !connectionString || 
  connectionString.trim() === "" || 
  connectionString.includes("YOUR_POSTGRESQL_CONNECTION_STRING_PLACEHOLDER") ||
  connectionString.includes("placeholder");

let rawConn: postgres.Sql | null = null;
let rawDb: any = null;
let isDbConfigured = false;

if (isMissingOrPlaceholder) {
  console.warn("⚠️ [Andromeda DB] DATABASE_URL environment variable is missing or set to a placeholder.");
  console.warn("👉 Please set a valid PostgreSQL connection string in your .env.local file.");
  console.warn("👉 Database queries will gracefully return empty fallback lists instead of crashing Server Components.");
} else {
  try {
    // Establish connection pool with timeout constraints
    rawConn = postgres(connectionString, {
      max: 10,                 // Prevent connection pool exhaustion
      idle_timeout: 20,        // Close idle connections after 20s
      connect_timeout: 3,      // Fail fast after 3 seconds on connection timeout
      ssl: connectionString.includes("localhost") || connectionString.includes("127.0.0.1")
        ? false 
        : { rejectUnauthorized: false }, // Enforce SSL for Supabase/hosted databases
    });
    
    rawDb = drizzle(rawConn, { schema });
    isDbConfigured = true;

    // Cache the connection in global space in development to prevent connection pool leaks on HMR reload
    const globalForDb = globalThis as unknown as {
      conn: postgres.Sql | undefined;
    };
    if (process.env.NODE_ENV !== "production") {
      globalForDb.conn = rawConn;
    }
  } catch (err: any) {
    console.error("❌ [Andromeda DB] Failed to initialize PostgreSQL connection driver:", err.message || err);
  }
}

/**
 * Recursively wraps thenable/Promise query builders to catch connection timeouts,
 * connection refused errors, and standard PostgreSQL exceptions at execution time.
 */
const wrapThenable = (target: any): any => {
  if (!target || typeof target !== "object") return target;

  return new Proxy(target, {
    get(obj, prop, receiver) {
      // Intercept the Promise await trigger (.then)
      if (prop === "then") {
        return (onfulfilled?: any, onrejected?: any) => {
          return obj.then(
            (res: any) => {
              if (onfulfilled) return onfulfilled(res);
              return res;
            },
            (err: any) => {
              console.error("❌ [Andromeda DB] Query execution failed due to database connectivity loss:", err.message || err);
              // Gracefully fallback to empty array/null instead of throwing unhandled exceptions
              const fallback: any[] = [];
              if (onfulfilled) return onfulfilled(fallback);
              return fallback;
            }
          );
        };
      }

      const value = Reflect.get(obj, prop, receiver);

      // Recursively wrap chained builder methods (e.g. .from(), .where(), .limit())
      if (typeof value === "function") {
        return (...args: any[]) => {
          try {
            const result = value.apply(obj, args);
            if (result && typeof result === "object" && typeof result.then === "function") {
              return wrapThenable(result);
            }
            return result;
          } catch (err: any) {
            console.error("❌ [Andromeda DB] Query chain building failed:", err.message || err);
            return wrapThenable(Promise.resolve([]));
          }
        };
      }

      if (value && typeof value === "object") {
        return wrapThenable(value);
      }

      return value;
    }
  });
};

/**
 * Resilient Database Proxy Interface.
 * Intercepts query initializations and redirects queries to a safe mock executor if the database is offline.
 */
export const db = new Proxy({} as any, {
  getPrototypeOf(target) {
    if (isDbConfigured && rawDb) {
      return Reflect.getPrototypeOf(rawDb);
    }
    return PgDatabase.prototype;
  },
  get(target, prop, receiver) {
    // If the database connection is offline or unconfigured, return safe chainable mocks
    if (!isDbConfigured || !rawDb) {
      return (...args: any[]) => {
        const dummyQuery: any = {
          then: (onfulfilled: any) => onfulfilled ? onfulfilled([]) : Promise.resolve([]),
          catch: (onrejected: any) => onrejected ? onrejected([]) : Promise.resolve([]),
        };

        const makeChainable = (q: any): any => {
          return new Proxy(q, {
            get(t, p) {
              if (p === "then") return t.then;
              if (p === "catch") return t.catch;
              return (...a: any[]) => makeChainable(t);
            }
          });
        };

        return makeChainable(dummyQuery);
      };
    }

    // Access real database property
    const value = Reflect.get(rawDb, prop, receiver);

    // Intercept database methods (select, insert, update, delete, execute, query, etc.)
    if (typeof value === "function") {
      return (...args: any[]) => {
        try {
          const result = value.apply(rawDb, args);
          if (result && typeof result === "object" && typeof result.then === "function") {
            return wrapThenable(result);
          }
          return result;
        } catch (err: any) {
          console.error(`❌ [Andromeda DB] Query initialization failed for '${String(prop)}':`, err.message || err);
          return wrapThenable(Promise.resolve([]));
        }
      };
    }

    // Wrap relations namespaces (e.g. db.query.products.findMany)
    if (value && typeof value === "object") {
      return wrapThenable(value);
    }

    return value;
  }
});

export const conn = rawConn;
export const isDatabaseReachable = async (): Promise<boolean> => {
  if (!isDbConfigured || !rawConn) return false;
  try {
    // Simple verification query with a very short timeout
    await rawConn`SELECT 1`;
    return true;
  } catch {
    return false;
  }
};
