"use client";

import { Badge, Group, Stack, Table, Text } from "@mantine/core";
import type { brandColors } from "@/features/brand/schema";
import { auditContrast } from "@/features/brand/services/contrast";

type BrandColor = typeof brandColors.$inferSelect;

interface ColorAuditProps {
  colors: BrandColor[];
}

const LEVEL_COLOR: Record<string, string> = {
  AAA: "green",
  AA: "teal",
  "AA-large": "yellow",
  fail: "red",
};

/**
 * WCAG 2.1 audit: every token tested as text against every other token as a
 * surface. Pairs below AA are flagged so bad combinations never ship.
 */
export const ColorAudit = ({ colors }: ColorAuditProps) => {
  const hexes = colors.map((color) => color.hex);
  const failures = auditContrast(hexes, hexes).filter(
    (pair) => pair.level === "fail",
  );

  if (hexes.length < 2) {
    return (
      <Text size="sm" c="dimmed">
        Add at least two tokens to run the contrast audit.
      </Text>
    );
  }

  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Text fw={600}>WCAG 2.1 contrast audit</Text>
        <Badge color={failures.length === 0 ? "green" : "red"}>
          {failures.length === 0
            ? "all pairs pass"
            : `${failures.length} failing pair(s)`}
        </Badge>
      </Group>

      <Table striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Text</Table.Th>
            <Table.Th>Background</Table.Th>
            <Table.Th>Ratio</Table.Th>
            <Table.Th>Level</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {auditContrast(hexes, hexes)
            .filter((pair) => pair.level === "fail" || pair.level === "AAA")
            .slice(0, 12)
            .map((pair) => (
              <Table.Tr key={`${pair.foreground}-${pair.background}`}>
                <Table.Td>{pair.foreground}</Table.Td>
                <Table.Td>{pair.background}</Table.Td>
                <Table.Td>{pair.ratio.toFixed(2)}:1</Table.Td>
                <Table.Td>
                  <Badge color={LEVEL_COLOR[pair.level] ?? "gray"}>
                    {pair.level}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
};
