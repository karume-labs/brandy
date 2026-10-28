"use client";

import {
  ActionIcon,
  Button,
  Card,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconArrowDown,
  IconArrowUp,
  IconLayoutGrid,
  IconList,
} from "@tabler/icons-react";
import type { ReactNode } from "react";

export type SortOrder = "newest" | "oldest" | string;

interface DataToolbarProps {
  children: ReactNode;
  onClear?: () => void;
  viewMode?: "table" | "grid";
  onViewModeChange?: (mode: "table" | "grid") => void;
  sort?: SortOrder;
  onSortChange?: (sort: SortOrder) => void;
}

export const DataToolbar: React.FC<DataToolbarProps> = ({
  children,
  onClear,
  viewMode,
  onViewModeChange,
  sort,
  onSortChange,
}) => {
  return (
    <Card withBorder shadow="sm" p="lg">
      <Stack gap="lg">
        <Group justify="space-between">
          <Stack gap={2}>
            <Text fw={500}>Filters</Text>
            <Text size="sm" c="dimmed">
              Refine results
            </Text>
          </Stack>
          <Group>
            {onSortChange && (
              <Paper
                component={Group}
                gap="xs"
                p={4}
                radius="sm"
                bd="1px solid var(--app-border)"
              >
                <Tooltip label="Newest first">
                  <ActionIcon
                    variant={sort === "newest" ? "light" : "subtle"}
                    color="amber.7"
                    onClick={() => onSortChange("newest")}
                    title="Newest first"
                  >
                    <IconArrowDown size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Oldest first">
                  <ActionIcon
                    variant={sort === "oldest" ? "light" : "subtle"}
                    color="amber.7"
                    onClick={() => onSortChange("oldest")}
                    title="Oldest first"
                  >
                    <IconArrowUp size={16} />
                  </ActionIcon>
                </Tooltip>
              </Paper>
            )}
            {onViewModeChange && (
              <Paper
                component={Group}
                gap="xs"
                p={4}
                radius="sm"
                bd="1px solid var(--app-border)"
              >
                <ActionIcon
                  variant={viewMode === "table" ? "light" : "subtle"}
                  color="amber.7"
                  onClick={() => onViewModeChange("table")}
                  title="Table View"
                >
                  <IconList size={16} />
                </ActionIcon>
                <ActionIcon
                  variant={viewMode === "grid" ? "light" : "subtle"}
                  color="amber.7"
                  onClick={() => onViewModeChange("grid")}
                  title="Grid View"
                >
                  <IconLayoutGrid size={16} />
                </ActionIcon>
              </Paper>
            )}
            {onClear && (
              <Button variant="light" onClick={onClear}>
                Clear All
              </Button>
            )}
          </Group>
        </Group>

        {children && (
          <>
            <Divider />
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
              {children}
            </SimpleGrid>
          </>
        )}
      </Stack>
    </Card>
  );
};
