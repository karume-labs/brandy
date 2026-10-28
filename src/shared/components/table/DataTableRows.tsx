"use client";

import { TableTd, TableTr } from "@mantine/core";
import { flexRender, type Row } from "@tanstack/react-table";
import { DataTableEmptyState } from "@/shared/components/table/DataTableEmptyState";
import { DataTableSkeleton } from "@/shared/components/table/DataTableSkeleton";

interface DataTableRowsProps<TData> {
  rows: Row<TData>[];
  columnCount: number;
  dataLength: number;
  pageSize: number;
  loading?: boolean;
  onRowClick?: (row: TData) => void;
  onClearFilters?: () => void;
}

/** Table body: skeleton, clickable rows, or the empty state. */
export const DataTableRows = <TData,>({
  rows,
  columnCount,
  dataLength,
  pageSize,
  loading,
  onRowClick,
  onClearFilters,
}: DataTableRowsProps<TData>) => {
  if (loading) {
    return <DataTableSkeleton rows={pageSize} columns={columnCount} />;
  }

  if (dataLength > 0) {
    return rows.map((row) => (
      <TableTr key={row.id}>
        {row.getVisibleCells().map((cell) => {
          const canSort = cell.column.getCanSort();
          const isClickable =
            !!onRowClick && !canSort && cell.column.id !== "actions";

          return (
            <TableTd
              key={cell.id}
              onClick={
                isClickable ? () => onRowClick?.(row.original) : undefined
              }
              onKeyDown={
                isClickable
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onRowClick?.(row.original);
                      }
                    }
                  : undefined
              }
              tabIndex={isClickable ? 0 : undefined}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableTd>
          );
        })}
      </TableTr>
    ));
  }

  return (
    <TableTr>
      <TableTd colSpan={columnCount}>
        <DataTableEmptyState onClearFilters={onClearFilters} />
      </TableTd>
    </TableTr>
  );
};
