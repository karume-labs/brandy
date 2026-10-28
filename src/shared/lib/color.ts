/**
 * Color math + WCAG 2.1 contrast auditing. Pure functions - used by the
 * tokens UI (live audit) and reusable by the export engine later.
 */

/** sRGB channel -> linear light. */
const toLinear = (channel: number): number => {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export const hexToRgb = (hex: string): Rgb => {
  const value = hex.replace("#", "");
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
};

/** Relative luminance per WCAG 2.1. */
export const relativeLuminance = ({ r, g, b }: Rgb): number =>
  0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

/** Contrast ratio (1..21) between two hex colors. */
export const contrastRatio = (fgHex: string, bgHex: string): number => {
  const l1 = relativeLuminance(hexToRgb(fgHex));
  const l2 = relativeLuminance(hexToRgb(bgHex));
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (light + 0.05) / (dark + 0.05);
};

export type WcagLevel = "AAA" | "AA" | "AA-large" | "fail";

/** Required ratio for normal text is 4.5 (AA) / 7 (AAA); large text 3 / 4.5. */
export const wcagLevel = (ratio: number, largeText = false): WcagLevel => {
  if (largeText) {
    if (ratio >= 4.5) return "AAA";
    if (ratio >= 3) return "AA";
    return "fail";
  }
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA-large";
  return "fail";
};

export interface ContrastPairResult {
  fg: string;
  bg: string;
  label: string;
  ratio: number;
  level: WcagLevel;
  passesAA: boolean;
  passesAAA: boolean;
}

/**
 * Audits a palette against a set of surfaces. `largeText` matters for
 * display headings rendered in brand colors.
 */
export const auditContrast = (
  colors: { name: string; hex: string }[],
  surfaces: { name: string; hex: string }[],
  largeText = false,
): ContrastPairResult[] => {
  const results: ContrastPairResult[] = [];
  for (const color of colors) {
    for (const surface of surfaces) {
      if (color.hex.toLowerCase() === surface.hex.toLowerCase()) continue;
      const ratio = contrastRatio(color.hex, surface.hex);
      const level = wcagLevel(ratio, largeText);
      results.push({
        fg: color.hex,
        bg: surface.hex,
        label: `${color.name} on ${surface.name}`,
        ratio: Math.round(ratio * 100) / 100,
        level,
        passesAA: level === "AA" || level === "AAA",
        passesAAA: level === "AAA",
      });
    }
  }
  return results;
};

/** Saturation (HSL) of a hex color, 0..1 - used to pick a primary. */
export const saturation = (hex: string): number => {
  const { r, g, b } = hexToRgb(hex);
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const lightness = (max + min) / 2;
  if (max === min) return 0;
  const d = max - min;
  return d / (1 - Math.abs(2 * lightness - 1));
};
