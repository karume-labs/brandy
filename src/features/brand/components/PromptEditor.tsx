"use client";

import {
  Button,
  Modal,
  Select,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { zodResolver } from "mantine-form-zod-resolver";
import type { brandPrompts } from "@/features/brand/schema";
import { useUpsertPrompt } from "@/features/brand/services/query";
import {
  promptContextEnum,
  type UpsertPromptInput,
  upsertPromptSchema,
} from "@/features/brand/validators";

type BrandPrompt = typeof brandPrompts.$inferSelect;

const CONTEXT_OPTIONS = promptContextEnum.options.map((value) => ({
  value,
  label: value.replace("_", " "),
}));

interface PromptEditorProps {
  brandId: string;
  opened: boolean;
  onClose: () => void;
  prompt: BrandPrompt | null;
}

/** Create/edit dialog for a prompt template (admins only). */
export const PromptEditor = ({
  brandId,
  opened,
  onClose,
  prompt,
}: PromptEditorProps) => {
  const upsert = useUpsertPrompt(brandId);
  const form = useForm<UpsertPromptInput>({
    initialValues: {
      brandId,
      id: prompt?.id,
      context: prompt?.context ?? "general",
      name: prompt?.name ?? "",
      body: prompt?.body ?? "",
    },
    validate: zodResolver(upsertPromptSchema),
  });

  const submit = form.onSubmit((values) => {
    upsert.mutate(values, {
      onSuccess: () => {
        notifications.show({
          title: "Prompt saved",
          message: "The template is ready to copy.",
          color: "green",
        });
        if (!prompt) form.reset();
        onClose();
      },
      onError: (error: Error) => {
        notifications.show({
          title: "Could not save prompt",
          message: error.message,
          color: "red",
        });
      },
    });
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={prompt ? "Edit prompt" : "New prompt"}
      size="lg"
    >
      <form onSubmit={submit}>
        <Stack>
          <TextInput
            label="Name"
            placeholder="Logo handoff"
            withAsterisk
            {...form.getInputProps("name")}
          />
          <Select
            label="Context"
            data={CONTEXT_OPTIONS}
            {...form.getInputProps("context")}
          />
          <Textarea
            label="Prompt body"
            placeholder="You are a design assistant. Use the attached logo sheet..."
            minRows={8}
            withAsterisk
            {...form.getInputProps("body")}
          />
          <Button type="submit" loading={upsert.isPending}>
            Save prompt
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};
