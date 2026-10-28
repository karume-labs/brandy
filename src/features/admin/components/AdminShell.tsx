"use client";

import {
  ActionIcon,
  AppShell,
  AppShellHeader,
  AppShellMain,
  Avatar,
  Burger,
  Group,
  Menu,
  MenuDivider,
  MenuDropdown,
  MenuItem,
  MenuLabel,
  MenuTarget,
  Paper,
  Skeleton,
  Switch,
  Text,
  Tooltip,
  UnstyledButton,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import {
  IconChevronDown,
  IconLayoutSidebar,
  IconLogout,
  IconMoonStars,
  IconSun,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminNavbar } from "@/features/admin/components/AdminNavbar";
import { authClient } from "@/features/auth/client";
import { IdleTimeoutModal } from "@/features/auth/components/IdleTimeoutModal";
import { notify } from "@/shared/lib/notifications";

const HEADER_HEIGHT = 76;
const SIDEBAR_WIDTH_EXPANDED = 260;
const SIDEBAR_WIDTH_COLLAPSED = 96;
const SIDEBAR_STORAGE_KEY = "brandy-sidebar-expanded";

interface AdminShellProps {
  children: React.ReactNode;
}

export const AdminShell: React.FC<AdminShellProps> = ({ children }) => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(false);
  const [isExpanded, setIsExpanded] = useLocalStorage({
    key: SIDEBAR_STORAGE_KEY,
    defaultValue: true,
  });

  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { setColorScheme } = useMantineColorScheme();
  const colorScheme = useComputedColorScheme("light");

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [session, isPending, router]);

  const user = session?.user;
  const displayName = user?.name || user?.email || "";
  const initials = displayName
    ? displayName.trim().charAt(0).toUpperCase()
    : "?";
  const isDark = colorScheme === "dark";

  const toggleColorScheme = () => {
    setColorScheme(isDark ? "light" : "dark");
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      router.push("/sign-in");
      router.refresh();
    } catch (error: unknown) {
      notify.error(
        "Sign out failed",
        error instanceof Error ? error.message : "Please try again.",
      );
      setIsSigningOut(false);
    }
  };

  return (
    <AppShell
      layout="alt"
      header={{ height: HEADER_HEIGHT }}
      navbar={{
        width: isExpanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED,
        breakpoint: "md",
        collapsed: { mobile: !mobileOpened },
      }}
      padding="md"
    >
      <AppShellHeader withBorder={false} px="md" pt="md" bg="transparent">
        <Paper h="100%" px="md" withBorder radius="md" shadow="sm">
          <Group h="100%" justify="space-between">
            <Group>
              <Burger
                opened={mobileOpened}
                onClick={toggleMobile}
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
                  onClick={() => setIsExpanded((o) => !o)}
                  visibleFrom="md"
                  aria-label="Toggle sidebar"
                >
                  <IconLayoutSidebar size={22} stroke={1.5} />
                </ActionIcon>
              </Tooltip>
            </Group>

            <Group gap="xs">
              {user ? (
                <Menu
                  shadow="md"
                  width={260}
                  position="bottom-end"
                  withinPortal
                >
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
                      onClick={toggleColorScheme}
                      closeMenuOnClick={false}
                    >
                      Theme
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem
                      c="dimmed"
                      leftSection={<IconLogout size={16} />}
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                    >
                      Sign out
                    </MenuItem>
                  </MenuDropdown>
                </Menu>
              ) : (
                <Group gap="xs" wrap="nowrap" px="sm">
                  <Skeleton height={30} circle />
                  <Skeleton height={20} width={80} radius="xl" />
                </Group>
              )}
            </Group>
          </Group>
        </Paper>
      </AppShellHeader>

      <AdminNavbar
        isExpanded={isExpanded}
        mobileOpened={mobileOpened}
        toggleMobile={toggleMobile}
      />

      <AppShellMain>{children}</AppShellMain>

      {session && <IdleTimeoutModal />}
    </AppShell>
  );
};
