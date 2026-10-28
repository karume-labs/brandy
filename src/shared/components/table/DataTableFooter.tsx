"use client";

import { Group, Pagination, Select, Text } from "@mantine/core";

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

interface DataTableFooterProps {
  totalRecords: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  loading?: boolean;
}

/** "Showing X to Y of Z" + page-size select + pagination controls. */
export const DataTableFooter = ({
  totalRecords,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading,
}: DataTableFooterProps) => {
  if (totalRecords <= 0) return null;

  const totalPages = Math.ceil(totalRecords / pageSize);
  const startRecord = (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, totalRecords);

  return (
    <Group justify="space-between" align="center">
      <Text size="sm" c="dimmed">
        Showing {startRecord} to {endRecord} of {totalRecords} records
      </Text>
      <Group gap="xl">
        {onPageSizeChange && (
          <Group gap="xs">
            <Text size="sm" fw={500}>
              Rows per page
            </Text>
            <Select
              value={`${pageSize}`}
              onChange={(value) => onPageSizeChange(Number(value))}
              data={PAGE_SIZE_OPTIONS.map(String)}
              w={80}
              size="sm"
              disabled={loading}
            />
          </Group>
        )}
        <Pagination
          value={page}
          onChange={onPageChange}
          total={totalPages || 1}
          withEdges
          disabled={loading}
        />
      </Group>
    </Group>
  );
};
