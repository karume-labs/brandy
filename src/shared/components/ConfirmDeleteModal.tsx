"use client";

import { Button, Group, Modal, Stack, Text, Title } from "@mantine/core";
import { BrandLogo } from "@/shared/components/BrandLogo";

export interface ConfirmDeleteModalProps {
  title: string;
  /** The bold entity name inside the confirmation sentence. */
  label: string;
  /** Extra copy between the label and the trailing warning. */
  children?: React.ReactNode;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Shared delete-confirmation shell. Owns the layout - feature wrappers own
 * their mutation + toasts.
 */
export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  title,
  label,
  children,
  isDeleting,
  onConfirm,
  onClose,
}: ConfirmDeleteModalProps) => (
  <Modal opened onClose={onClose} centered size="sm">
    <Stack gap="sm" align="center" mb="lg">
      <BrandLogo size={56} />
      <Title order={3} ta="center">
        {title}
      </Title>
    </Stack>
    <Stack>
      <Text size="sm">
        Are you sure you want to delete{" "}
        <Text span fw={700}>
          “{label}”
        </Text>
        ?{children} This action cannot be undone.
      </Text>
      <Group justify="flex-end">
        <Button type="button" variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          color="red"
          loading={isDeleting}
          onClick={onConfirm}
        >
          Delete
        </Button>
      </Group>
    </Stack>
  </Modal>
);
