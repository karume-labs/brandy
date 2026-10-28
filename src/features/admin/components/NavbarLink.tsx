"use client";

import { NavLink, Tooltip } from "@mantine/core";
import type { TablerIcon } from "@tabler/icons-react";
import Link from "next/link";

interface NavbarLinkProps {
  to: string;
  label: string;
  icon: TablerIcon;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
}

/** One sidebar entry; collapsed rail swaps the label for a tooltip. */
export const NavbarLink: React.FC<NavbarLinkProps> = ({
  to,
  label,
  icon: Icon,
  isActive,
  isExpanded,
  onClick,
}) => {
  const link = (
    <NavLink
      component={Link}
      href={to}
      label={isExpanded ? label : null}
      // Collapsed rail hides the text label - keep an accessible name for
      // screen readers regardless of rail state (a11y).
      aria-label={label}
      leftSection={<Icon size={20} />}
      active={isActive}
      onClick={onClick}
      fw={600}
      className="admin-nav-link"
      color="amber.3"
      variant="light"
      mod={{ "data-expanded": isExpanded }}
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

  if (isExpanded) return link;

  return (
    <Tooltip
      label={label}
      position="right"
      withArrow
      offset={15}
      events={{ hover: true, focus: true, touch: false }}
    >
      {link}
    </Tooltip>
  );
};
