"use client";

import { ActionIcon, Badge, Box, Group, Text, Tooltip } from "@mantine/core";
import { IconFile } from "@tabler/icons-react";
import { formatFileSize } from "@/features/assets/format";
import { brandAssetFileUrl } from "@/features/assets/services/brand-query";

interface AssetRowLike {
  id: string;
  name: string;
  category: string | null;
  variantType: string | null;
  currentVersion: { fileSize: number; version: number } | null;
}

interface BrandAssetRowProps {
  asset: AssetRowLike;
}

/** One asset: thumbnail, size/version meta, category badges, download. */
export const BrandAssetRow = ({ asset }: BrandAssetRowProps) => (
  <Group
    justify="space-between"
    p="sm"
    style={{
      border: "1px solid var(--mantine-color-default-border)",
      borderRadius: 8,
    }}
  >
    <Group gap="sm">
      <Box
        w={36}
        h={36}
        style={{
          borderRadius: 6,
          backgroundColor: "var(--mantine-color-body)",
          border: "1px solid",
          backgroundImage: asset.currentVersion
            ? `url(${brandAssetFileUrl(asset.id)})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div>
        <Text size="sm" fw={500}>
          {asset.name}
        </Text>
        <Text size="xs" c="dimmed">
          {asset.currentVersion
            ? `${formatFileSize(asset.currentVersion.fileSize)} · v${asset.currentVersion.version}`
            : "no file yet"}
        </Text>
      </div>
    </Group>
    <Group gap="xs">
      <Badge size="sm">{asset.category}</Badge>
      {asset.variantType && (
        <Badge size="sm" color="blue">
          {asset.variantType}
        </Badge>
      )}
      <Tooltip label="Download active version">
        <ActionIcon
          variant="subtle"
          component="a"
          href={brandAssetFileUrl(asset.id)}
          download
          disabled={!asset.currentVersion}
        >
          <IconFile size={16} />
        </ActionIcon>
      </Tooltip>
    </Group>
  </Group>
);
