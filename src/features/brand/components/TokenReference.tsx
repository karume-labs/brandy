"use client";

import { Box, Group, Paper, Stack, Text } from "@mantine/core";
import type { brandGradients, brandTypography } from "@/features/brand/schema";

type BrandGradient = typeof brandGradients.$inferSelect;
type BrandTypography = typeof brandTypography.$inferSelect;

interface TokenReferenceProps {
  gradients: BrandGradient[];
  typography: BrandTypography[];
}

/** Read-only typography governance + gradient tokens for the brand sheet. */
export const TokenReference = ({
  gradients,
  typography,
}: TokenReferenceProps) => (
  <>
    <Paper withBorder p="md" radius="md">
      <Text fw={600} mb="xs">
        Typography
      </Text>
      {typography.length === 0 ? (
        <Text size="sm" c="dimmed">
          No typography rules locked in yet.
        </Text>
      ) : (
        <Stack gap={4}>
          {typography.map((rule) => (
            <Text key={rule.id} size="sm">
              <b>{rule.role}</b> — {rule.fontFamily}, weight {rule.fontWeight},
              tracking {rule.tracking}em, line-height {rule.lineHeight}
              {rule.isLocked ? " (locked)" : ""}
            </Text>
          ))}
        </Stack>
      )}
    </Paper>

    <Paper withBorder p="md" radius="md">
      <Text fw={600} mb="xs">
        Gradients
      </Text>
      {gradients.length === 0 ? (
        <Text size="sm" c="dimmed">
          No gradients registered.
        </Text>
      ) : (
        <Stack gap={4}>
          {gradients.map((gradient) => (
            <Group key={gradient.id} gap="xs">
              <Box
                w={40}
                h={20}
                style={{
                  background: `linear-gradient(${gradient.angle}deg, ${gradient.fromHex}, ${gradient.toHex})`,
                  border: "1px solid",
                  borderRadius: 4,
                }}
              />
              <Text size="sm">
                {gradient.name}: {gradient.fromHex} → {gradient.toHex}
              </Text>
            </Group>
          ))}
        </Stack>
      )}
    </Paper>
  </>
);
