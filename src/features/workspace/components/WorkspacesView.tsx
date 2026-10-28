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
import { useDisclosure } from "@mantine/hooks";
import { IconBuildingWarehouse, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { CreateWorkspaceModal } from "@/features/workspace/components/CreateWorkspaceModal";
import { useActiveWorkspace } from "@/features/workspace/context";

const ROLE_COLOR: Record<string, string> = {
  owner: "gold",
  admin: "blue",
  member: "gray",
};

/** The multi-tenant registry: every cellar the session user can enter. */
export const WorkspacesView = () => {
  const { workspaces, isPending, setActiveWorkspaceId } = useActiveWorkspace();
  const [createOpen, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);

  return (
    <Box>
      <Group justify="space-between" align="center" my="md">
        <div>
          <Title order={2}>Workspaces</Title>
          <Text size="sm" c="dimmed">
            Isolated cellars - each holds its own brands and assets.
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
          New Workspace
        </Button>
      </Group>

      <CreateWorkspaceModal opened={createOpen} onClose={closeCreate} />

      {isPending && (
        <Text size="sm" c="dimmed">
          Loading workspaces…
        </Text>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {workspaces.map((workspace) => (
          <Card
            key={workspace.id}
            withBorder
            padding="lg"
            radius="md"
            component={Link}
            href="/dashboard/brands"
            onClick={() => setActiveWorkspaceId(workspace.id)}
          >
            <Stack gap="xs">
              <Group justify="space-between">
                <IconBuildingWarehouse
                  size={22}
                  color="var(--mantine-color-amber-6)"
                />
                <Badge color={ROLE_COLOR[workspace.myRole] ?? "gray"}>
                  {workspace.myRole}
                </Badge>
              </Group>
              <Text fw={600} size="lg">
                {workspace.name}
              </Text>
              <Text size="sm" c="dimmed">
                {workspace.slug}
                {workspace.parentId ? " · subsidiary" : " · anchor"}
              </Text>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      {!isPending && workspaces.length === 0 && (
        <Text size="sm" c="dimmed" mt="md">
          No workspaces yet - create the first cellar to hold a brand.
        </Text>
      )}
    </Box>
  );
};
