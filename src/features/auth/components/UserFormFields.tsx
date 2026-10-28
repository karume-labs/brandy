"use client";

import { PasswordInput, Select, TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { roleOptions } from "@/features/auth/components/role-options";
import { ROLE_PERMISSIONS } from "@/features/auth/roles";
import type { CreateUserInput } from "@/features/auth/validators";

type FormValues = Omit<CreateUserInput, "password"> & { password?: string };

interface UserFormFieldsProps {
  form: UseFormReturnType<FormValues>;
  isEdit: boolean;
}

/** Name, email, password and role inputs for the user modal. */
export const UserFormFields: React.FC<UserFormFieldsProps> = ({
  form,
  isEdit,
}) => (
  <>
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
  </>
);
