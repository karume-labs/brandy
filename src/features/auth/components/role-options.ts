import { ROLE_PERMISSIONS } from "@/features/auth/roles";

/** Select options for every defined role, prettily title-cased. */
export const roleOptions = Object.keys(ROLE_PERMISSIONS).map((role) => ({
  value: role,
  label: role
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" "),
}));
