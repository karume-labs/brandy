import type { VariantType } from "@/features/assets/brand-schema";

/** Grayscale value below which a pixel counts as divider ink. */
export const DARK_THRESHOLD = 150;
/** Fraction of a span a divider must cover to count as a line. */
export const LINE_COVERAGE = 0.55;
/** Candidate line positions closer than this merge into one line. */
export const MERGE_DISTANCE = 10;
/** Background difference (per channel) below which a pixel is "background". */
export const BG_DIFF = 26;

export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Centers of the runs whose score clears coverage * span. */
export const findLines = (
  scores: Float32Array,
  span: number,
  coverage = LINE_COVERAGE,
): number[] => {
  const threshold = span * coverage;
  const lines: number[] = [];
  let runStart = -1;

  for (let i = 0; i < scores.length; i++) {
    if (scores[i] >= threshold) {
      if (runStart === -1) runStart = i;
    } else if (runStart !== -1) {
      lines.push(Math.round((runStart + i - 1) / 2));
      runStart = -1;
    }
  }
  if (runStart !== -1) {
    lines.push(Math.round((runStart + scores.length - 1) / 2));
  }

  // Merge candidates that are practically the same line.
  return lines.filter((pos, i) => {
    if (i === 0) return true;
    return pos - (lines[i - 1] ?? 0) > MERGE_DISTANCE;
  });
};

/**
 * The template's canonical cell order for a 2-column, 2+3 row sheet:
 * left column = stacked over circular, right column = horizontal, icon,
 * mono (top to bottom).
 */
const POSITIONAL_LAYOUT: VariantType[][] = [
  ["stacked", "circular"],
  ["horizontal", "icon", "mono"],
];

export const assignVariantTypes = (
  columnCellCounts: number[],
): (VariantType | null)[] => {
  const flat: (VariantType | null)[] = [];
  const standard =
    columnCellCounts.length === POSITIONAL_LAYOUT.length &&
    columnCellCounts.every(
      (count, i) => count === POSITIONAL_LAYOUT[i]?.length,
    );

  for (let col = 0; col < columnCellCounts.length; col++) {
    const count = columnCellCounts[col] ?? 0;
    for (let row = 0; row < count; row++) {
      flat.push(standard ? (POSITIONAL_LAYOUT[col]?.[row] ?? null) : null);
    }
  }
  return flat;
};
