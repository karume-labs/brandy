"use client";

import { Button, Group, Stack, Text, Title } from "@mantine/core";
import { useState } from "react";
import { PromptCard } from "@/features/brand/components/PromptCard";
import { PromptEditor } from "@/features/brand/components/PromptEditor";
import type { brandPrompts } from "@/features/brand/schema";

type BrandPrompt = typeof brandPrompts.$inferSelect;

interface BrandPromptsPanelProps {
  brandId: string;
  prompts: BrandPrompt[];
}

/**
 * Admin-configurable LLM handoff prompts: copy to the clipboard, create and
 * edit templates in place.
 */
export const BrandPromptsPanel = ({
  brandId,
  prompts,
}: BrandPromptsPanelProps) => {
  const [editing, setEditing] = useState<BrandPrompt | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const openNew = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (prompt: BrandPrompt) => {
    setEditing(prompt);
    setEditorOpen(true);
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <div>
          <Title order={4}>LLM handoff prompts</Title>
          <Text size="sm" c="dimmed">
            Copy-paste templates for handing logos and guides to an LLM.
          </Text>
        </div>
        <Button onClick={openNew}>New prompt</Button>
      </Group>

      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          brandId={brandId}
          prompt={prompt}
          onEdit={openEdit}
        />
      ))}

      {prompts.length === 0 && (
        <Text size="sm" c="dimmed">
          No prompts yet - add one for logo sheets, brand guides or general use.
        </Text>
      )}

      <PromptEditor
        brandId={brandId}
        opened={editorOpen}
        onClose={() => setEditorOpen(false)}
        prompt={editing}
      />
    </Stack>
  );
};
