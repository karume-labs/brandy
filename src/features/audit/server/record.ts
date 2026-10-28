import type {
  AuditAction,
  AuditChanges,
  AuditEntityType,
} from "@/features/audit/constants";
import { auditLogs } from "@/features/audit/schema";
import { db } from "@/shared/lib/db";

export interface RecordAuditInput {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string | null;
  entityLabel?: string | null;
  summary?: string | null;
  changes?: AuditChanges | null;
}

/** The Better Auth user returned by `requireAdmin` satisfies this shape. */
export interface AuditActor {
  id?: string | null;
  name?: string | null;
  email?: string | null;
}

/**
 * Diffs two objects into `{ field: { from, to } }` for update audits.
 * Only the given `keys` (or all keys of `after` when omitted) are compared.
 */
export const diffObjects = <T extends object>(
  before: T,
  after: T,
  keys?: readonly (keyof T & string)[],
): AuditChanges => {
  const changes: AuditChanges = {};
  const fields = keys ?? (Object.keys(after) as (keyof T & string)[]);
  for (const field of fields) {
    const from = before[field];
    const to = after[field];
    if (!Object.is(from, to)) {
      changes[field] = { from, to };
    }
  }
  return changes;
};

/**
 * Inserts an audit row. Never throws - a failed audit write must not break
 * the mutation that triggered it.
 */
export const recordAudit = async (
  input: RecordAuditInput,
  actor?: AuditActor,
): Promise<void> => {
  try {
    await db.insert(auditLogs).values({
      actorId: actor?.id ?? null,
      actorName: actor?.name ?? null,
      actorEmail: actor?.email ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      entityLabel: input.entityLabel ?? null,
      summary: input.summary ?? null,
      changes: input.changes ?? null,
    });
  } catch (error) {
    console.error("[audit] Failed to record audit log:", error);
  }
};
