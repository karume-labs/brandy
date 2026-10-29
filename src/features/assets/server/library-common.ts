import { count, eq, or, type SQL, sql } from "drizzle-orm";
import { z } from "zod";
import {
  ASSET_CATEGORIES,
  assetVersions,
  brandAssets,
} from "@/features/assets/brand-schema";
import { brands } from "@/features/brand/schema";
import { db } from "@/shared/lib/db";
import { paginationSchema } from "@/shared/validators";

const listFilters = {
  /** Free-text search across asset and brand names. */
  q: z.string().trim().max(200).optional(),
  /** Matches the brand_assets.category union (unknown values yield no rows). */
  category: z.enum(ASSET_CATEGORIES).optional(),
};

export const listAssetsSchema = paginationSchema.extend(listFilters);

export const publicListAssetsSchema = paginationSchema.extend({
  q: listFilters.q,
});

export const setVisibilitySchema = z.object({
  id: z.string().min(1),
  isPublic: z.boolean().optional(),
});

export const deleteAssetSchema = z.object({ id: z.string().min(1) });

/**
 * Fresh select over every brand asset with its active version and brand
 * joined. Both library routers read from here: the `assets` legacy table has
 * no writer - the real store is `brand_assets` / `asset_versions`.
 */
export const libraryRows = () =>
  db
    .select({
      id: brandAssets.id,
      name: brandAssets.name,
      category: brandAssets.category,
      isPublic: assetVersions.isPublic,
      fileName: assetVersions.fileName,
      mimeType: assetVersions.mimeType,
      fileSize: assetVersions.fileSize,
      createdAt: brandAssets.createdAt,
      brandName: brands.name,
    })
    .from(brandAssets)
    .innerJoin(
      assetVersions,
      eq(assetVersions.id, brandAssets.currentVersionId),
    )
    .innerJoin(brands, eq(brands.id, brandAssets.brandId));

/** Row count over the same join (search filters may reference both tables). */
export const libraryCount = (where: SQL<unknown> | undefined) =>
  db
    .select({ total: count() })
    .from(brandAssets)
    .innerJoin(
      assetVersions,
      eq(assetVersions.id, brandAssets.currentVersionId),
    )
    .innerJoin(brands, eq(brands.id, brandAssets.brandId))
    .where(where);

/**
 * Free-text search across the asset name and its brand name. Library queries
 * always join `brands`, so searching a brand finds everything it owns.
 */
export const searchFilter = (q?: string) => {
  if (!q) return undefined;
  const pattern = `%${q}%`;
  return or(
    sql`${brandAssets.name} ILIKE ${pattern}`,
    sql`${brands.name} ILIKE ${pattern}`,
  );
};

/**
 * Display label: brand context unless the asset name already carries it.
 * Bare variant labels ("Stacked", "Icon Only") would otherwise repeat once
 * per brand in the grid with no way to tell them apart.
 */
export const assetLabel = (brandName: string, assetName: string): string =>
  assetName.toLowerCase().includes(brandName.toLowerCase())
    ? assetName
    : `${brandName} · ${assetName}`;
