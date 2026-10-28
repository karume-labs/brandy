"use client";

import {
  AppShellNavbar,
  NavLink,
  Paper,
  ScrollArea,
  Stack,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconHistory,
  IconLayoutDashboard,
  IconUsers,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** Sidebar entries for the admin dashboard. */
const NAV_LINKS = [
  { label: "Dashboard", to: "/dashboard", icon: IconLayoutDashboard },
  { label: "Users", to: "/dashboard/users", icon: IconUsers },
  { label: "Audit Log", to: "/dashboard/audit", icon: IconHistory },
];

interface AdminNavbarProps {
  isExpanded: boolean;
  mobileOpened: boolean;
  toggleMobile: () => void;
}

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
            {NAV_LINKS.map(({ to, label, icon: Icon }) => {
              const isActive =
                pathname === to ||
                (to !== "/dashboard" && pathname.startsWith(to));

              const navLinkItem = (
                <NavLink
                  key={to}
                  component={Link}
                  href={to}
                  label={isExpanded ? label : null}
                  // Collapsed rail hides the text label - keep an accessible
                  // name for screen readers regardless of rail state (a11y).
                  aria-label={label}
                  leftSection={<Icon size={20} />}
                  active={isActive}
                  onClick={() => {
                    if (mobileOpened) toggleMobile();
                  }}
                  fw={600}
                  className="admin-nav-link"
                  color="amber.3"
                  variant="light"
                  mod={{
                    "data-expanded": isExpanded,
                  }}
                  styles={{
                    root: {
                      borderRadius: "8px",
                      height: "44px",
                      width: isExpanded ? "auto" : "44px",
                      margin: isExpanded ? "0" : "0 auto",
                      justifyContent: isExpanded ? "flex-start" : "center",
                      padding: isExpanded ? "0 12px" : "0 !important",
                      border: isExpanded ? undefined : "none",
                      transition: "all 0.15s ease",
                    },
                    section: {
                      margin: isExpanded ? "0 12px 0 0" : "0 !important",
                    },
                    body: {
                      display: isExpanded ? "block" : "none",
                    },
                  }}
                />
              );

              return isExpanded ? (
                navLinkItem
              ) : (
                <Tooltip
                  key={to}
                  label={label}
                  position="right"
                  withArrow
                  offset={15}
                  events={{ hover: true, focus: true, touch: false }}
                >
                  {navLinkItem}
                </Tooltip>
              );
            })}
          </Stack>
        </ScrollArea>
      </Paper>
    </AppShellNavbar>
  );
};
