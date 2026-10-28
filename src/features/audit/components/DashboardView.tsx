"use client";

import {
  Container,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconPalette, IconUsers, IconWorld } from "@tabler/icons-react";
import { RecentActivityCard } from "@/features/audit/components/RecentActivityCard";
import {
  type StatCardData,
  StatCards,
} from "@/features/audit/components/StatCards";
import { useDashboardStats } from "@/features/audit/services/query";
import { useQueryErrorToast } from "@/shared/hooks/use-query-error-toast";

export const DashboardView = () => {
  const { data: stats, isLoading, error } = useDashboardStats();
  useQueryErrorToast(error, "Could not load dashboard stats");

  const statCards: StatCardData[] = stats
    ? [
        {
          label: "Users",
          value: stats.users.total,
          description: "Registered accounts",
          icon: IconUsers,
          color: "oak",
          href: "/dashboard/users",
        },
        {
          label: "Assets",
          value: stats.assets.total,
          description: "Branding assets",
          icon: IconPalette,
          color: "amber",
          href: "/dashboard/assets",
        },
        {
          label: "Public",
          value: stats.assets.public,
          description: "Visible without login",
          icon: IconWorld,
          color: "espresso",
          href: "/",
        },
      ]
    : [];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1}>Dashboard</Title>
          <Text c="dimmed">Overview of your branding asset platform.</Text>
        </div>

        {isLoading ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} height={140} radius="md" />
            ))}
          </SimpleGrid>
        ) : (
          <StatCards cards={statCards} />
        )}

        <RecentActivityCard
          entries={stats?.recentActivity ?? []}
          isLoading={isLoading}
        />
      </Stack>
    </Container>
  );
};
