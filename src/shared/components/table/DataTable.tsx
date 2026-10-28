"use client";

import { Card, ScrollArea, Stack, Table, TableTbody } from "@mantine/core";
import {
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { DataTableFooter } from "@/shared/components/table/DataTableFooter";
import { DataTableGrid } from "@/shared/components/table/DataTableGrid";
import { DataTableHeader } from "@/shared/components/table/DataTableHeader";
import { DataTableRows } from "@/shared/components/table/DataTableRows";

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
              <DataTableHeader headerGroups={table.getHeaderGroups()} />
              <TableTbody>
                <DataTableRows
                  rows={table.getRowModel().rows}
                  columnCount={columns.length}
                  dataLength={data.length}
                  pageSize={pageSize}
                  loading={loading}
                  onRowClick={onRowClick}
                  onClearFilters={onClearFilters}
                />
              </TableTbody>
            </Table>
          </ScrollArea>
        </Card>
      ) : (
        <DataTableGrid
          rows={table.getRowModel().rows}
          pageSize={pageSize}
          loading={loading}
          renderCard={renderCard}
          onClearFilters={onClearFilters}
        />
      )}

      <DataTableFooter
        totalRecords={totalRecords}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        loading={loading}
      />
    </Stack>
  );
};
