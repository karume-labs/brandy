"use client";

import { Button, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconTableOff } from "@tabler/icons-react";

interface DataTableEmptyStateProps {
  onClearFilters?: () => void;
}

/** Shared empty-state body for both the table and grid views. */
export const DataTableEmptyState = ({
  onClearFilters,
}: DataTableEmptyStateProps) => (
  <Stack align="center" justify="center" py="xl" gap="md">
    <ThemeIcon size={60} radius="md" variant="light">
      <IconTableOff size={32} stroke={1.5} />
    </ThemeIcon>
    <Text size="lg" fw={500}>
      No results found
    </Text>
    <Text size="sm" c="dimmed">
      {onClearFilters
        ? "Try adjusting your filters"
        : "No records to display yet"}
    </Text>
    {onClearFilters && (
      <Button variant="outline" onClick={onClearFilters}>
        Clear Filters
      </Button>
    )}
  </Stack>
);
