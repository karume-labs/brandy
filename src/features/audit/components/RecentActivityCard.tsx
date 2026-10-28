"use client";

import {
  Badge,
  Card,
  Divider,
  Group,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconHistory } from "@tabler/icons-react";
import Link from "next/link";
import { Fragment } from "react";
import type { AuditLog } from "@/features/audit/components/AuditColumns";
import {
  AUDIT_ACTION_COLORS,
  auditActionLabel,
  auditEntityLabel,
  formatDateTime,
} from "@/features/audit/constants";

interface RecentActivityCardProps {
  entries: AuditLog[];
  isLoading?: boolean;
}

/** Latest 8 audit entries, rendered as the dashboard's activity feed. */
export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
  entries,
  isLoading,
}) => (
  <Card
    padding="lg"
    radius="md"
    shadow="sm"
    bg="var(--mantine-color-card)"
    bd="1px solid var(--app-border)"
  >
    <Stack gap="xs">
      <Group justify="space-between">
        <Group gap="xs">
          <ThemeIcon variant="light" color="amber" size={30} radius="md">
            <IconHistory size={16} />
          </ThemeIcon>
          <Title order={4}>Recent activity</Title>
        </Group>
        <Badge
          component={Link}
          href="/dashboard/audit"
          variant="light"
          color="amber"
          styles={{ root: { textDecoration: "none" } }}
        >
          View all
        </Badge>
      </Group>
      <Divider />
      {isLoading ? (
        <Stack gap={0}>
          {[1, 2, 3].map((i) => (
            <Fragment key={i}>
              {i > 1 && <Divider />}
              <Group justify="space-between" align="flex-start" py="xs">
                <Group gap="sm" align="flex-start" wrap="nowrap">
                  <Skeleton height={24} width={72} radius="xl" />
                  <Stack gap={6} mt={4}>
                    <Skeleton height={14} width={250} radius="xl" />
                    <Skeleton height={10} width={150} radius="xl" />
                  </Stack>
                </Group>
                <Skeleton height={10} width={80} mt={4} radius="xl" />
              </Group>
            </Fragment>
          ))}
        </Stack>
      ) : entries.length === 0 ? (
        <Text size="sm" c="dimmed" py="xs">
          No activity recorded yet.
        </Text>
      ) : (
        <Stack gap={0}>
          {entries.map((entry, index) => (
            <Fragment key={entry.id}>
              {index > 0 && <Divider />}
              <Group justify="space-between" align="flex-start" py="xs">
                <Group gap="sm" align="flex-start" wrap="nowrap">
                  <Badge
                    color={AUDIT_ACTION_COLORS[entry.action]}
                    variant="light"
                    w={72}
                    ta="center"
                  >
                    {auditActionLabel(entry.action)}
                  </Badge>
                  <Stack gap={2}>
                    <Text size="sm" fw={500}>
                      {entry.summary ||
                        `${auditActionLabel(entry.action)} ${auditEntityLabel(entry.entityType).toLowerCase()}`}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {entry.actorName || "System"}
                      {entry.actorEmail ? ` · ${entry.actorEmail}` : ""}
                      {" · "}
                      {auditEntityLabel(entry.entityType)}
                      {entry.entityLabel ? ` · ${entry.entityLabel}` : ""}
                    </Text>
                  </Stack>
                </Group>
                <Text
                  size="xs"
                  c="dimmed"
                  styles={{ root: { whiteSpace: "nowrap" } }}
                >
                  {formatDateTime(entry.createdAt)}
                </Text>
              </Group>
            </Fragment>
          ))}
        </Stack>
      )}
    </Stack>
  </Card>
);
