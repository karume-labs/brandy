import sharp from "sharp";
import type { VariantType } from "@/features/assets/brand-schema";
import { contentBBox } from "@/features/assets/server/content-crop";
import {
  assignVariantTypes,
  DARK_THRESHOLD,
  findLines,
  type Region,
} from "@/features/assets/server/segment-grid";

/**
 * Auto-segmentation of the standard logo-sheet template: a light canvas
 * split into labeled cells by thin dark divider lines (verified against the
 * NerveTech Systems and Go Play sheets). We detect long dark runs per
 * column/row, rebuild the cell grid, then trim each cell to its content.
 */

export interface SheetCell {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Positional guess for the standard 5-cell layout; null when unsure. */
  variantType: VariantType | null;
}

export interface SegmentResult {
  width: number;
  height: number;
  cells: SheetCell[];
}

/** Scores how dark each column is across the full height. */
const columnScores = (
  data: Buffer,
  width: number,
  height: number,
): Float32Array => {
  const scores = new Float32Array(width);
  for (let x = 0; x < width; x++) {
    let count = 0;
    for (let y = 0; y < height; y++) {
      if ((data[y * width + x] ?? 255) < DARK_THRESHOLD) count++;
    }
    scores[x] = count;
  }
  return scores;
};

/** Scores how dark each row is within an x-range. */
const rowScores = (
  data: Buffer,
  width: number,
  region: Region,
): Float32Array => {
  const scores = new Float32Array(region.height);
  for (let y = 0; y < region.height; y++) {
    let count = 0;
    for (let x = region.x; x < region.x + region.width; x++) {
      if ((data[y * width + x] ?? 255) < DARK_THRESHOLD) count++;
    }
    scores[y] = count;
  }
  return scores;
};

/** Splits a span into regions bounded by [start, ...lines, end], dropping slivers. */
const regionsBetween = (
  start: number,
  end: number,
  lines: number[],
  minShare: number,
): Region[] => {
  const edges = [start, ...lines.map((l) => l + start), end];
  const regions: Region[] = [];
  for (let i = 0; i < edges.length - 1; i++) {
    const a = edges[i] ?? start;
    const b = edges[i + 1] ?? end;
    if (b - a < (end - start) * minShare) continue;
    regions.push({ x: a, y: 0, width: b - a, height: 0 });
  }
  return regions;
};

export const segmentLogoSheet = async (
  input: Buffer,
): Promise<SegmentResult> => {
  const { data, info } = await sharp(input)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  if (channels !== 1) {
    throw new Error(`Unexpected channel count ${channels}`);
  }

  const columnRegions = regionsBetween(
    0,
    width,
    findLines(columnScores(data, width, height), height),
    0.1,
  ).map((region) => ({ ...region, height }));

  const cells: SheetCell[] = [];
  const columnCellCounts: number[] = [];

  // Horizontal lines are scored per column region so a divider in one
  // column doesn't cut cells in the other (the template does exactly this).
  for (const region of columnRegions) {
    const rowRegions = regionsBetween(
      region.y,
      region.y + region.height,
      findLines(rowScores(data, width, region), region.width),
      0.08,
    ).map((r) => ({ ...r, x: region.x, width: region.width, height: r.width }));

    const normalized = rowRegions.map((r) => ({
      x: region.x,
      y: r.y,
      width: region.width,
      height: r.height,
    }));

    columnCellCounts.push(normalized.length);
    for (const cell of normalized) {
      cells.push({ ...contentBBox(data, width, cell), variantType: null });
    }
  }

  const variantTypes = assignVariantTypes(columnCellCounts);
  cells.forEach((cell, i) => {
    cell.variantType = variantTypes[i] ?? null;
  });

  return { width, height, cells };
};
