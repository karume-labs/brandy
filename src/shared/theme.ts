import { createTheme, type MantineColorsTuple } from "@mantine/core";

/**
 * Brandy design system: premium spirits-label elegance meets clean
 * tech-product simplicity. Palette + type scale from the brand guide.
 */

/** Primary text, dark barrel elements, UI container borders. */
const espresso: MantineColorsTuple = [
  "#EFE9E4",
  "#DFD5CD",
  "#C6B6AA",
  "#AA9385",
  "#8C7062",
  "#6F5648",
  "#564136",
  "#3E2D24",
  "#2A1E18",
  "#1D1410",
];

/** Barrel body fills, primary structural containers. */
const oak: MantineColorsTuple = [
  "#F7EEE6",
  "#EDDCCB",
  "#DEC1A4",
  "#CB9F78",
  "#B57F52",
  "#9A6334",
  "#7F4D24",
  "#6A3B18",
  "#522D12",
  "#3A1F0C",
];

/** Liquid / accent: interactive highlights, active state indicators. */
const amber: MantineColorsTuple = [
  "#FDF4E6",
  "#FAE7CD",
  "#F5D2A5",
  "#ECB874",
  "#DF9C47",
  "#CE7E22",
  "#A8570A",
  "#8B4708",
  "#6E3806",
  "#552B04",
];

/** Typography on dark backgrounds, icon fills, card surfaces. */
const cream: MantineColorsTuple = [
  "#FBF6EC",
  "#F8F1E2",
  "#F4EADA",
  "#F0E3CE",
  "#EBDCC2",
  "#E6D5B7",
  "#DFCCA9",
  "#D6C099",
  "#CBB286",
  "#BDA170",
];

/** Main application background canvas, neutral base. */
const sand: MantineColorsTuple = [
  "#FDFBF7",
  "#F9F5EE",
  "#F3ECDD",
  "#EDE4CF",
  "#E5DAC0",
  "#DCCFB0",
  "#D1C19E",
  "#C3B08A",
  "#B29C74",
  "#9E875E",
];

/** Fraunces for display/headings, Inter for body/UI - loaded in the layout. */
const HEADING_FONT = "var(--font-fraunces), Fraunces, Georgia, serif";
const BODY_FONT =
  "var(--font-inter), Inter, Plus Jakarta Sans, Geist, system-ui, sans-serif";

export const theme = createTheme({
  primaryColor: "amber",
  colors: {
    espresso,
    oak,
    amber,
    cream,
    sand,
  },
  fontFamily: BODY_FONT,
  headings: {
    fontFamily: HEADING_FONT,
    sizes: {
      h1: { fontSize: "36px", lineHeight: "1.2", fontWeight: "600" },
      h2: { fontSize: "28px", lineHeight: "1.25", fontWeight: "600" },
      h3: { fontSize: "22px", lineHeight: "1.3", fontWeight: "600" },
    },
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
  radius: {
    xs: "6px",
    sm: "10px",
    md: "16px",
    lg: "9999px",
    xl: "9999px",
  },
  shadows: {
    sm: "0 1px 2px rgba(29, 20, 16, 0.08)",
    md: "0 4px 12px rgba(29, 20, 16, 0.12)",
    lg: "0 12px 32px rgba(29, 20, 16, 0.16)",
  },
  components: {
    Button: {
      defaultProps: {
        color: "amber",
        radius: "md",
      },
    },
    // Identity sheet cards: warm cream surfaces, espresso borders.
    Card: {
      defaultProps: {
        radius: "md",
        shadow: "sm",
        bg: "var(--app-surface)",
        bd: "1px solid var(--app-border)",
      },
    },
    Badge: {
      defaultProps: {
        color: "amber",
        variant: "light",
        radius: "xl",
      },
    },
  },
});
