/** Relative luminance of an sRGB hex color (WCAG 2.1). */
const luminance = (hex: string): number => {
  const channel = (raw: number): number => {
    const c = raw / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

/** Contrast ratio between two hex colors: 1 = identical, 21 = black on white. */
export const contrastRatio = (a: string, b: string): number => {
  const la = luminance(a);
  const lb = luminance(b);
  const light = Math.max(la, lb);
  const dark = Math.min(la, lb);
  return (light + 0.05) / (dark + 0.05);
};

export type WcagLevel = "AAA" | "AA" | "AA-large" | "fail";

/** Grades a foreground/background pair against WCAG 2.1 thresholds. */
export const wcagLevel = (ratio: number, largeText = false): WcagLevel => {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (largeText && ratio >= 3) return "AA-large";
  return "fail";
};

export interface ContrastPair {
  foreground: string;
  background: string;
  ratio: number;
  level: WcagLevel;
}

/**
 * Audits every text color against every surface: lime text on white fails,
 * dark espresso on cream passes. Pairs come from the brand's own tokens.
 */
export const auditContrast = (
  textColors: string[],
  backgrounds: string[],
): ContrastPair[] => {
  const pairs: ContrastPair[] = [];
  for (const foreground of textColors) {
    for (const background of backgrounds) {
      const ratio = contrastRatio(foreground, background);
      pairs.push({ foreground, background, ratio, level: wcagLevel(ratio) });
    }
  }
  return pairs;
};
