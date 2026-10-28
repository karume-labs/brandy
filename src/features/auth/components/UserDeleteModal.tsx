"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@/features/auth/components/UsersColumns";
import { ConfirmDeleteModal } from "@/shared/components/ConfirmDeleteModal";
import { notify } from "@/shared/lib/notifications";
import { orpcQuery } from "@/shared/lib/orpc-client";

interface UserDeleteModalProps {
  user: User;
  onClose: () => void;
}

export const UserDeleteModal: React.FC<UserDeleteModalProps> = ({
  user,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const deleteUser = useMutation({
    ...orpcQuery.users.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["users", "list"]] });
    },
  });

  const handleDelete = async () => {
    try {
      await deleteUser.mutateAsync({ id: user.id });
      notify.success(
        "User deleted",
        `“${user.name || user.email}” has been removed.`,
      );
      onClose();
    } catch (e) {
      notify.error(
        "Could not delete user",
        e instanceof Error ? e.message : undefined,
      );
    }
  };

  return (
    <ConfirmDeleteModal
      title="Delete user"
      label={user.name || user.email}
      isDeleting={deleteUser.isPending}
      onConfirm={handleDelete}
      onClose={onClose}
    >
      {" "}
      This will permanently remove the user account and end all of their active
      sessions.
    </ConfirmDeleteModal>
  );
};
