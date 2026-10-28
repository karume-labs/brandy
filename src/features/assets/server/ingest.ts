import { eq } from "drizzle-orm";
import sharp from "sharp";
import {
  brandAssets,
  DEFAULT_VARIANT_RULES,
} from "@/features/assets/brand-schema";
import {
  assertImage,
  insertVersion,
  toBuffer,
  type UploadedFile,
} from "@/features/assets/server/asset-upload";
import { removeSolidBackground } from "@/features/assets/server/images";
import {
  type CreatedVariant,
  createVariantAsset,
} from "@/features/assets/server/ingest-variant";
import { savePaletteTokens } from "@/features/assets/server/palette-tokens";
import { segmentLogoSheet } from "@/features/assets/server/segment";
import { db } from "@/shared/lib/db";

export interface SheetIngestSummary {
  sheetAssetId: string;
  sheetVersionId: string;
  variantCount: number;
  colorsSaved: number;
  variants: CreatedVariant[];
}

interface CellRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Crops one cell from the sheet and turns it into a transparent PNG. */
const processCell = async (sheet: Buffer, cell: CellRect) => {
  const crop = await sharp(sheet)
    .extract({
      left: Math.max(0, cell.x),
      top: Math.max(0, cell.y),
      width: Math.min(cell.width, 4000),
      height: Math.min(cell.height, 4000),
    })
    .png()
    .toBuffer();
  return { crop, transparent: await removeSolidBackground(crop) };
};

/**
 * Full logo-sheet ingestion: store the master sheet, segment it into the 5
 * standard cells (background stripped to transparent PNG), create one
 * versioned asset per cell, and distill the brand palette from the
 * full-color variants.
 */
export const ingestLogoSheet = async (params: {
  brandId: string;
  file: UploadedFile;
  userId: string;
}): Promise<SheetIngestSummary> => {
  const { brandId, file, userId } = params;
  assertImage(file);
  const sheetBuffer = await toBuffer(file);

  // 1. Master sheet record (kept for history/re-segmentation).
  const [sheetAsset] = await db
    .insert(brandAssets)
    .values({ brandId, kind: "logo_sheet", name: file.name || "Logo sheet" })
    .returning();
  if (!sheetAsset) throw new Error("Could not create sheet asset");

  const sheetVersion = await insertVersion(sheetAsset.id, 1, {
    buffer: sheetBuffer,
    fileName: file.name || "logo-sheet",
    mimeType: file.type,
    rules: { ...DEFAULT_VARIANT_RULES, clearSpace: "none" },
    notes: "Master upload",
    userId,
  });
  await db
    .update(brandAssets)
    .set({ currentVersionId: sheetVersion.id })
    .where(eq(brandAssets.id, sheetAsset.id));

  // 2. Segment into cells.
  const { cells } = await segmentLogoSheet(sheetBuffer);
  if (cells.length === 0) {
    throw new Error(
      "Could not detect any cells in this sheet - divider lines were not found",
    );
  }

  // 3. One versioned asset per cell.
  const variants: CreatedVariant[] = [];
  const fullColorCrops: Buffer[] = [];
  const colorSourceBuffers: Buffer[] = [];

  for (const [index, cell] of cells.entries()) {
    const { crop, transparent } = await processCell(sheetBuffer, cell);
    variants.push(
      await createVariantAsset({
        brandId,
        index,
        variantType: cell.variantType,
        crop,
        transparent,
        userId,
      }),
    );

    fullColorCrops.push(crop);
    // Full-color cells feed the palette (mono/circular stay out).
    if (cell.variantType === "stacked" || cell.variantType === "horizontal") {
      colorSourceBuffers.push(crop);
    }
  }

  // 4. Distill the palette. Sheets whose layout we can't classify still get
  // tokens from every cell rather than none at all.
  const colorsSaved = await savePaletteTokens(
    brandId,
    colorSourceBuffers.length > 0 ? colorSourceBuffers : fullColorCrops,
  );

  return {
    sheetAssetId: sheetAsset.id,
    sheetVersionId: sheetVersion.id,
    variantCount: variants.length,
    colorsSaved,
    variants,
  };
};
