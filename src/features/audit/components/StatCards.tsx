"use client";

import {
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconChevronRight, type TablerIcon } from "@tabler/icons-react";
import Link from "next/link";

export interface StatCardData {
  label: string;
  value: number;
  description: string;
  icon: TablerIcon;
  href: string;
  color: string;
}

interface StatCardsProps {
  cards: StatCardData[];
}

export const StatCards: React.FC<StatCardsProps> = ({ cards }) => (
  <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
    {cards.map((card) => {
      const isZero = card.value === 0;

      return (
        <Card
          key={card.label}
          component={Link}
          href={card.href}
          padding="sm"
          shadow="sm"
          opacity={isZero ? 0.6 : 1}
        >
          <Group justify="space-between" align="center" wrap="nowrap">
            <Group wrap="nowrap" gap="sm">
              <ThemeIcon
                size={38}
                radius="md"
                variant="light"
                color={card.color}
              >
                <card.icon size={20} />
              </ThemeIcon>
              <Stack gap={2}>
                <Group gap="xs" align="baseline">
                  <Title order={4} fw={800} lh={1}>
                    {card.value}
                  </Title>
                  <Text size="sm" fw={600}>
                    {card.label}
                  </Text>
                </Group>
                <Text size="xs" c="dimmed" opacity={0.7}>
                  {card.description}
                </Text>
              </Stack>
            </Group>
            <IconChevronRight
              size={16}
              color="var(--mantine-color-dimmed)"
              opacity={0.5}
            />
          </Group>
        </Card>
      );
    })}
  </SimpleGrid>
);
