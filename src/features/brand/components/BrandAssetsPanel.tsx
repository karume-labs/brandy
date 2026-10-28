"use client";

import { Group, Select, Stack, Text } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import { IconFile, IconUpload, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { ASSET_CATEGORIES } from "@/features/assets/brand-schema";
import {
  useBrandAssets,
  useIngestSheet,
} from "@/features/assets/services/brand-query";
import { BrandAssetRow } from "@/features/brand/components/BrandAssetRow";

interface BrandAssetsPanelProps {
  brandId: string;
}

const CATEGORY_OPTIONS = ASSET_CATEGORIES.map((value) => ({
  value,
  label: value,
}));

/** Brand asset library: drop a logo sheet, browse categorized files. */
export const BrandAssetsPanel = ({ brandId }: BrandAssetsPanelProps) => {
  const { data: assets, isPending } = useBrandAssets(brandId);
  const ingest = useIngestSheet(brandId);
  const [category, setCategory] = useState<string | null>(null);

  const onDrop = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    ingest.mutate(
      { brandId, file },
      {
        onSuccess: (result) => {
          notifications.show({
            title: "Sheet ingested",
            message: `Segmented into ${result.variants.length} variant(s).`,
            color: "green",
          });
        },
        onError: (error: Error) => {
          notifications.show({
            title: "Ingestion failed",
            message: error.message,
            color: "red",
          });
        },
      },
    );
  };

  const visible = (assets ?? []).filter(
    (asset) => !category || asset.category === category,
  );

  return (
    <Stack gap="md">
      <Dropzone
        onDrop={onDrop}
        accept={{
          "image/png": [".png"],
          "image/jpeg": [".jpg", ".jpeg"],
          "image/webp": [".webp"],
          "image/svg+xml": [".svg"],
        }}
        loading={ingest.isPending}
      >
        <Group justify="center" gap="sm" mih={100}>
          <Dropzone.Accept>
            <IconUpload size={28} color="var(--mantine-color-blue-6)" />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={28} color="var(--mantine-color-red-6)" />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconFile size={28} color="var(--mantine-color-dimmed)" />
          </Dropzone.Idle>
          <div>
            <Text size="sm" ta="center">
              Drop a master logo sheet here, or click to browse
            </Text>
            <Text size="xs" c="dimmed" ta="center">
              PNG, JPG, WEBP or SVG - segmented into the 5 standard variants
            </Text>
          </div>
        </Group>
      </Dropzone>

      <Group justify="space-between">
        <Text fw={600}>Assets</Text>
        <Select
          placeholder="All categories"
          data={CATEGORY_OPTIONS}
          value={category}
          onChange={setCategory}
          clearable
          w={200}
          size="xs"
        />
      </Group>

      {isPending && (
        <Text size="sm" c="dimmed">
          Loading assets…
        </Text>
      )}

      <Stack gap="xs">
        {visible.map((asset) => (
          <BrandAssetRow key={asset.id} asset={asset} />
        ))}
        {!isPending && visible.length === 0 && (
          <Text size="sm" c="dimmed">
            No assets in this category yet.
          </Text>
        )}
      </Stack>
    </Stack>
  );
};
