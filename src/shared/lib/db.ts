import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as assetsBrandSchema from "@/features/assets/brand-schema";
import * as assetsSchema from "@/features/assets/schema";
import * as auditSchema from "@/features/audit/schema";
import * as authSchema from "@/features/auth/schema";
import * as brandSchema from "@/features/brand/schema";
import * as workspaceSchema from "@/features/workspace/schema";
import { env } from "@/shared/env.server";

/** Bounded pool so a traffic spike can't open unbounded connections. */
const DB_POOL_MAX = 10;
const IDLE_TIMEOUT_MS = 30_000;
const CONNECTION_TIMEOUT_MS = 10_000;

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: DB_POOL_MAX,
  idleTimeoutMillis: IDLE_TIMEOUT_MS,
  connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
});

// Without a listener, an error on an idle client is an unhandled 'error'
// event that crashes the whole process.
pool.on("error", (error) => {
  console.error("[db] Unexpected error on idle client:", error);
});

export const db = drizzle(pool, {
  schema: {
    ...authSchema,
    ...auditSchema,
    ...assetsSchema,
    ...assetsBrandSchema,
    ...brandSchema,
    ...workspaceSchema,
  },
});
