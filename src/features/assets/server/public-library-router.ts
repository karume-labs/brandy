import { and, count, desc, eq } from "drizzle-orm";
import { assets } from "@/features/assets/schema";
import {
  publicListAssetsSchema,
  searchFilter,
} from "@/features/assets/server/library-common";
import { osServer } from "@/orpc/server";
import { db } from "@/shared/lib/db";
import { offsetForPage } from "@/shared/validators";

export const publicLibraryRouter = osServer.router({
  /**
   * PUBLIC procedure - no session required. Only assets flagged `isPublic`
   * are returned; this powers the unauthenticated asset library at /.
   */
  publicList: osServer
    .route({})
    .input(publicListAssetsSchema)
    .handler(async ({ input }) => {
      const where = and(eq(assets.isPublic, true), searchFilter(input.q));
      const offset = offsetForPage(input.page, input.pageSize);

      const [items, totalRows] = await Promise.all([
        db
          .select({
            id: assets.id,
            name: assets.name,
            description: assets.description,
            category: assets.category,
            fileName: assets.fileName,
            mimeType: assets.mimeType,
            fileSize: assets.fileSize,
            createdAt: assets.createdAt,
          })
          .from(assets)
          .where(where)
          .orderBy(desc(assets.createdAt))
          .limit(input.pageSize)
          .offset(offset),
        db.select({ total: count() }).from(assets).where(where),
      ]);

      return { items, total: totalRows[0]?.total ?? 0 };
    }),
});
