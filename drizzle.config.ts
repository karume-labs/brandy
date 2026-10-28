import { defineConfig } from "drizzle-kit";
import { env } from "./src/shared/env.server";

export default defineConfig({
  schema: "./src/features/*/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
