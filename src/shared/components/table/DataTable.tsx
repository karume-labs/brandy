"use client";

import {
  Button,
  Card,
  Group,
  Pagination,
  ScrollArea,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { IconArrowDown, IconArrowUp, IconTableOff } from "@tabler/icons-react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  totalRecords: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onClearFilters?: () => void;
  onRowClick?: (row: TData) => void;
  loading?: boolean;
  viewMode?: "table" | "grid";
  renderCard?: (item: TData) => React.ReactNode;
}

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

/** Accessible `aria-sort` value for a column's current sort state. */
const ariaSortValue = (
  direction: "asc" | "desc" | false,
): "ascending" | "descending" | "none" =>
  direction === "asc"
    ? "ascending"
    : direction === "desc"
      ? "descending"
      : "none";

export const DataTable = <TData,>({
  columns,
  data,
  totalRecords,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onClearFilters,
  onRowClick,
  loading,
  viewMode = "table",
  renderCard,
}: DataTableProps<TData>) => {
  // Client-side sort within the current server page.
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const totalPages = Math.ceil(totalRecords / pageSize);
  const startRecord = totalRecords > 0 ? (page - 1) * pageSize + 1 : 0;
  const endRecord = Math.min(page * pageSize, totalRecords);

  return (
    <Stack gap="md">
      {viewMode === "table" ? (
        <Card
          radius="sm"
          bg="var(--mantine-color-card)"
          bd="1px solid var(--app-border)"
          p={0}
        >
          <ScrollArea offsetScrollbars type="scroll">
            <Table highlightOnHover stickyHeader verticalSpacing="sm">
              <TableThead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableTr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const canSort = header.column.getCanSort();
                      const sortDirection = header.column.getIsSorted();
                      const toggleSort =
                        header.column.getToggleSortingHandler();
                      const sortTooltip = canSort
                        ? sortDirection === "asc"
                          ? "Sorted ascending - click to sort descending"
                          : sortDirection === "desc"
                            ? "Sorted descending - click to clear sort"
                            : "Click to sort ascending"
                        : undefined;

                      return (
                        <TableTh
                          key={header.id}
                          c="dimmed"
                          fz="xs"
                          lts="0.05em"
                          tt="uppercase"
                          fw={600}
                          aria-sort={
                            canSort ? ariaSortValue(sortDirection) : undefined
                          }
                          role={canSort ? "button" : undefined}
                          tabIndex={canSort ? 0 : undefined}
                          className={canSort ? "sortable-header" : undefined}
                          onClick={canSort ? toggleSort : undefined}
                          onKeyDown={
                            canSort && toggleSort
                              ? (event) => {
                                  if (
                                    event.key === "Enter" ||
                                    event.key === " "
                                  ) {
                                    event.preventDefault();
                                    toggleSort(event);
                                  }
                                }
                              : undefined
                          }
                        >
                          <Group gap={4} wrap="nowrap">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                            {canSort && (
                              <Tooltip
                                label={sortTooltip}
                                position="top"
                                withArrow
                              >
                                <Group gap={2} wrap="nowrap">
                                  {sortDirection === "asc" ? (
                                    <IconArrowUp size={12} stroke={2} />
                                  ) : sortDirection === "desc" ? (
                                    <IconArrowDown size={12} stroke={2} />
                                  ) : (
                                    <Group gap={2} wrap="nowrap" opacity={0.4}>
                                      <IconArrowUp size={10} stroke={1.5} />
                                      <IconArrowDown size={10} stroke={1.5} />
                                    </Group>
                                  )}
                                </Group>
                              </Tooltip>
                            )}
                          </Group>
                        </TableTh>
                      );
                    })}
                  </TableTr>
                ))}
              </TableThead>
              <TableTbody>
                {loading ? (
                  Array.from({ length: pageSize || 10 }).map((_, rowIndex) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons are static
                    <TableTr key={`skel-row-${rowIndex}`}>
                      {table.getVisibleLeafColumns().map((_col, colIndex) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons are static
                        <TableTd key={`skel-col-${colIndex}`}>
                          <Skeleton
                            height={colIndex === 1 || colIndex === 3 ? 22 : 14}
                            width={`${Math.max(30, 80 - colIndex * 15)}%`}
                            radius={
                              colIndex === 1 || colIndex === 3 ? "sm" : "xl"
                            }
                          />
                        </TableTd>
                      ))}
                    </TableTr>
                  ))
                ) : data.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <TableTr key={row.id}>
                      {row.getVisibleCells().map((cell) => {
                        const canSort = cell.column.getCanSort();
                        const isClickable =
                          !!onRowClick &&
                          !canSort &&
                          cell.column.id !== "actions";

                        return (
                          <TableTd
                            key={cell.id}
                            onClick={
                              isClickable
                                ? () => onRowClick?.(row.original)
                                : undefined
                            }
                            onKeyDown={
                              isClickable
                                ? (event) => {
                                    if (
                                      event.key === "Enter" ||
                                      event.key === " "
                                    ) {
                                      event.preventDefault();
                                      onRowClick?.(row.original);
                                    }
                                  }
                                : undefined
                            }
                            tabIndex={isClickable ? 0 : undefined}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableTd>
                        );
                      })}
                    </TableTr>
                  ))
                ) : (
                  <TableTr>
                    <TableTd colSpan={columns.length}>
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
                    </TableTd>
                  </TableTr>
                )}
              </TableTbody>
            </Table>
          </ScrollArea>
        </Card>
      ) : (
        <div>
          {loading ? (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md">
              {Array.from({ length: pageSize || 10 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons are static
                <Skeleton key={`grid-skel-${i}`} height={200} radius="md" />
              ))}
            </SimpleGrid>
          ) : data.length > 0 && renderCard ? (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md">
              {table.getRowModel().rows.map((row) => (
                <div key={row.id}>{renderCard(row.original)}</div>
              ))}
            </SimpleGrid>
          ) : (
            <Card
              radius="sm"
              bg="var(--mantine-color-card)"
              bd="1px solid var(--app-border)"
              p="xl"
            >
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
            </Card>
          )}
        </div>
      )}

      {totalRecords > 0 && (
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
      )}
    </Stack>
  );
};
