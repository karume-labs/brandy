import sharp from "sharp";
import { saturation } from "@/shared/lib/color";

export interface PaletteColor {
  hex: string;
  count: number;
  saturation: number;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

/**
 * Dominant colors from an image: downscale, bucket to 16-level channels,
 * rank by frequency, then drop near-white/near-black and near-duplicates.
 * Returns most-saturated first - index 0 is the natural "primary".
 */
export const extractPalette = async (
  input: Buffer,
  maxColors = 8,
): Promise<PaletteColor[]> => {
  const { data, info } = await sharp(input)
    .resize(128, 128, { fit: "inside" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const total = width * height;
  const buckets = new Map<
    number,
    { count: number; r: number; g: number; b: number }
  >();

  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels] ?? 0;
    const g = data[i * channels + 1] ?? 0;
    const b = data[i * channels + 2] ?? 0;
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.count++;
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
    } else {
      buckets.set(key, { count: 1, r, g, b });
    }
  }

  const toHex = (r: number, g: number, b: number) =>
    `#${[r, g, b]
      .map((c) => clamp(Math.round(c), 0, 255).toString(16).padStart(2, "0"))
      .join("")}`;

  const toRgbArray = (hex: string): [number, number, number] => [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];

  const candidates = [...buckets.values()]
    .map((bucket) => {
      const r = bucket.r / bucket.count;
      const g = bucket.g / bucket.count;
      const b = bucket.b / bucket.count;
      const hex = toHex(r, g, b);
      return {
        hex,
        count: bucket.count,
        share: bucket.count / total,
        saturation: saturation(hex),
      };
    })
    .filter((candidate) => candidate.share > 0.002)
    // Sort: frequently-used colors first.
    .sort((a, b) => b.count - a.count);

  const picked: typeof candidates = [];
  for (const candidate of candidates) {
    const rgb = toRgbArray(candidate.hex);
    const isExtreme = Math.max(...rgb) > 246 || Math.max(...rgb) < 14;

    // Keep at most one washed-out neutral.
    if (isExtreme && picked.some((p) => p.saturation < 0.12)) continue;

    const duplicate = picked.some((p) => {
      const pr = toRgbArray(p.hex);
      return Math.max(...rgb.map((c, i) => Math.abs(c - (pr[i] ?? 0)))) < 36;
    });
    if (duplicate) continue;

    picked.push(candidate);
    if (picked.length >= maxColors) break;
  }

  // Primary-worthy colors first: saturation weighted over frequency.
  return picked
    .map(({ hex, count, saturation: sat }) => ({
      hex,
      count,
      saturation: sat,
    }))
    .sort(
      (a, b) =>
        b.saturation * 0.7 +
        (b.count / total) * 0.3 -
        (a.saturation * 0.7 + (a.count / total) * 0.3),
    );
};
