import { assetsRouter } from "@/features/assets/server/router";
import { auditRouter } from "@/features/audit/server/router";
import { usersRouter } from "@/features/auth/server/router";
import { osServer } from "@/orpc/server";

export const rootRouter = osServer.router({
  health: osServer.route({}).handler(() => ({ status: "ok" })),
  assets: assetsRouter,
  audit: auditRouter,
  users: usersRouter,
});

export type RootRouter = typeof rootRouter;
