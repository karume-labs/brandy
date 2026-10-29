import { extname } from "node:path";
import { eq } from "drizzle-orm";
import { brandAssets } from "@/features/assets/brand-schema";
import {
  insertDocumentVersion,
  MAX_ASSET_BYTES,
  toBuffer,
  type UploadedFile,
} from "@/features/assets/server/asset-upload";
import { db } from "@/shared/lib/db";

/** Documents the ingestion pipeline accepts (brand guides today). */
const DOCUMENT_MIME = /^application\/pdf$/;

export interface DocumentIngestSummary {
  assetId: string;
  versionId: string;
  fileName: string;
}

const assertDocument = (file: UploadedFile): void => {
  if (!DOCUMENT_MIME.test(file.type)) {
    throw new Error(`Unsupported document type: ${file.type || "unknown"}`);
  }
  if (file.size > MAX_ASSET_BYTES) {
    throw new Error(
      `File exceeds the ${MAX_ASSET_BYTES / 1024 / 1024}MB upload limit`,
    );
  }
};

/**
 * Stores a brand guide (PDF) as a `document` asset with a single immutable
 * version. Unlike logo sheets there is no segmentation - the file is kept
 * verbatim for download/preview through the guarded file route.
 */
export const ingestBrandDocument = async (params: {
  brandId: string;
  file: UploadedFile;
  userId: string;
}): Promise<DocumentIngestSummary> => {
  const { brandId, file, userId } = params;
  assertDocument(file);
  const buffer = await toBuffer(file);
  const fileName = file.name || "Brand guide";
  const extension = extname(fileName).toLowerCase() || ".pdf";

  const [asset] = await db
    .insert(brandAssets)
    .values({ brandId, kind: "document", category: "document", name: fileName })
    .returning();
  if (!asset) throw new Error("Could not create document asset");

  const version = await insertDocumentVersion(asset.id, 1, {
    buffer,
    fileName,
    mimeType: file.type,
    extension,
    notes: "Master upload",
    userId,
  });
  await db
    .update(brandAssets)
    .set({ currentVersionId: version.id })
    .where(eq(brandAssets.id, asset.id));

  return { assetId: asset.id, versionId: version.id, fileName };
};
