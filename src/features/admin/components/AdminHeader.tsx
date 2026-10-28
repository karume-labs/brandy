"use client";

import { ActionIcon, Burger, Group, Paper, Tooltip } from "@mantine/core";
import { IconLayoutSidebar } from "@tabler/icons-react";
import { HeaderUserMenu } from "@/features/admin/components/HeaderUserMenu";
import { WorkspaceSwitcher } from "@/features/workspace/components/WorkspaceSwitcher";

interface AdminHeaderProps {
  user: { name?: string | null; email?: string | null } | undefined;
  isExpanded: boolean;
  isDark: boolean;
  isSigningOut: boolean;
  mobileOpened: boolean;
  onToggleSidebar: () => void;
  onToggleMobile: () => void;
  onToggleColorScheme: () => void;
  onSignOut: () => void;
}

/** Floating app header: sidebar toggle, account menu, theme + sign-out. */
export const AdminHeader: React.FC<AdminHeaderProps> = ({
  user,
  isExpanded,
  isDark,
  isSigningOut,
  mobileOpened,
  onToggleSidebar,
  onToggleMobile,
  onToggleColorScheme,
  onSignOut,
}) => (
  <Paper h="100%" px="md" withBorder radius="md" shadow="sm">
    <Group h="100%" justify="space-between">
      <Group>
        <Burger
          opened={mobileOpened}
          onClick={onToggleMobile}
          hiddenFrom="md"
          size="sm"
        />
        <Tooltip
          label={isExpanded ? "Close sidebar" : "Open sidebar"}
          withArrow
          position="bottom"
        >
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            onClick={onToggleSidebar}
            visibleFrom="md"
            aria-label="Toggle sidebar"
          >
            <IconLayoutSidebar size={22} stroke={1.5} />
          </ActionIcon>
        </Tooltip>
        <WorkspaceSwitcher />
      </Group>

      <Group gap="xs">
        <HeaderUserMenu
          user={user}
          isDark={isDark}
          isSigningOut={isSigningOut}
          onToggleColorScheme={onToggleColorScheme}
          onSignOut={onSignOut}
        />
      </Group>
    </Group>
  </Paper>
);
