"use client";

import { ActionIcon, Badge, Group, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCopy, IconPencil, IconTrash } from "@tabler/icons-react";
import type { brandPrompts, PromptContext } from "@/features/brand/schema";
import { useRemovePrompt } from "@/features/brand/services/query";

type BrandPrompt = typeof brandPrompts.$inferSelect;

export const PROMPT_CONTEXT_COLOR: Record<PromptContext, string> = {
  logo_sheet: "blue",
  brand_guide: "grape",
  general: "gray",
};

interface PromptCardProps {
  brandId: string;
  prompt: BrandPrompt;
  onEdit: (prompt: BrandPrompt) => void;
}

/** One template: context badge, copy-to-clipboard, admin edit/delete. */
export const PromptCard = ({ brandId, prompt, onEdit }: PromptCardProps) => {
  const remove = useRemovePrompt(brandId);

  const copy = async () => {
    await navigator.clipboard.writeText(prompt.body);
    notifications.show({
      title: "Copied",
      message: `"${prompt.name}" is on your clipboard.`,
      color: "green",
    });
  };

  return (
    <Stack
      gap={4}
      p="sm"
      style={{
        border: "1px solid var(--mantine-color-default-border)",
        borderRadius: 8,
      }}
    >
      <Group justify="space-between">
        <Group gap="xs">
          <Badge size="sm" color={PROMPT_CONTEXT_COLOR[prompt.context]}>
            {prompt.context.replace("_", " ")}
          </Badge>
          <Text fw={600} size="sm">
            {prompt.name}
          </Text>
        </Group>
        <Group gap={4}>
          <ActionIcon
            variant="subtle"
            onClick={() => void copy()}
            title="Copy prompt"
          >
            <IconCopy size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            onClick={() => onEdit(prompt)}
            title="Edit prompt"
          >
            <IconPencil size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => remove.mutate({ id: prompt.id })}
            title="Delete prompt"
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Group>
      <Text
        size="xs"
        c="dimmed"
        lineClamp={3}
        style={{ whiteSpace: "pre-wrap" }}
      >
        {prompt.body}
      </Text>
    </Stack>
  );
};
