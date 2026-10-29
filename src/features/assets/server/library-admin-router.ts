import { ORPCError } from "@orpc/server";
import { and, desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/features/admin/server/require-admin";
import { assetVersions, brandAssets } from "@/features/assets/brand-schema";
import { assets } from "@/features/assets/schema";
import {
  assetLabel,
  deleteAssetSchema,
  libraryCount,
  libraryRows,
  listAssetsSchema,
  searchFilter,
  setVisibilitySchema,
} from "@/features/assets/server/library-common";
import { deleteAssetFile } from "@/features/assets/server/storage";
import { recordAudit } from "@/features/audit/server/record";
import { osServer } from "@/orpc/server";
import { db } from "@/shared/lib/db";
import { offsetForPage } from "@/shared/validators";

export const libraryAssetsAdminRouter = osServer.router({
  /** Admin list: every brand asset with its active version, newest first. */
  list: osServer
    .route({})
    .input(listAssetsSchema)
    .handler(async ({ input, context }) => {
      await requireAdmin(context.headers);

      const where = and(
        searchFilter(input.q),
        input.category ? eq(brandAssets.category, input.category) : undefined,
      );
      const offset = offsetForPage(input.page, input.pageSize);

      const [items, totalRows] = await Promise.all([
        libraryRows()
          .where(where)
          .orderBy(desc(brandAssets.createdAt))
          .limit(input.pageSize)
          .offset(offset),
        libraryCount(where),
      ]);

      return {
        items: items.map(({ brandName, name, ...rest }) => ({
          ...rest,
          description: null,
          name: assetLabel(brandName, name),
        })),
        total: totalRows[0]?.total ?? 0,
      };
    }),

  /** Flip a brand asset's active version between public and private. */
  setVisibility: osServer
    .route({})
    .input(setVisibilitySchema)
    .handler(async ({ input, context }) => {
      const sessionUser = await requireAdmin(context.headers);

      const asset = await db.query.brandAssets.findFirst({
        where: eq(brandAssets.id, input.id),
      });
      if (!asset?.currentVersionId) {
        throw new ORPCError("NOT_FOUND", { message: "Asset not found" });
      }

      const [updated] = await db
        .update(assetVersions)
        .set({ isPublic: input.isPublic ?? false })
        .where(eq(assetVersions.id, asset.currentVersionId))
        .returning();
      if (!updated) {
        throw new ORPCError("NOT_FOUND", {
          message: "Asset version not found",
        });
      }

      await recordAudit(
        {
          action: "update",
          entityType: "asset",
          entityId: asset.id,
          entityLabel: asset.name,
          summary: `Made “${asset.name}” ${input.isPublic ? "public" : "private"}`,
        },
        sessionUser,
      );

      return { id: asset.id, name: asset.name, isPublic: updated.isPublic };
    }),

  /** Deletes the DB row and the file on disk (row first, then storage). */
  delete: osServer
    .route({})
    .input(deleteAssetSchema)
    .handler(async ({ input, context }) => {
      const sessionUser = await requireAdmin(context.headers);

      const [deleted] = await db
        .delete(assets)
        .where(eq(assets.id, input.id))
        .returning();

      if (!deleted) {
        throw new ORPCError("NOT_FOUND", { message: "Asset not found" });
      }

      try {
        await deleteAssetFile(deleted.filePath);
      } catch (error) {
        // The row is the source of truth - log and continue.
        console.error(
          `[assets] Failed to delete file ${deleted.filePath}:`,
          error,
        );
      }

      await recordAudit(
        {
          action: "delete",
          entityType: "asset",
          entityId: deleted.id,
          entityLabel: deleted.name,
          summary: `Deleted asset ${deleted.name}`,
        },
        sessionUser,
      );

      return deleted;
    }),
});
