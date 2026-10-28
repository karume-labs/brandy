import { extractPalette } from "@/features/assets/server/palette";
import { brandColors } from "@/features/brand/schema";
import { db } from "@/shared/lib/db";

/** Picks the token role for a ranked palette entry. */
const roleFor = (
  index: number,
): "primary" | "secondary" | "accent" | "neutral" =>
  index === 0
    ? "primary"
    : index === 1
      ? "secondary"
      : index === 2
        ? "accent"
        : "neutral";

/**
 * Distills one or more full-color crops into brand color tokens, upserting
 * by (brand, name) so re-ingesting a sheet refreshes the palette instead of
 * duplicating it. Returns the number of tokens saved.
 */
export const savePaletteTokens = async (
  brandId: string,
  buffers: Buffer[],
): Promise<number> => {
  if (buffers.length === 0) return 0;

  const merged = new Map<string, { count: number; saturation: number }>();
  for (const buffer of buffers) {
    for (const color of await extractPalette(buffer, 8)) {
      const existing = merged.get(color.hex);
      merged.set(color.hex, {
        count: (existing?.count ?? 0) + color.count,
        saturation: color.saturation,
      });
    }
  }

  const ranked = [...merged.entries()]
    .map(([hex, v]) => ({ hex, ...v }))
    .sort(
      (a, b) =>
        b.saturation * 0.7 +
        b.count / 100000 -
        (a.saturation * 0.7 + a.count / 100000),
    )
    .slice(0, 8);

  for (const [index, color] of ranked.entries()) {
    const role = roleFor(index);
    const name = index < 3 ? role : `neutral-${index - 2}`;
    await db
      .insert(brandColors)
      .values({
        brandId,
        name,
        hex: color.hex,
        role,
        source: "extracted",
        position: index,
      })
      .onConflictDoUpdate({
        target: [brandColors.brandId, brandColors.name],
        set: { hex: color.hex, role, source: "extracted", position: index },
      });
  }
  return ranked.length;
};
