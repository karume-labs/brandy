"use client";

import {
  Button,
  Group,
  Modal,
  MultiSelect,
  type MultiSelectProps,
  PasswordInput,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "mantine-form-zod-resolver";
import type { User } from "@/features/auth/components/UsersColumns";
import { PERMISSIONS, ROLE_PERMISSIONS } from "@/features/auth/roles";
import {
  type CreateUserInput,
  createUserSchema,
  type UpdateUserInput,
  updateUserSchema,
} from "@/features/auth/validators";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { notify } from "@/shared/lib/notifications";
import { orpcQuery } from "@/shared/lib/orpc-client";

/** Form values are a union of create/update — password is always present (optional on edit). */
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
    // On create, password is required; on edit it is optional (leave blank = keep).
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

  const roleOptions = Object.keys(ROLE_PERMISSIONS).map((role) => ({
    value: role,
    label: role
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
  }));

  const permissionOptions = PERMISSIONS.map((p) => ({
    value: p.value,
    label: p.label,
  }));

  const renderMultiSelectOption: MultiSelectProps["renderOption"] = ({
    option,
  }) => {
    const description = PERMISSIONS.find(
      (p) => p.value === option.value,
    )?.description;
    return (
      <Group flex={1} gap="xs">
        <div>
          <Text size="sm">{option.label}</Text>
          {description && (
            <Text size="xs" opacity={0.5}>
              {description}
            </Text>
          )}
        </div>
      </Group>
    );
  };

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
          <TextInput
            label="Name"
            placeholder="John Doe"
            required
            data-autofocus
            {...form.getInputProps("name")}
          />
          <TextInput
            label="Email"
            placeholder="john@example.com"
            required
            {...form.getInputProps("email")}
          />
          <PasswordInput
            label="Password"
            placeholder={isEdit ? "Leave blank to keep unchanged" : "••••••••"}
            required={!isEdit}
            {...form.getInputProps("password")}
          />
          <Select
            label="Role"
            description="Changing the role will reset custom permissions to defaults."
            data={roleOptions}
            required
            {...form.getInputProps("role")}
            onChange={(val) => {
              const role = val as string;
              form.setFieldValue("role", role);
              form.setFieldValue("permissions", ROLE_PERMISSIONS[role] || []);
            }}
          />
          <MultiSelect
            label="Permissions"
            description="Specific permissions granted to this user. Defaults are based on the selected role."
            data={permissionOptions}
            placeholder={
              form.values.permissions?.length
                ? "Search permissions..."
                : "No permissions selected"
            }
            nothingFoundMessage="No permissions available"
            renderOption={renderMultiSelectOption}
            searchable
            clearable
            {...form.getInputProps("permissions")}
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
