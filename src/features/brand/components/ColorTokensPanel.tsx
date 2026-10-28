"use client";

import { Stack } from "@mantine/core";
import { ColorAudit } from "@/features/brand/components/ColorAudit";
import { ColorTokenTable } from "@/features/brand/components/ColorTokenTable";
import { TokenReference } from "@/features/brand/components/TokenReference";
import type {
  brandColors,
  brandGradients,
  brandTypography,
} from "@/features/brand/schema";

type BrandColor = typeof brandColors.$inferSelect;
type BrandGradient = typeof brandGradients.$inferSelect;
type BrandTypography = typeof brandTypography.$inferSelect;

interface ColorTokensPanelProps {
  brandId: string;
  colors: BrandColor[];
  gradients: BrandGradient[];
  typography: BrandTypography[];
}

/** Color/gradient/typography tokens plus the live WCAG audit. */
export const ColorTokensPanel = ({
  brandId,
  colors,
  gradients,
  typography,
}: ColorTokensPanelProps) => (
  <Stack gap="md">
    <ColorAudit colors={colors} />
    <ColorTokenTable brandId={brandId} colors={colors} />
    <TokenReference gradients={gradients} typography={typography} />
  </Stack>
);
