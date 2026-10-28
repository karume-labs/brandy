"use client";

import { Box, Group, Text, Title } from "@mantine/core";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { buildAssetColumns } from "@/features/assets/components/AssetsColumns";
import { useAssets } from "@/features/assets/services/query";
import { DataTable } from "@/shared/components/table/DataTable";
import { DataToolbar } from "@/shared/components/table/DataToolbar";
import { useQueryErrorToast } from "@/shared/hooks/use-query-error-toast";

/**
 * Admin asset list (stub). Upload/management flows land with the asset
 * feature deep-dive - this wires the list plumbing, filters and table.
 */
export const AssetsView = () => {
  const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(20),
  );

  const { data, isLoading, error } = useAssets(page, pageSize, q);
  useQueryErrorToast(error, "Could not load assets");

  const items = data?.items ?? [];
  const totalRecords = data?.total ?? 0;

  return (
    <Box>
      <Group justify="space-between" align="center" my="md">
        <div>
          <Title order={2}>Assets</Title>
          <Text size="sm" c="dimmed">
            Branding assets managed from one place.
          </Text>
        </div>
      </Group>

      <Box mb="md">
        <DataToolbar onClear={q ? () => void setQ("") : undefined}>
          <Text size="sm" c="dimmed">
            Upload and organization tools arrive with the asset feature
            build-out.
          </Text>
        </DataToolbar>
      </Box>

      <DataTable
        columns={buildAssetColumns()}
        data={items}
        totalRecords={totalRecords}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(n) => {
          setPageSize(n);
          setPage(1);
        }}
        onClearFilters={q ? () => void setQ("") : undefined}
        loading={isLoading}
      />
    </Box>
  );
};
