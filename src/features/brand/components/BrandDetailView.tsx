"use client";

import { Box, Skeleton, Tabs, Text, Title } from "@mantine/core";
import { IconPalette, IconPhoto, IconScript } from "@tabler/icons-react";
import { BrandAssetsPanel } from "@/features/brand/components/BrandAssetsPanel";
import { BrandPromptsPanel } from "@/features/brand/components/BrandPromptsPanel";
import { ColorTokensPanel } from "@/features/brand/components/ColorTokensPanel";
import { useBrand } from "@/features/brand/services/query";
import { useQueryErrorToast } from "@/shared/hooks/use-query-error-toast";

interface BrandDetailViewProps {
  brandId: string;
}

/** Brand identity hub: design tokens, asset library and LLM prompts. */
export const BrandDetailView = ({ brandId }: BrandDetailViewProps) => {
  const { data, isPending, error } = useBrand(brandId);
  useQueryErrorToast(error, "Could not load brand");

  if (isPending) {
    return (
      <Box my="md">
        <Skeleton height={36} mb="md" />
        <Skeleton height={240} />
      </Box>
    );
  }

  if (!data) {
    return (
      <Text my="md" c="dimmed">
        Brand not found.
      </Text>
    );
  }

  return (
    <Box my="md">
      <Title order={2}>{data.brand.name}</Title>
      <Text size="sm" c="dimmed" mb="md">
        {data.brand.tagline ?? data.brand.slug}
      </Text>

      <Tabs defaultValue="tokens">
        <Tabs.List>
          <Tabs.Tab value="tokens" leftSection={<IconPalette size={16} />}>
            Tokens
          </Tabs.Tab>
          <Tabs.Tab value="assets" leftSection={<IconPhoto size={16} />}>
            Assets
          </Tabs.Tab>
          <Tabs.Tab value="prompts" leftSection={<IconScript size={16} />}>
            LLM Prompts
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="tokens" pt="md">
          <ColorTokensPanel
            brandId={brandId}
            colors={data.colors}
            gradients={data.gradients}
            typography={data.typography}
          />
        </Tabs.Panel>

        <Tabs.Panel value="assets" pt="md">
          <BrandAssetsPanel brandId={brandId} />
        </Tabs.Panel>

        <Tabs.Panel value="prompts" pt="md">
          <BrandPromptsPanel brandId={brandId} prompts={data.prompts} />
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
};
