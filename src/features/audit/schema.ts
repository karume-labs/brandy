import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type {
  AuditAction,
  AuditChanges,
  AuditEntityType,
} from "@/features/audit/constants";

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorId: text("actor_id"),
    actorName: text("actor_name"),
    actorEmail: text("actor_email"),
    action: text("action").$type<AuditAction>().notNull(),
    entityType: text("entity_type").$type<AuditEntityType>().notNull(),
    entityId: text("entity_id"),
    entityLabel: text("entity_label"),
    summary: text("summary"),
    changes: jsonb("changes").$type<AuditChanges>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("audit_logs_created_at_idx").on(table.createdAt),
    index("audit_logs_entity_type_entity_id_idx").on(
      table.entityType,
      table.entityId,
    ),
  ],
);
