import { ORPCError } from "@orpc/server";
import { and, count, desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/features/admin/server/require-admin";
import { assets } from "@/features/assets/schema";
import {
  deleteAssetSchema,
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
  /** Admin list: every asset, newest first, paginated. */
  list: osServer
    .route({})
    .input(listAssetsSchema)
    .handler(async ({ input, context }) => {
      await requireAdmin(context.headers);

      const where = and(
        searchFilter(input.q),
        input.category ? eq(assets.category, input.category) : undefined,
      );
      const offset = offsetForPage(input.page, input.pageSize);

      const [items, totalRows] = await Promise.all([
        db
          .select()
          .from(assets)
          .where(where)
          .orderBy(desc(assets.createdAt))
          .limit(input.pageSize)
          .offset(offset),
        db.select({ total: count() }).from(assets).where(where),
      ]);

      return { items, total: totalRows[0]?.total ?? 0 };
    }),

  /** Flip an asset between public and private. */
  setVisibility: osServer
    .route({})
    .input(setVisibilitySchema)
    .handler(async ({ input, context }) => {
      const sessionUser = await requireAdmin(context.headers);

      const [before] = await db
        .select()
        .from(assets)
        .where(eq(assets.id, input.id));
      if (!before) {
        throw new ORPCError("NOT_FOUND", { message: "Asset not found" });
      }

      const [updated] = await db
        .update(assets)
        .set({ isPublic: input.isPublic ?? false })
        .where(eq(assets.id, input.id))
        .returning();

      await recordAudit(
        {
          action: "update",
          entityType: "asset",
          entityId: before.id,
          entityLabel: before.name,
          summary: `Made “${before.name}” ${input.isPublic ? "public" : "private"}`,
        },
        sessionUser,
      );

      return updated;
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
