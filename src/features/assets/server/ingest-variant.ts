import { eq } from "drizzle-orm";
import {
  brandAssets,
  DEFAULT_VARIANT_RULES,
  VARIANT_LABELS,
  type VariantType,
} from "@/features/assets/brand-schema";
import {
  insertVersion,
  orientationFor,
} from "@/features/assets/server/asset-upload";
import { imageInfo } from "@/features/assets/server/images";
import { db } from "@/shared/lib/db";

export interface CreatedVariant {
  id: string;
  variantType: VariantType | null;
  name: string;
  width: number;
  height: number;
}

/**
 * Creates the master record + first version for one segmented cell and
 * points the master at it.
 */
export const createVariantAsset = async (params: {
  brandId: string;
  index: number;
  variantType: VariantType | null;
  crop: Buffer;
  transparent: Buffer;
  userId: string;
}): Promise<CreatedVariant> => {
  const { brandId, index, variantType, crop, transparent, userId } = params;
  const name = variantType
    ? VARIANT_LABELS[variantType]
    : `Variant ${index + 1}`;

  const [asset] = await db
    .insert(brandAssets)
    .values({ brandId, kind: "logo_variant", variantType, name })
    .returning();
  if (!asset) throw new Error("Could not create variant asset");

  const cropInfo = await imageInfo(crop);
  const version = await insertVersion(asset.id, 1, {
    buffer: transparent,
    fileName: `${(variantType ?? `variant-${index + 1}`).toLowerCase()}.png`,
    mimeType: "image/png",
    rules: {
      ...DEFAULT_VARIANT_RULES,
      orientation: orientationFor(cropInfo.width, cropInfo.height),
    },
    notes: `Auto-segmented from sheet (cell ${index + 1})`,
    userId,
  });

  await db
    .update(brandAssets)
    .set({ currentVersionId: version.id })
    .where(eq(brandAssets.id, asset.id));

  return {
    id: asset.id,
    variantType,
    name,
    width: cropInfo.width,
    height: cropInfo.height,
  };
};
