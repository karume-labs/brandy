"use client";

import { Skeleton, TableTd, TableTr } from "@mantine/core";

interface DataTableSkeletonProps {
  rows: number;
  columns: number;
}

/** Body skeleton for the table view while a page loads. */
export const DataTableSkeleton = ({
  rows,
  columns,
}: DataTableSkeletonProps) => (
  <>
    {Array.from({ length: rows || 10 }).map((_, rowIndex) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons are static
      <TableTr key={`skel-row-${rowIndex}`}>
        {Array.from({ length: columns }).map((__, colIndex) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons are static
          <TableTd key={`skel-col-${colIndex}`}>
            <Skeleton
              height={colIndex === 1 || colIndex === 3 ? 22 : 14}
              width={`${Math.max(30, 80 - colIndex * 15)}%`}
              radius={colIndex === 1 || colIndex === 3 ? "sm" : "xl"}
            />
          </TableTd>
        ))}
      </TableTr>
    ))}
  </>
);
