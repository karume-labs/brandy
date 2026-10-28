"use client";

import { Anchor, Badge, Group, Text } from "@mantine/core";
import type { ColumnDef } from "@tanstack/react-table";
import { formatFileSize } from "@/features/assets/format";
import { assetFileUrl } from "@/features/assets/services/query";

export type AssetRow = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  fileName: string;
  mimeType: string;
  fileSize: number;
  isPublic: boolean;
  createdAt: Date;
};

export const buildAssetColumns = (): ColumnDef<AssetRow, unknown>[] => [
  {
    id: "name",
    accessorKey: "name",
    header: "Asset",
    cell: ({ row }) => (
      <Group gap="xs" wrap="nowrap">
        <Text size="sm" fw={500} truncate maw={260}>
          {row.original.name}
        </Text>
        <Anchor
          href={assetFileUrl(row.original.id)}
          target="_blank"
          rel="noopener noreferrer"
          size="xs"
        >
          Open
        </Anchor>
      </Group>
    ),
  },
  {
    id: "category",
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) =>
      row.original.category ? (
        <Badge variant="light" color="oak">
          {row.original.category}
        </Badge>
      ) : (
        <Text size="sm" c="dimmed">
          -
        </Text>
      ),
  },
  {
    id: "isPublic",
    accessorKey: "isPublic",
    header: "Visibility",
    cell: ({ row }) => (
      <Badge
        variant="light"
        color={row.original.isPublic ? "amber" : "espresso"}
      >
        {row.original.isPublic ? "Public" : "Private"}
      </Badge>
    ),
  },
  {
    id: "fileSize",
    accessorKey: "fileSize",
    header: "Size",
    cell: ({ row }) => (
      <Text size="sm">{formatFileSize(row.original.fileSize)}</Text>
    ),
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <Text size="sm">
        {new Date(row.original.createdAt).toLocaleDateString()}
      </Text>
    ),
  },
];
