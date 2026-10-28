"use client";

import {
  Avatar,
  Group,
  Menu,
  MenuDivider,
  MenuDropdown,
  MenuItem,
  MenuLabel,
  MenuTarget,
  Skeleton,
  Switch,
  Text,
  UnstyledButton,
} from "@mantine/core";
import {
  IconChevronDown,
  IconLogout,
  IconMoonStars,
  IconSun,
} from "@tabler/icons-react";

interface HeaderUserMenuProps {
  user: { name?: string | null; email?: string | null } | undefined;
  isDark: boolean;
  isSigningOut: boolean;
  onToggleColorScheme: () => void;
  onSignOut: () => void;
}

/** Avatar menu: identity, theme toggle, sign out. */
export const HeaderUserMenu: React.FC<HeaderUserMenuProps> = ({
  user,
  isDark,
  isSigningOut,
  onToggleColorScheme,
  onSignOut,
}) => {
  if (!user) {
    return (
      <Group gap="xs" wrap="nowrap" px="sm">
        <Skeleton height={30} circle />
        <Skeleton height={20} width={80} radius="xl" />
      </Group>
    );
  }

  const displayName = user.name || user.email || "";
  const initials = displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <Menu shadow="md" width={260} position="bottom-end" withinPortal>
      <MenuTarget>
        <UnstyledButton
          className="admin-user-trigger"
          aria-label="Account menu"
        >
          <Group gap="xs" wrap="nowrap">
            <Avatar size={30} radius="xl" color="amber">
              {initials}
            </Avatar>
            <Text size="sm" fw={600} truncate maw={140}>
              {displayName}
            </Text>
            <IconChevronDown size={14} stroke={1.75} />
          </Group>
        </UnstyledButton>
      </MenuTarget>
      <MenuDropdown>
        <MenuLabel>Signed in as</MenuLabel>
        <Text
          px="xs"
          py="xs"
          size="sm"
          styles={{ root: { overflowWrap: "anywhere" } }}
        >
          {user.email}
        </Text>
        <MenuDivider />
        <MenuItem
          rightSection={
            <Switch
              checked={isDark}
              onChange={() => {}}
              size="md"
              color="dark.4"
              onLabel={<IconSun size={14} stroke={2.5} />}
              offLabel={<IconMoonStars size={14} stroke={2.5} />}
              styles={{ root: { pointerEvents: "none" } }}
            />
          }
          onClick={onToggleColorScheme}
          closeMenuOnClick={false}
        >
          Theme
        </MenuItem>
        <MenuDivider />
        <MenuItem
          c="dimmed"
          leftSection={<IconLogout size={16} />}
          onClick={onSignOut}
          disabled={isSigningOut}
        >
          Sign out
        </MenuItem>
      </MenuDropdown>
    </Menu>
  );
};
