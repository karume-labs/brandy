import sharp from "sharp";

/**
 * Image post-processing for brand assets. Disk-agnostic: takes/returns
 * buffers so it works under the storage interface unchanged. Palette
 * extraction lives in ./palette.ts.
 */

export interface ImageInfo {
  width: number;
  height: number;
  format: string | null;
  hasAlpha: boolean;
}

export const imageInfo = async (input: Buffer): Promise<ImageInfo> => {
  const meta = await sharp(input).metadata();
  return {
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    format: meta.format ?? null,
    hasAlpha: meta.hasAlpha ?? false,
  };
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

/**
 * Strips a solid background (sampled from the four corners) and returns a
 * transparent PNG. Two-threshold alpha ramp keeps antialiased edges soft.
 * Complex/photo backgrounds are out of scope for this build.
 */
export const removeSolidBackground = async (
  input: Buffer,
  tolerance = 32,
): Promise<Buffer> => {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const px = (x: number, y: number): [number, number, number] => {
    const i = (y * width + x) * channels;
    return [data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0];
  };

  const corners = [
    px(1, 1),
    px(width - 2, 1),
    px(1, height - 2),
    px(width - 2, height - 2),
  ];
  const bg = [0, 1, 2].map((c) =>
    Math.round(corners.reduce((sum, p) => sum + (p[c] ?? 0), 0) / 4),
  );

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;
      const distance = Math.max(
        Math.abs(r - (bg[0] ?? 0)),
        Math.abs(g - (bg[1] ?? 0)),
        Math.abs(b - (bg[2] ?? 0)),
      );

      if (distance <= tolerance) {
        data[i + 3] = 0;
      } else if (distance < tolerance * 2) {
        const alpha = clamp(
          Math.round(((distance - tolerance) / tolerance) * 255),
          0,
          255,
        );
        data[i + 3] = Math.min(data[i + 3] ?? 255, alpha);
      }
    }
  }

  return sharp(data, { raw: { width, height, channels } })
    .png({ compressionLevel: 9 })
    .toBuffer();
};
