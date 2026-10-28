"use client";

import { Group, TableTh, TableThead, TableTr, Tooltip } from "@mantine/core";
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import { flexRender, type HeaderGroup } from "@tanstack/react-table";

/** Accessible `aria-sort` value for a column's current sort state. */
export const ariaSortValue = (
  direction: "asc" | "desc" | false,
): "ascending" | "descending" | "none" =>
  direction === "asc"
    ? "ascending"
    : direction === "desc"
      ? "descending"
      : "none";

interface DataTableHeaderProps<TData> {
  headerGroups: HeaderGroup<TData>[];
}

export const DataTableHeader = <TData,>({
  headerGroups,
}: DataTableHeaderProps<TData>) => (
  <TableThead>
    {headerGroups.map((headerGroup) => (
      <TableTr key={headerGroup.id}>
        {headerGroup.headers.map((header) => {
          const canSort = header.column.getCanSort();
          const sortDirection = header.column.getIsSorted();
          const toggleSort = header.column.getToggleSortingHandler();
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
              aria-sort={canSort ? ariaSortValue(sortDirection) : undefined}
              role={canSort ? "button" : undefined}
              tabIndex={canSort ? 0 : undefined}
              className={canSort ? "sortable-header" : undefined}
              onClick={canSort ? toggleSort : undefined}
              onKeyDown={
                canSort && toggleSort
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
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
                  <Tooltip label={sortTooltip} position="top" withArrow>
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
);
