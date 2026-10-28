"use client";

import {
  Badge,
  Group,
  Menu,
  MenuDivider,
  MenuDropdown,
  MenuItem,
  MenuLabel,
  MenuTarget,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { IconBuilding, IconCheck, IconChevronDown } from "@tabler/icons-react";
import Link from "next/link";
import { useActiveWorkspace } from "@/features/workspace/context";

/** Header control to hop between cellars (anchor + subsidiaries). */
export const WorkspaceSwitcher = () => {
  const { workspaces, activeWorkspace, setActiveWorkspaceId, isPending } =
    useActiveWorkspace();

  if (isPending || !activeWorkspace) return null;

  return (
    <Menu shadow="md" width={280} position="bottom-start" withinPortal>
      <MenuTarget>
        <UnstyledButton
          className="admin-user-trigger"
          aria-label="Switch workspace"
        >
          <Group gap="xs" wrap="nowrap">
            <IconBuilding size={18} stroke={1.5} />
            <div style={{ textAlign: "left" }}>
              <Text size="xs" c="dimmed" lh={1.1}>
                Workspace
              </Text>
              <Text size="sm" fw={600} truncate maw={160}>
                {activeWorkspace.name}
              </Text>
            </div>
            <IconChevronDown size={14} stroke={1.75} />
          </Group>
        </UnstyledButton>
      </MenuTarget>
      <MenuDropdown>
        <MenuLabel>Switch workspace</MenuLabel>
        {workspaces.map((workspace) => {
          const isActive = workspace.id === activeWorkspace.id;
          return (
            <MenuItem
              key={workspace.id}
              leftSection={<IconBuilding size={16} />}
              onClick={() => setActiveWorkspaceId(workspace.id)}
              rightSection={
                isActive ? (
                  <IconCheck size={16} />
                ) : workspace.parentId ? (
                  <Badge size="xs" variant="light" color="oak">
                    Sub
                  </Badge>
                ) : (
                  <Badge size="xs" variant="light" color="amber">
                    Anchor
                  </Badge>
                )
              }
            >
              {workspace.name}
            </MenuItem>
          );
        })}
        <MenuDivider />
        <MenuItem component={Link} href="/dashboard/workspaces">
          Manage workspaces
        </MenuItem>
      </MenuDropdown>
    </Menu>
  );
};
