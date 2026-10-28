"use client";

import {
  ActionIcon,
  Box,
  Button,
  ColorInput,
  Group,
  Paper,
  Select,
  Table,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconTrash } from "@tabler/icons-react";
import { zodResolver } from "mantine-form-zod-resolver";
import type { brandColors } from "@/features/brand/schema";
import {
  useRemoveColor,
  useUpsertColor,
} from "@/features/brand/services/query";
import {
  colorRoleEnum,
  type UpsertColorInput,
  upsertColorSchema,
} from "@/features/brand/validators";

type BrandColor = typeof brandColors.$inferSelect;

interface ColorTokenTableProps {
  brandId: string;
  colors: BrandColor[];
}

const ROLE_OPTIONS = colorRoleEnum.options.map((value) => ({
  value,
  label: value,
}));

/** Token table with inline removal plus the add-token form. */
export const ColorTokenTable = ({ brandId, colors }: ColorTokenTableProps) => {
  const upsert = useUpsertColor(brandId);
  const remove = useRemoveColor(brandId);

  const form = useForm<UpsertColorInput>({
    initialValues: {
      brandId,
      name: "",
      hex: "#0E726D",
      role: "primary",
    },
    validate: zodResolver(upsertColorSchema),
  });

  const submit = form.onSubmit((values) => {
    upsert.mutate(values, {
      onSuccess: () => form.reset(),
    });
  });

  return (
    <Paper withBorder p="md" radius="md">
      <Text fw={600} mb="xs">
        Color tokens
      </Text>
      <Table striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Token</Table.Th>
            <Table.Th>Hex</Table.Th>
            <Table.Th>Role</Table.Th>
            <Table.Th>Source</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {colors.map((color) => (
            <Table.Tr key={color.id}>
              <Table.Td>{color.name}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Box
                    w={16}
                    h={16}
                    style={{
                      backgroundColor: color.hex,
                      border: "1px solid",
                      borderRadius: 4,
                    }}
                  />
                  {color.hex}
                </Group>
              </Table.Td>
              <Table.Td>{color.role}</Table.Td>
              <Table.Td>{color.source}</Table.Td>
              <Table.Td>
                <Tooltip label="Remove token">
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => remove.mutate({ id: color.id })}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Box mt="md">
        <form onSubmit={submit}>
          <Group align="flex-end" grow>
            <ColorInput
              label="Hex"
              format="hex"
              {...form.getInputProps("hex")}
            />
            <TextInput
              label="Token name"
              placeholder="nerve-teal"
              {...form.getInputProps("name")}
            />
            <Select
              label="Role"
              data={ROLE_OPTIONS}
              {...form.getInputProps("role")}
            />
            <Button type="submit" loading={upsert.isPending}>
              Add token
            </Button>
          </Group>
        </form>
      </Box>
    </Paper>
  );
};
