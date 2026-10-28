export type Permission =
  | "users:read"
  | "users:write"
  | "assets:read"
  | "assets:write"
  | "audit:read";

export const PERMISSIONS: {
  value: Permission;
  label: string;
  description: string;
}[] = [
  {
    value: "users:read",
    label: "Read Users",
    description: "Can view users in the system",
  },
  {
    value: "users:write",
    label: "Write Users",
    description: "Can create, update, and delete users",
  },
  {
    value: "assets:read",
    label: "Read Assets",
    description: "Can view branding assets",
  },
  {
    value: "assets:write",
    label: "Write Assets",
    description: "Can upload, update, and delete branding assets",
  },
  {
    value: "audit:read",
    label: "Read Audit Logs",
    description: "Can view system audit logs",
  },
];

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  "super admin": [
    "users:read",
    "users:write",
    "assets:read",
    "assets:write",
    "audit:read",
  ],
  admin: ["assets:read", "assets:write", "users:read", "audit:read"],
  user: ["assets:read"],
};

export const hasPermission = (
  user:
    | { role?: string | null; permissions?: string[] | null }
    | null
    | undefined,
  permission: Permission,
) => {
  if (!user) return false;
  if (user.role === "super admin") return true;

  if (user.permissions !== undefined && user.permissions !== null) {
    return user.permissions.includes(permission);
  }
  if (!user.role) return false;
  const rolePermissions = ROLE_PERMISSIONS[user.role];
  if (!rolePermissions) return false;
  return rolePermissions.includes(permission);
};
