import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  BRANDING_DIR,
  displayName,
  fileAsUpload,
  guideForBrand,
  mimeFor,
} from "@/features/brand/server/seed-files";
import { db } from "@/shared/lib/db";

/** True when this brand already has an asset of `kind` (re-run guard). */
const hasAssetOfKind = async (
  brandId: string,
  kind: "logo_sheet" | "document",
): Promise<boolean> => {
  const found = await db.query.brandAssets.findFirst({
    where: (table, { and, eq: eqFn }) =>
      and(eqFn(table.brandId, brandId), eqFn(table.kind, kind)),
  });
  return Boolean(found);
};

/** Runs one brand's master sheet through segmentation + palette distillation. */
export const ingestSheet = async (
  brandId: string,
  entries: string[],
  slug: string,
  userId: string | null,
): Promise<void> => {
  const sheet = entries.find((entry) =>
    new RegExp(`^${slug}-logo-sheet\\.`, "i").test(entry),
  );
  if (!sheet) return;
  if (!userId) {
    console.log(`  No seed user; not ingesting ${sheet}.`);
    return;
  }
  if (await hasAssetOfKind(brandId, "logo_sheet")) return;

  try {
    const buffer = await readFile(join(BRANDING_DIR, sheet));
    const { ingestLogoSheet } = await import("@/features/assets/server/ingest");
    const summary = await ingestLogoSheet({
      brandId,
      file: fileAsUpload(buffer, sheet, mimeFor(sheet)),
      userId,
    });
    console.log(
      `  Ingested ${sheet}: ${summary.variantCount} variants, ${summary.colorsSaved} colors.`,
    );
  } catch (error) {
    console.error(`  Skipped ${sheet}:`, error);
  }
};

/** Stores a brand's guide PDF verbatim as a `document` asset. */
export const ingestGuide = async (
  brandId: string,
  entries: string[],
  slug: string,
  userId: string | null,
): Promise<void> => {
  const guide = guideForBrand(entries, slug);
  if (!guide) return;
  if (!userId) {
    console.log(`  No seed user; not ingesting ${guide}.`);
    return;
  }
  if (await hasAssetOfKind(brandId, "document")) return;

  try {
    const buffer = await readFile(join(BRANDING_DIR, guide));
    const { ingestBrandDocument } = await import(
      "@/features/assets/server/ingest-document"
    );
    const summary = await ingestBrandDocument({
      brandId,
      file: fileAsUpload(buffer, displayName(guide), mimeFor(guide)),
      userId,
    });
    console.log(`  Ingested ${guide} as "${summary.fileName}".`);
  } catch (error) {
    console.error(`  Skipped ${guide}:`, error);
  }
};
