"use client";

import {
  Badge,
  Button,
  Card,
  Center,
  Group,
  Image,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconDownload,
  IconFile,
  IconSearch,
  IconWorld,
} from "@tabler/icons-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { formatFileSize } from "@/features/assets/format";
import { usePublicAssets } from "@/features/assets/services/query";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { DataTable } from "@/shared/components/table/DataTable";
import { useQueryErrorToast } from "@/shared/hooks/use-query-error-toast";

/** One asset card in the public library grid. */
const AssetCard = ({
  item,
}: {
  item: {
    id: string;
    name: string;
    category: string | null;
    mimeType: string;
    fileSize: number;
    createdAt: Date;
  };
}) => {
  const fileUrl = `/api/assets/${item.id}/file`;
  const isImage = item.mimeType.startsWith("image/");

  return (
    <Card padding="sm" shadow="sm" withBorder radius="md" h="100%">
      <Card.Section>
        {isImage ? (
          <Image
            src={fileUrl}
            alt={item.name}
            h={160}
            fit="contain"
            bg="var(--mantine-color-body)"
          />
        ) : (
          <Center h={160} bg="var(--mantine-color-default-hover)">
            <ThemeIcon size={56} radius="md" variant="light" color="amber">
              <IconFile size={30} stroke={1.5} />
            </ThemeIcon>
          </Center>
        )}
      </Card.Section>

      <Stack gap={4} mt="sm" style={{ flex: 1 }}>
        <Group justify="space-between" wrap="nowrap" gap="xs">
          <Text fw={600} size="sm" truncate>
            {item.name}
          </Text>
          {item.category && (
            <Badge variant="light" color="oak" size="sm">
              {item.category}
            </Badge>
          )}
        </Group>
        <Text size="xs" c="dimmed">
          {formatFileSize(item.fileSize)} ·{" "}
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Button
          component="a"
          href={fileUrl}
          download={item.name}
          leftSection={<IconDownload size={16} />}
          variant="light"
          fullWidth
          mt="xs"
        >
          Download
        </Button>
      </Stack>
    </Card>
  );
};

/**
 * Public, unauthenticated asset library. Anyone with the link can browse and
 * download everything flagged public - no sign-in required.
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
          <Tooltip label="Public library - visible to everyone">
            <Badge leftSection={<IconWorld size={14} />} variant="light">
              Public
            </Badge>
          </Tooltip>
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
          renderCard={(item) => <AssetCard key={item.id} item={item} />}
          onClearFilters={q ? () => void setQ("") : undefined}
        />
      </Stack>
    </Center>
  );
};
