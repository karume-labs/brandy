"use client";

import { Button, Group, Modal, Stack, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "mantine-form-zod-resolver";
import { UserFormFields } from "@/features/auth/components/UserFormFields";
import { UserPermissionsField } from "@/features/auth/components/UserPermissionsField";
import type { User } from "@/features/auth/components/UsersColumns";
import { ROLE_PERMISSIONS } from "@/features/auth/roles";
import {
  type CreateUserInput,
  createUserSchema,
  type UpdateUserInput,
  updateUserSchema,
} from "@/features/auth/validators";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { notify } from "@/shared/lib/notifications";
import { orpcQuery } from "@/shared/lib/orpc-client";

/** Form values are a union of create/update — password optional on edit. */
type FormValues = Omit<CreateUserInput, "password"> & { password?: string };

interface UserFormModalProps {
  user?: User | null;
  onClose: () => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  user,
  onClose,
}) => {
  const isEdit = !!user;

  const form = useForm<FormValues>({
    initialValues: {
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      role: user?.role || "user",
      permissions:
        user?.permissions || ROLE_PERMISSIONS[user?.role || "user"] || [],
    },
    // On create, password is required; on edit it is optional (blank = keep).
    validate: zodResolver(isEdit ? updateUserSchema : createUserSchema),
  });

  const queryClient = useQueryClient();
  const { mutateAsync: createUser, isPending: isCreating } = useMutation({
    ...orpcQuery.users.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["users", "list"]] });
    },
  });

  const { mutateAsync: updateUser, isPending: isUpdating } = useMutation({
    ...orpcQuery.users.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["users", "list"]] });
    },
  });

  const isPending = isCreating || isUpdating;

  const handleSubmit = async (values: FormValues) => {
    try {
      if (isEdit && user) {
        await updateUser({ ...(values as UpdateUserInput), id: user.id });
        notify.success("User updated", `“${values.name}” has been saved.`);
      } else {
        await createUser(values as CreateUserInput);
        notify.success("User created", `“${values.name}” has been added.`);
      }
      onClose();
    } catch (err) {
      notify.error(
        "Action failed",
        err instanceof Error ? err.message : "An error occurred",
      );
    }
  };

  return (
    <Modal opened onClose={onClose} size="md">
      <form noValidate onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm" align="center" mb="lg">
          <BrandLogo size={56} />
          <Title order={3} ta="center">
            {isEdit ? "Edit User" : "Add User"}
          </Title>
        </Stack>
        <Stack gap="md">
          <UserFormFields form={form} isEdit={isEdit} />
          <UserPermissionsField
            value={form.values.permissions ?? []}
            onChange={(value) => form.setFieldValue("permissions", value)}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              {isEdit ? "Save Changes" : "Save User"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
