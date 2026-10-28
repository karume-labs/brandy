import { desc, eq } from "drizzle-orm";
import {
  assetVersions,
  brandAssets,
  DEFAULT_VARIANT_RULES,
  type VariantRules,
} from "@/features/assets/brand-schema";
import type { UploadedFile } from "@/features/assets/server/asset-upload";
import {
  assertImage,
  insertVersion,
  toBuffer,
} from "@/features/assets/server/asset-upload";
import { db } from "@/shared/lib/db";

/** Brand assets with their full version list, active version resolved. */
export const listBrandAssets = async (brandId: string) => {
  const rows = await db.query.brandAssets.findMany({
    where: eq(brandAssets.brandId, brandId),
    with: {
      versions: { orderBy: [desc(assetVersions.version)] },
    },
    orderBy: [desc(brandAssets.createdAt)],
  });

  return rows.map((row) => ({
    ...row,
    currentVersion:
      row.versions.find((v) => v.id === row.currentVersionId) ?? null,
    versions: row.versions,
  }));
};

/** Adds a new immutable version and flips the master pointer to it. */
export const uploadAssetVersion = async (params: {
  assetId: string;
  file: UploadedFile;
  notes?: string | null;
  userId: string;
}) => {
  const { assetId, file, notes, userId } = params;
  assertImage(file);
  const buffer = await toBuffer(file);

  const asset = await db.query.brandAssets.findFirst({
    where: eq(brandAssets.id, assetId),
  });
  if (!asset) throw new Error("Asset not found");

  const existing = await db.query.assetVersions.findMany({
    where: eq(assetVersions.assetId, assetId),
  });
  const nextVersion = Math.max(0, ...existing.map((v) => v.version)) + 1;
  const previousRules =
    existing.find((v) => v.id === asset.currentVersionId)?.rules ??
    DEFAULT_VARIANT_RULES;

  const version = await insertVersion(assetId, nextVersion, {
    buffer,
    fileName: file.name || `v${nextVersion}`,
    mimeType: file.type,
    rules: previousRules,
    notes: notes ?? null,
    userId,
  });

  await db
    .update(brandAssets)
    .set({ currentVersionId: version.id })
    .where(eq(brandAssets.id, assetId));

  return version;
};

/** Points the master record back at an older version (history intact). */
export const rollbackAssetVersion = async (params: {
  assetId: string;
  versionId: string;
}) => {
  const version = await db.query.assetVersions.findFirst({
    where: eq(assetVersions.id, params.versionId),
  });
  if (!version || version.assetId !== params.assetId) {
    throw new Error("Version does not belong to this asset");
  }
  await db
    .update(brandAssets)
    .set({ currentVersionId: version.id })
    .where(eq(brandAssets.id, params.assetId));
  return version;
};

/** Updates rule enforcement metadata on the active version. */
export const updateAssetRules = async (params: {
  assetId: string;
  rules: Partial<VariantRules>;
}) => {
  const asset = await db.query.brandAssets.findFirst({
    where: eq(brandAssets.id, params.assetId),
  });
  if (!asset?.currentVersionId) throw new Error("Asset has no active version");

  const current = await db.query.assetVersions.findFirst({
    where: eq(assetVersions.id, asset.currentVersionId),
  });
  if (!current) throw new Error("Active version not found");

  const rules: VariantRules = {
    ...DEFAULT_VARIANT_RULES,
    ...current.rules,
    ...params.rules,
  };

  const [updated] = await db
    .update(assetVersions)
    .set({ rules })
    .where(eq(assetVersions.id, current.id))
    .returning();
  return updated;
};
