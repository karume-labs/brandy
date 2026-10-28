import { BG_DIFF, type Region } from "@/features/assets/server/segment-grid";

const isBackground = (
  r: number,
  g: number,
  b: number,
  bg: readonly number[],
): boolean =>
  Math.abs(r - (bg[0] ?? 0)) <= BG_DIFF &&
  Math.abs(g - (bg[1] ?? 0)) <= BG_DIFF &&
  Math.abs(b - (bg[2] ?? 0)) <= BG_DIFF;

/**
 * Content bbox inside a region: pixels differing from the region's corner
 * color, with the caption band ("Variant N / ...") dropped so only the
 * artwork is cropped.
 */
export const contentBBox = (
  data: Buffer,
  width: number,
  region: Region,
): Region => {
  const sample = (px: number, py: number): [number, number, number] => {
    const idx = (py * width + px) * 3;
    return [data[idx] ?? 0, data[idx + 1] ?? 0, data[idx + 2] ?? 0];
  };

  const corners = [
    sample(region.x + 2, region.y + 2),
    sample(region.x + region.width - 3, region.y + 2),
    sample(region.x + 2, region.y + region.height - 3),
    sample(region.x + region.width - 3, region.y + region.height - 3),
  ];
  // The canvas is light; the lightest corner is the safest background pick
  // (a corner can clip a dark divider line).
  const bg = corners.reduce((best, p) => {
    const sum = (a: number[]) => (a[0] ?? 0) + (a[1] ?? 0) + (a[2] ?? 0);
    return sum(p) > sum(best) ? p : best;
  }, corners[0] ?? [255, 255, 255]);

  let minX = region.x + region.width;
  let minY = region.y + region.height;
  let maxX = region.x;
  let maxY = region.y;

  for (let y = region.y; y < region.y + region.height; y++) {
    for (let x = region.x; x < region.x + region.width; x++) {
      const [r, g, b] = sample(x, y);
      if (!isBackground(r, g, b, bg)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX <= minX || maxY <= minY) {
    return region; // Empty region - fall back to the full cell.
  }

  const contentTop = dropCaptionBand(data, width, region, {
    minX,
    minY,
    maxX,
    maxY,
  });

  // Inset by 2px so divider edges never bleed into the crop.
  const inset = 2;
  return {
    x: Math.max(region.x, minX + inset),
    y: Math.max(region.y, contentTop + inset),
    width: Math.max(1, maxX - minX - inset * 2),
    height: Math.max(1, maxY - Math.max(contentTop, minY) - inset * 2),
  };
};

/** Returns the y where real artwork starts, past the caption + gap. */
const dropCaptionBand = (
  data: Buffer,
  width: number,
  region: Region,
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
): number => {
  const { minX, minY, maxX, maxY } = bounds;
  const sample = (px: number, py: number): [number, number, number] => {
    const idx = (py * width + px) * 3;
    return [data[idx] ?? 0, data[idx + 1] ?? 0, data[idx + 2] ?? 0];
  };

  const rowHasContent = new Array<boolean>(region.height).fill(false);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const [r, g, b] = sample(x, y);
      if (!isBackground(r, g, b, [255, 255, 255])) {
        rowHasContent[y - region.y] = true;
        break;
      }
    }
  }

  const bandHeight = maxY - minY;
  if (bandHeight <= 60) return minY;

  let runStart = -1;
  for (let i = 0; i < rowHasContent.length; i++) {
    if (rowHasContent[i]) {
      if (runStart === -1) runStart = i;
    } else if (runStart !== -1) {
      const runHeight = i - runStart;
      const runTop = runStart + region.y;
      // Caption = a short content run near the top followed by a gap.
      if (runTop < minY + bandHeight * 0.4 && runHeight < bandHeight * 0.2) {
        return i + region.y + 2;
      }
      runStart = -1;
    }
  }
  return minY;
};
