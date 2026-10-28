"use client";

import { AppShellNavbar, Paper, ScrollArea, Stack, Title } from "@mantine/core";
import {
  IconBuildingWarehouse,
  IconHistory,
  IconLayoutDashboard,
  IconPalette,
  IconPhoto,
  IconUsers,
} from "@tabler/icons-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NavbarLink } from "@/features/admin/components/NavbarLink";

/** Sidebar entries for the admin dashboard. */
const NAV_LINKS = [
  { label: "Dashboard", to: "/dashboard", icon: IconLayoutDashboard },
  { label: "Brands", to: "/dashboard/brands", icon: IconPalette },
  { label: "Assets", to: "/dashboard/assets", icon: IconPhoto },
  {
    label: "Workspaces",
    to: "/dashboard/workspaces",
    icon: IconBuildingWarehouse,
  },
  { label: "Users", to: "/dashboard/users", icon: IconUsers },
  { label: "Audit Log", to: "/dashboard/audit", icon: IconHistory },
];

interface AdminNavbarProps {
  isExpanded: boolean;
  mobileOpened: boolean;
  toggleMobile: () => void;
}

const isActivePath = (pathname: string, to: string): boolean =>
  pathname === to || (to !== "/dashboard" && pathname.startsWith(to));

export const AdminNavbar: React.FC<AdminNavbarProps> = ({
  isExpanded,
  mobileOpened,
  toggleMobile,
}: AdminNavbarProps) => {
  const pathname = usePathname();

  return (
    <AppShellNavbar
      p="md"
      bg="transparent"
      withBorder={false}
      styles={{
        navbar: {
          overflow: "hidden",
          transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        },
      }}
    >
      <Paper
        h="100%"
        withBorder
        radius="md"
        shadow="sm"
        display="flex"
        style={{ flexDirection: "column" }}
        bg="var(--app-surface)"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isExpanded ? "flex-start" : "center",
            width: isExpanded ? "auto" : "44px",
            margin: isExpanded ? "0" : "0 auto",
            padding: isExpanded ? "12px 16px" : "12px 0",
            gap: "8px",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <Image
            src="/logo.png"
            alt="Brandy Logo"
            width={32}
            height={32}
            style={{ flexShrink: 0 }}
          />
          {isExpanded && (
            <Title order={4} c="amber.5" style={{ whiteSpace: "nowrap" }}>
              Brandy
            </Title>
          )}
        </div>

        <ScrollArea flex={1} offsetScrollbars={isExpanded} type="hover" px="xs">
          <Stack gap="xs" py="xs" align={isExpanded ? "stretch" : "center"}>
            {NAV_LINKS.map(({ to, label, icon }) => (
              <NavbarLink
                key={to}
                to={to}
                label={label}
                icon={icon}
                isActive={isActivePath(pathname, to)}
                isExpanded={isExpanded}
                onClick={() => {
                  if (mobileOpened) toggleMobile();
                }}
              />
            ))}
          </Stack>
        </ScrollArea>
      </Paper>
    </AppShellNavbar>
  );
};
