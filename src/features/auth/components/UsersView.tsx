"use client";

import { Box, Button, Group, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconPlus } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { UserDeleteModal } from "@/features/auth/components/UserDeleteModal";
import { UserFormModal } from "@/features/auth/components/UserFormModal";
import type { User } from "@/features/auth/components/UsersColumns";
import { buildUsersColumns } from "@/features/auth/components/UsersColumns";
import { DataTable } from "@/shared/components/table/DataTable";
import { useQueryErrorToast } from "@/shared/hooks/use-query-error-toast";
import { orpcQuery } from "@/shared/lib/orpc-client";

export const UsersView = () => {
  const [createOpen, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const queryClient = useQueryClient();
  const {
    data: users,
    isLoading,
    error,
  } = useQuery(orpcQuery.users.list.queryOptions());

  useQueryErrorToast(error, "Could not load users");

  const { mutate: updateRole } = useMutation({
    ...orpcQuery.users.updateRole.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["users", "list"]] });
      notifications.show({
        title: "Success",
        message: "User role updated successfully",
        color: "green",
      });
    },
    onError: (err: Error) => {
      notifications.show({
        title: "Error",
        message: err.message,
        color: "red",
      });
    },
  });

  const columns = buildUsersColumns({
    onUpdateRole: (id, role) => updateRole({ id, role }),
    onEdit: setEditingUser,
    onDelete: setDeletingUser,
  });

  return (
    <Box>
      <Group justify="space-between" align="center" my="md">
        <Title order={2}>Users Management</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
          Add User
        </Button>
      </Group>

      {createOpen && <UserFormModal onClose={closeCreate} />}
      {editingUser && (
        <UserFormModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}
      {deletingUser && (
        <UserDeleteModal
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
        />
      )}

      <DataTable
        columns={columns}
        data={users || []}
        totalRecords={users?.length || 0}
        page={1}
        pageSize={Math.max(users?.length || 10, 10)}
        onPageChange={() => {}}
        loading={isLoading}
      />
    </Box>
  );
};
