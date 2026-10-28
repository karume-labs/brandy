"use client";

import { Card, SimpleGrid, Skeleton } from "@mantine/core";
import type { Row } from "@tanstack/react-table";
import { DataTableEmptyState } from "@/shared/components/table/DataTableEmptyState";

interface DataTableGridProps<TData> {
  rows: Row<TData>[];
  pageSize: number;
  loading?: boolean;
  renderCard?: (item: TData) => React.ReactNode;
  onClearFilters?: () => void;
}

/** Card-grid rendering used by galleries (e.g. the public asset library). */
export const DataTableGrid = <TData,>({
  rows,
  pageSize,
  loading,
  renderCard,
  onClearFilters,
}: DataTableGridProps<TData>) => {
  if (loading) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md">
        {Array.from({ length: pageSize || 10 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons are static
          <Skeleton key={`grid-skel-${i}`} height={200} radius="md" />
        ))}
      </SimpleGrid>
    );
  }

  if (rows.length > 0 && renderCard) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md">
        {rows.map((row) => (
          <div key={row.id}>{renderCard(row.original)}</div>
        ))}
      </SimpleGrid>
    );
  }

  return (
    <Card
      radius="sm"
      bg="var(--mantine-color-card)"
      bd="1px solid var(--app-border)"
      p="xl"
    >
      <DataTableEmptyState onClearFilters={onClearFilters} />
    </Card>
  );
};
