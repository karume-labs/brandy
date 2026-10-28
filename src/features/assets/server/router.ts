import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { assetVersions, brandAssets } from "@/features/assets/brand-schema";
import {
  requireBrandAdmin,
  uploadedFileSchema,
} from "@/features/assets/server/brand-asset-guards";
import { ingestLogoSheet } from "@/features/assets/server/ingest";
import { listBrandAssets } from "@/features/assets/server/versions";
import { brands } from "@/features/brand/schema";
import { requireWorkspaceRole } from "@/features/workspace/server/gate";
import { osServer } from "@/orpc/server";
import { db } from "@/shared/lib/db";

export const brandAssetsRouter = osServer.router({
  /** All assets (sheet + variants) for a brand, active version included. */
  listByBrand: osServer
    .route({})
    .input(z.object({ brandId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const brand = await db.query.brands.findFirst({
        where: eq(brands.id, input.brandId),
      });
      if (!brand) {
        throw new ORPCError("NOT_FOUND", { message: "Brand not found" });
      }
      await requireWorkspaceRole(context.headers, brand.workspaceId);
      return await listBrandAssets(input.brandId);
    }),

  /**
   * Active version metadata (rules, size, transparency). The bytes are
   * served by /api/brand-assets/[id]/file, which enforces visibility.
   */
  getActiveVersion: osServer
    .route({})
    .input(z.object({ assetId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const asset = await db.query.brandAssets.findFirst({
        where: eq(brandAssets.id, input.assetId),
      });
      if (!asset) {
        throw new ORPCError("NOT_FOUND", { message: "Asset not found" });
      }
      const brand = await db.query.brands.findFirst({
        where: eq(brands.id, asset.brandId),
      });
      if (!brand) {
        throw new ORPCError("NOT_FOUND", { message: "Brand not found" });
      }
      await requireWorkspaceRole(context.headers, brand.workspaceId);

      if (!asset.currentVersionId) return null;
      return await db.query.assetVersions.findFirst({
        where: eq(assetVersions.id, asset.currentVersionId),
      });
    }),

  /** Drop a master sheet -> segmented, background-stripped variant set. */
  ingestSheet: osServer
    .route({})
    .input(z.object({ brandId: z.string().uuid(), file: uploadedFileSchema }))
    .handler(async ({ input, context }) => {
      const brand = await requireBrandAdmin(context.headers, input.brandId);
      const sessionUser = await requireWorkspaceRole(
        context.headers,
        brand.workspaceId,
        "admin",
      );

      try {
        return await ingestLogoSheet({
          brandId: brand.id,
          file: input.file,
          userId: sessionUser.id,
        });
      } catch (error) {
        throw new ORPCError("BAD_REQUEST", {
          message: error instanceof Error ? error.message : "Ingestion failed",
        });
      }
    }),
});
