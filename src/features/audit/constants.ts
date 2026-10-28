/** Audit action values recorded by `recordAudit`. */
export const AUDIT_ACTIONS = [
  "create",
  "update",
  "delete",
  "sign_in",
  "sign_out",
  "upload",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

/** Entity types an audit entry can refer to. */
export const AUDIT_ENTITY_TYPES = ["asset", "company", "user"] as const;
export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];

/** Old/new diff stored on `audit_logs.changes` for updates. */
export type AuditChanges = Record<string, { from: unknown; to: unknown }>;

/** Badge color per action (Mantine theme colors). */
export const AUDIT_ACTION_COLORS: Record<AuditAction, string> = {
  create: "amber",
  update: "amber",
  delete: "amber",
  upload: "amber",
  sign_in: "amber",
  sign_out: "amber",
};

/** Badge color per entity type (Mantine theme colors). */
export const AUDIT_ENTITY_COLORS: Record<AuditEntityType, string> = {
  asset: "amber",
  company: "amber",
  user: "amber",
};

const ACTION_LABELS: Record<AuditAction, string> = {
  create: "Create",
  update: "Update",
  delete: "Delete",
  sign_in: "Sign in",
  sign_out: "Sign out",
  upload: "Upload",
};

const ENTITY_LABELS: Record<AuditEntityType, string> = {
  asset: "Asset",
  company: "Company",
  user: "User",
};

export const auditActionLabel = (action: AuditAction): string =>
  ACTION_LABELS[action];

export const auditEntityLabel = (entityType: AuditEntityType): string =>
  ENTITY_LABELS[entityType];

/** Formats a timestamp that may arrive as a Date (typed) or string (over the wire). */
export const formatDateTime = (value: string | Date): string =>
  new Date(
    typeof value === "string" ? value : value.getTime(),
  ).toLocaleString();
