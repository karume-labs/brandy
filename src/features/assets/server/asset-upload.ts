import { eq } from "drizzle-orm";
import {
  assetVersions,
  brandAssets,
  DEFAULT_VARIANT_RULES,
  type VariantRules,
} from "@/features/assets/brand-schema";
import { imageInfo } from "@/features/assets/server/images";
import { db } from "@/shared/lib/db";
import { safeKey, storage } from "@/shared/lib/storage";

/** Upload guard: 25MB per file, images only. */
export const MAX_ASSET_BYTES = 25 * 1024 * 1024;
const IMAGE_MIME = /^(image\/(png|jpeg|webp|svg\+xml|gif|tiff))$/;

export interface UploadedFile {
  name: string;
  type: string;
  size: number;
  arrayBuffer(): Promise<ArrayBuffer>;
}

export const assertImage = (file: UploadedFile): void => {
  if (!IMAGE_MIME.test(file.type)) {
    throw new Error(`Unsupported file type: ${file.type || "unknown"}`);
  }
  if (file.size > MAX_ASSET_BYTES) {
    throw new Error(
      `File exceeds the ${MAX_ASSET_BYTES / 1024 / 1024}MB upload limit`,
    );
  }
};

export const toBuffer = async (file: UploadedFile): Promise<Buffer> =>
  Buffer.from(await file.arrayBuffer());

export const orientationFor = (
  width: number,
  height: number,
): VariantRules["orientation"] => {
  const ratio = width / height;
  if (ratio > 1.15) return "landscape";
  if (ratio < 0.87) return "portrait";
  return "square";
};

/** Persists a buffer as the next immutable version of an asset. */
export const insertVersion = async (
  assetId: string,
  version: number,
  params: {
    buffer: Buffer;
    fileName: string;
    mimeType: string;
    rules: VariantRules;
    notes?: string | null;
    userId?: string | null;
  },
) => {
  const key = safeKey("brand-assets", assetId, `v${version}-${Date.now()}.png`);
  const stored = await storage.put(key, params.buffer, params.mimeType);
  const info = await imageInfo(params.buffer);

  const [row] = await db
    .insert(assetVersions)
    .values({
      assetId,
      version,
      filePath: stored.key,
      fileName: params.fileName,
      mimeType: params.mimeType,
      fileSize: stored.size,
      width: info.width,
      height: info.height,
      isTransparent: info.hasAlpha,
      rules: params.rules,
      notes: params.notes ?? null,
      createdBy: params.userId ?? null,
    })
    .returning();
  if (!row) throw new Error("Could not persist asset version");
  return row;
};

/** Persists a non-image file (brand guide, PDF) as an immutable version. */
export const insertDocumentVersion = async (
  assetId: string,
  version: number,
  params: {
    buffer: Buffer;
    fileName: string;
    mimeType: string;
    extension: string;
    notes?: string | null;
    userId?: string | null;
  },
) => {
  const key = safeKey(
    "brand-assets",
    assetId,
    `v${version}-${Date.now()}${params.extension}`,
  );
  const stored = await storage.put(key, params.buffer, params.mimeType);

  const [row] = await db
    .insert(assetVersions)
    .values({
      assetId,
      version,
      filePath: stored.key,
      fileName: params.fileName,
      mimeType: params.mimeType,
      fileSize: stored.size,
      width: null,
      height: null,
      isTransparent: false,
      rules: DEFAULT_VARIANT_RULES,
      notes: params.notes ?? null,
      createdBy: params.userId ?? null,
    })
    .returning();
  if (!row) throw new Error("Could not persist document version");
  return row;
};

/** Points the master record's active-version pointer at a version row. */
export const setActiveSheetVersion = async (
  assetId: string,
  versionId: string,
): Promise<void> => {
  await db
    .update(brandAssets)
    .set({ currentVersionId: versionId })
    .where(eq(brandAssets.id, assetId));
};
