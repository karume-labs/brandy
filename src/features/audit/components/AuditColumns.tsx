"use client";

import { Badge, Stack, Text } from "@mantine/core";
import type { ColumnDef } from "@tanstack/react-table";
import type { InferSelectModel } from "drizzle-orm";
import {
  AUDIT_ACTION_COLORS,
  AUDIT_ENTITY_COLORS,
  auditActionLabel,
  auditEntityLabel,
  formatDateTime,
} from "@/features/audit/constants";
import type { auditLogs } from "@/features/audit/schema";

export type AuditLog = InferSelectModel<typeof auditLogs>;

export const buildAuditColumns = (): ColumnDef<AuditLog, unknown>[] => [
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Time",
    cell: ({ row }) => (
      <Text size="sm">{formatDateTime(row.original.createdAt)}</Text>
    ),
  },
  {
    id: "actor",
    header: "Actor",
    cell: ({ row }) => (
      <Stack gap={0}>
        <Text size="sm" fw={500}>
          {row.original.actorName || "System"}
        </Text>
        <Text size="xs" c="dimmed">
          {row.original.actorEmail || row.original.actorId || "-"}
        </Text>
      </Stack>
    ),
  },
  {
    id: "action",
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <Badge color={AUDIT_ACTION_COLORS[row.original.action]} variant="light">
        {auditActionLabel(row.original.action)}
      </Badge>
    ),
  },
  {
    id: "entityType",
    accessorKey: "entityType",
    header: "Entity Type",
    cell: ({ row }) => (
      <Badge
        color={AUDIT_ENTITY_COLORS[row.original.entityType]}
        variant="light"
      >
        {auditEntityLabel(row.original.entityType)}
      </Badge>
    ),
  },
  {
    id: "entityLabel",
    accessorKey: "entityLabel",
    header: "Entity Label",
    cell: ({ row }) =>
      row.original.entityLabel ? (
        <Text size="sm">{row.original.entityLabel}</Text>
      ) : (
        <Text size="sm" c="dimmed">
          -
        </Text>
      ),
  },
  {
    id: "summary",
    accessorKey: "summary",
    header: "Summary",
    cell: ({ row }) =>
      row.original.summary ? (
        <Text size="sm">{row.original.summary}</Text>
      ) : (
        <Text size="sm" c="dimmed">
          -
        </Text>
      ),
  },
];
