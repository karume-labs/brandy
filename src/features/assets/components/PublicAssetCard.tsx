"use client";

import {
  Button,
  Card,
  Center,
  Image,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconDownload, IconFile } from "@tabler/icons-react";
import { formatFileSize } from "@/features/assets/format";
import { assetFileUrl } from "@/features/assets/services/query";

interface PublicAssetCardProps {
  item: {
    id: string;
    name: string;
    category: string | null;
    mimeType: string;
    fileSize: number;
    createdAt: Date;
  };
}

/** One asset card in the public library grid. */
export const PublicAssetCard: React.FC<PublicAssetCardProps> = ({ item }) => {
  const fileUrl = assetFileUrl(item.id);
  const isImage = item.mimeType.startsWith("image/");

  return (
    <Card padding="sm" shadow="sm" withBorder radius="md" h="100%">
      <Card.Section>
        {isImage ? (
          <Image
            src={fileUrl}
            alt={item.name}
            h={160}
            fit="contain"
            bg="var(--mantine-color-body)"
          />
        ) : (
          <Center h={160} bg="var(--mantine-color-default-hover)">
            <ThemeIcon size={56} radius="md" variant="light" color="amber">
              <IconFile size={30} stroke={1.5} />
            </ThemeIcon>
          </Center>
        )}
      </Card.Section>

      <Stack gap={4} mt="sm" style={{ flex: 1 }}>
        <Text fw={600} size="sm" truncate>
          {item.name}
        </Text>
        {item.category && (
          <Text size="xs" c="dimmed">
            {item.category} · {formatFileSize(item.fileSize)} ·{" "}
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        )}
        <Button
          component="a"
          href={fileUrl}
          download={item.name}
          leftSection={<IconDownload size={16} />}
          variant="light"
          fullWidth
          mt="xs"
        >
          Download
        </Button>
      </Stack>
    </Card>
  );
};
