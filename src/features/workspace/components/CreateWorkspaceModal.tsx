"use client";

import { Button, Modal, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { zodResolver } from "mantine-form-zod-resolver";
import { useCreateWorkspace } from "@/features/workspace/services/query";
import {
  type CreateWorkspaceInput,
  createWorkspaceSchema,
} from "@/features/workspace/validators";

interface CreateWorkspaceModalProps {
  opened: boolean;
  onClose: () => void;
}

/** Creates a new cellar; the creator is inserted as its owner. */
export const CreateWorkspaceModal = ({
  opened,
  onClose,
}: CreateWorkspaceModalProps) => {
  const createWorkspace = useCreateWorkspace();
  const form = useForm<CreateWorkspaceInput>({
    initialValues: { name: "", slug: "", parentId: undefined },
    validate: zodResolver(createWorkspaceSchema),
  });

  const submit = form.onSubmit((values) => {
    createWorkspace.mutate(values, {
      onSuccess: () => {
        notifications.show({
          title: "Workspace created",
          message: `${values.name} is ready for brands.`,
          color: "green",
        });
        form.reset();
        onClose();
      },
      onError: (error: Error) => {
        notifications.show({
          title: "Could not create workspace",
          message: error.message,
          color: "red",
        });
      },
    });
  });

  return (
    <Modal opened={opened} onClose={onClose} title="New Workspace">
      <form onSubmit={submit}>
        <Stack>
          <TextInput
            label="Name"
            placeholder="NerveTech Systems"
            withAsterisk
            {...form.getInputProps("name")}
          />
          <TextInput
            label="Slug"
            placeholder="nervetech-systems"
            withAsterisk
            {...form.getInputProps("slug")}
          />
          <Button type="submit" loading={createWorkspace.isPending}>
            Create Workspace
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};
