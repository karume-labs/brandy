"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { useBrands, useCreateBrand } from "@/features/brand/services/query";
import { useActiveWorkspace } from "@/features/workspace/context";
import { useQueryErrorToast } from "@/shared/hooks/use-query-error-toast";

/** Brands (identities) living inside the active workspace. */
export const BrandsView = () => {
  const { activeWorkspace, isPending: workspacePending } = useActiveWorkspace();
  const {
    data: brands,
    isPending,
    error,
  } = useBrands(activeWorkspace?.id ?? null);
  const createBrand = useCreateBrand();
  useQueryErrorToast(error, "Could not load brands");

  return (
    <Box>
      <Group justify="space-between" align="center" my="md">
        <div>
          <Title order={2}>Brands</Title>
          <Text size="sm" c="dimmed">
            {activeWorkspace
              ? `Identities inside ${activeWorkspace.name}`
              : "Select a workspace to see its brands"}
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          loading={createBrand.isPending}
          onClick={() => {
            if (!activeWorkspace) return;
            createBrand.mutate({
              workspaceId: activeWorkspace.id,
              name: "Untitled Brand",
              slug: `brand-${Date.now().toString(36)}`,
              isPrimary: false,
            });
          }}
          disabled={!activeWorkspace}
        >
          New Brand
        </Button>
      </Group>

      {(isPending || workspacePending) && (
        <Text size="sm" c="dimmed">
          Loading brands…
        </Text>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {brands?.map((brand) => (
          <Card
            key={brand.id}
            withBorder
            padding="lg"
            radius="md"
            component={Link}
            href={`/admin/brands/${brand.id}`}
          >
            <Stack gap="xs">
              <Group justify="space-between">
                <Text fw={600} size="lg">
                  {brand.name}
                </Text>
                {brand.isPrimary && <Badge color="gold">primary</Badge>}
              </Group>
              {brand.tagline && (
                <Text size="sm" c="dimmed">
                  {brand.tagline}
                </Text>
              )}
              <Text size="xs" c="dimmed">
                {brand.slug}
              </Text>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      {!isPending && brands?.length === 0 && (
        <Text size="sm" c="dimmed" mt="md">
          No brands yet - create one to start ingesting logo sheets.
        </Text>
      )}
    </Box>
  );
};
