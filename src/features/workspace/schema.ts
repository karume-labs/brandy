import {
  type AnyPgColumn,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "@/features/auth/schema";

export type WorkspaceRole = "owner" | "admin" | "member";

/** Role ordering for permission comparisons (higher = more power). */
export const WORKSPACE_ROLE_RANK: Record<WorkspaceRole, number> = {
  member: 0,
  admin: 1,
  owner: 2,
};

/**
 * A tenant: a brand's home. Corporate anchors (e.g. NerveTech Systems) are
 * parents of subsidiary workspaces (e.g. Go Play) via `parentId`, and the
 * switcher lets a user hop between any workspace they belong to.
 */
export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    /** Self-reference: subsidiary -> corporate anchor. */
    parentId: uuid("parent_id").references((): AnyPgColumn => workspaces.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("workspaces_parent_id_idx").on(table.parentId)],
);

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").$type<WorkspaceRole>().notNull().default("member"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("workspace_members_ws_user_idx").on(
      table.workspaceId,
      table.userId,
    ),
  ],
);
