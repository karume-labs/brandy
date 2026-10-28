"use client";

import { Group, MultiSelect, type MultiSelectProps, Text } from "@mantine/core";
import { PERMISSIONS } from "@/features/auth/roles";

export const permissionOptions = PERMISSIONS.map((p) => ({
  value: p.value,
  label: p.label,
}));

const renderOption: MultiSelectProps["renderOption"] = ({ option }) => {
  const description = PERMISSIONS.find(
    (p) => p.value === option.value,
  )?.description;
  return (
    <Group flex={1} gap="xs">
      <div>
        <Text size="sm">{option.label}</Text>
        {description && (
          <Text size="xs" opacity={0.5}>
            {description}
          </Text>
        )}
      </div>
    </Group>
  );
};

interface UserPermissionsFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
}

/** Permission picker with per-permission descriptions. */
export const UserPermissionsField: React.FC<UserPermissionsFieldProps> = ({
  value,
  onChange,
}) => (
  <MultiSelect
    label="Permissions"
    description="Specific permissions granted to this user. Defaults are based on the selected role."
    data={permissionOptions}
    placeholder={
      value.length ? "Search permissions..." : "No permissions selected"
    }
    nothingFoundMessage="No permissions available"
    renderOption={renderOption}
    searchable
    clearable
    value={value}
    onChange={onChange}
  />
);
