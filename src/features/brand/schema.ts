import {
  boolean,
  index,
  integer,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { workspaces } from "@/features/workspace/schema";

// Re-exported so brand_prompts rides along with the brand schema entrypoint
// (drizzle-kit globs `features/*/schema.ts`).
export * from "@/features/brand/prompt-schema";

export type BrandColorRole =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "semantic";

export type TypographyRole = "heading" | "body" | "mono";

/** A brand identity living inside a workspace (a workspace can hold many). */
export const brands = pgTable(
  "brands",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    tagline: text("tagline"),
    description: text("description"),
    /** Marks the workspace's flagship identity. */
    isPrimary: boolean("is_primary").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("brands_workspace_id_idx").on(table.workspaceId)],
);

/** Design tokens: one hex per role, either extracted or hand-set. */
export const brandColors = pgTable(
  "brand_colors",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    hex: text("hex").notNull(),
    role: text("role").$type<BrandColorRole>().notNull().default("neutral"),
    source: text("source")
      .$type<"extracted" | "manual">()
      .notNull()
      .default("manual"),
    position: integer("position").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("brand_colors_brand_name_idx").on(table.brandId, table.name),
  ],
);

/** Linear gradients (e.g. Go Play's #31C2A0 -> #B0DA42). */
export const brandGradients = pgTable(
  "brand_gradients",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    fromHex: text("from_hex").notNull(),
    toHex: text("to_hex").notNull(),
    /** Degrees, 0 = bottom-to-top. */
    angle: integer("angle").default(90).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("brand_gradients_brand_name_idx").on(table.brandId, table.name),
  ],
);

/** Locked typography governance per role. */
export const brandTypography = pgTable(
  "brand_typography",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    role: text("role").$type<TypographyRole>().notNull(),
    fontFamily: text("font_family").notNull(),
    fontWeight: integer("font_weight").default(400).notNull(),
    /** Letter-spacing in em. */
    tracking: real("tracking").default(0).notNull(),
    lineHeight: real("line_height").default(1.5).notNull(),
    isLocked: boolean("is_locked").default(false).notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("brand_typography_brand_role_idx").on(
      table.brandId,
      table.role,
    ),
  ],
);
