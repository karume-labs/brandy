import { libraryAssetsAdminRouter } from "@/features/assets/server/library-admin-router";
import { publicLibraryRouter } from "@/features/assets/server/public-library-router";
import { brandAssetsRouter } from "@/features/assets/server/router";
import { brandAssetVersionsRouter } from "@/features/assets/server/versions-router";
import { auditRouter } from "@/features/audit/server/router";
import { usersRouter } from "@/features/auth/server/router";
import { brandsRouter } from "@/features/brand/server/router";
import { workspacesRouter } from "@/features/workspace/server/router";
import { osServer } from "@/orpc/server";

export const rootRouter = osServer.router({
  health: osServer.route({}).handler(() => ({ status: "ok" })),

  /** Public asset library at / (admin procedures gated per-procedure). */
  assets: osServer.router({
    ...libraryAssetsAdminRouter,
    ...publicLibraryRouter,
  }),

  /** Brand assets: ingestion, listing, versioning and rule enforcement. */
  brandAssets: osServer.router({
    ...brandAssetsRouter,
    ...brandAssetVersionsRouter,
  }),

  audit: auditRouter,
  brands: brandsRouter,
  users: usersRouter,
  workspaces: workspacesRouter,
});

export type RootRouter = typeof rootRouter;
