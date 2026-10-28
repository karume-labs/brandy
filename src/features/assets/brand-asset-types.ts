/** The 5 standardized structural logo formats from the logo-sheet template. */
export const VARIANT_TYPES = [
  "stacked",
  "horizontal",
  "circular",
  "icon",
  "mono",
] as const;
export type VariantType = (typeof VARIANT_TYPES)[number];

export const VARIANT_LABELS: Record<VariantType, string> = {
  stacked: "Stacked",
  horizontal: "Horizontal",
  circular: "Circular Badge",
  icon: "Icon Only",
  mono: "One-Color / Mono",
};

export type BrandAssetKind =
  | "logo_sheet"
  | "logo_variant"
  | "image"
  | "document";

/**
 * Broad file categories so the library scales past logos: marketing
 * collateral, social kits, presentations, fonts, guides, etc.
 */
export const ASSET_CATEGORIES = [
  "logo",
  "marketing",
  "social",
  "presentation",
  "document",
  "image",
  "video",
  "font",
  "template",
  "other",
] as const;
export type AssetCategory = (typeof ASSET_CATEGORIES)[number];

/** Rule-enforcement metadata stored on every asset version. */
export interface VariantRules {
  /** Minimum rendered width as a percentage of the viewport/container. */
  minDisplayPct: number | null;
  /** Required clear space around the mark, in multiples of its height. */
  clearSpace: "1x" | "0.5x" | "none";
  orientation: "any" | "landscape" | "portrait" | "square";
  /** Forced background tile (e.g. Go Play's midnight rounded container). */
  tile: { color: string; radius: number } | null;
}

export const DEFAULT_VARIANT_RULES: VariantRules = {
  minDisplayPct: null,
  clearSpace: "1x",
  orientation: "any",
  tile: null,
};
