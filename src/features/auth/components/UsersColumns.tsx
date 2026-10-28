"use client";

import {
  ActionIcon,
  Avatar,
  Group,
  Menu,
  MenuDropdown,
  MenuItem,
  MenuTarget,
  Select,
  Text,
} from "@mantine/core";
import { IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { ROLE_PERMISSIONS } from "@/features/auth/roles";

export type User = {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  permissions: string[] | null;
  image: string | null;
  createdAt: Date;
};

interface BuildUsersColumnsProps {
  onUpdateRole: (id: string, role: string) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export const buildUsersColumns = ({
  onUpdateRole,
  onEdit,
  onDelete,
}: BuildUsersColumnsProps): ColumnDef<User, unknown>[] => {
  const roleOptions = Object.keys(ROLE_PERMISSIONS).map((role) => ({
    value: role,
    label: role
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
  }));

  return [
    {
      id: "name",
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => (
        <Group gap="sm">
          <Avatar size="sm" src={row.original.image} radius="xl" color="amber">
            {row.original.name?.charAt(0) || row.original.email.charAt(0)}
          </Avatar>
          <Text size="sm" fw={500}>
            {row.original.name || "N/A"}
          </Text>
        </Group>
      ),
    },
    {
      id: "email",
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <Text size="sm">{row.original.email}</Text>,
    },
    {
      id: "role",
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Select
          data={roleOptions}
          value={row.original.role || "user"}
          onChange={(val) => {
            if (val && val !== row.original.role) {
              onUpdateRole(row.original.id, val);
            }
          }}
          size="xs"
        />
      ),
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => (
        <Text size="sm">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </Text>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <Menu position="bottom-end" withinPortal>
          <MenuTarget>
            <ActionIcon
              variant="subtle"
              color="gray"
              aria-label={`Actions for ${row.original.name}`}
            >
              <IconDotsVertical size={16} />
            </ActionIcon>
          </MenuTarget>
          <MenuDropdown>
            <MenuItem
              leftSection={<IconEdit size={14} />}
              onClick={() => onEdit(row.original)}
            >
              Edit
            </MenuItem>
            <MenuItem
              leftSection={<IconTrash size={14} />}
              color="red"
              onClick={() => onDelete(row.original)}
            >
              Delete
            </MenuItem>
          </MenuDropdown>
        </Menu>
      ),
    },
  ];
};
