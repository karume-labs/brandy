import { and, desc, eq, type SQL } from "drizzle-orm";
import { assetVersions, brandAssets } from "@/features/assets/brand-schema";
import {
  assetLabel,
  libraryCount,
  libraryRows,
  publicListAssetsSchema,
  searchFilter,
} from "@/features/assets/server/library-common";
import { osServer } from "@/orpc/server";
import { offsetForPage } from "@/shared/validators";

const publicWhere = (q?: string): SQL<unknown> | undefined =>
  and(eq(assetVersions.isPublic, true), searchFilter(q));

export const publicLibraryRouter = osServer.router({
  /**
   * PUBLIC procedure - no session required. Sources the unauthenticated
   * library at /: brand assets whose ACTIVE version is flagged `isPublic`,
   * so anyone can browse and download without an account.
   */
  publicList: osServer
    .route({})
    .input(publicListAssetsSchema)
    .handler(async ({ input }) => {
      const where = publicWhere(input.q);
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
        items: items.map((row) => ({
          id: row.id,
          name: assetLabel(row.brandName, row.name),
          category: row.category,
          fileName: row.fileName,
          mimeType: row.mimeType,
          fileSize: row.fileSize,
          createdAt: row.createdAt,
        })),
        total: totalRows[0]?.total ?? 0,
      };
    }),
});
