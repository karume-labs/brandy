"use client";

import {
  Badge,
  Center,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconSearch, IconWorld } from "@tabler/icons-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { PublicAssetCard } from "@/features/assets/components/PublicAssetCard";
import { usePublicAssets } from "@/features/assets/services/query";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { DataTable } from "@/shared/components/table/DataTable";
import { useQueryErrorToast } from "@/shared/hooks/use-query-error-toast";

/**
 * Public, unauthenticated asset library. Anyone with the link can browse
 * and download everything flagged public - no sign-in required.
 */
export const PublicAssetsPage = () => {
  const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(24),
  );

  const { data, isLoading, error } = usePublicAssets(page, pageSize, q);
  useQueryErrorToast(error, "Could not load the asset library");

  const items = data?.items ?? [];
  const totalRecords = data?.total ?? 0;

  return (
    <Center py="xl" px="md">
      <Stack gap="xl" w="100%" maw={1200}>
        <Group justify="space-between" align="flex-start">
          <Group gap="md" align="center">
            <BrandLogo size={48} priority />
            <div>
              <Title order={1}>Brandy Asset Library</Title>
              <Text c="dimmed" size="sm">
                Branding assets, free to browse and download - no account
                needed.
              </Text>
            </div>
          </Group>
          <TooltipishBadge />
        </Group>

        <Group justify="space-between" align="center">
          <TextInput
            placeholder="Search assets..."
            leftSection={<IconSearch size={16} />}
            value={q}
            onChange={(event) => void setQ(event.currentTarget.value)}
            w={{ base: "100%", sm: 320 }}
          />
          <Text size="sm" c="dimmed">
            {totalRecords} public asset{totalRecords === 1 ? "" : "s"}
          </Text>
        </Group>

        <DataTable
          columns={[]}
          data={items}
          totalRecords={totalRecords}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(n) => {
            setPageSize(n);
            setPage(1);
          }}
          loading={isLoading}
          viewMode="grid"
          renderCard={(item) => <PublicAssetCard key={item.id} item={item} />}
          onClearFilters={q ? () => void setQ("") : undefined}
        />
      </Stack>
    </Center>
  );
};

/** Small "visible to everyone" indicator. */
const TooltipishBadge = () => (
  <Badge leftSection={<IconWorld size={14} />} variant="light">
    Public
  </Badge>
);
