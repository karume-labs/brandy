import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { brands } from "@/features/brand/schema";

/** What a prompt template is written for. */
export const PROMPT_CONTEXTS = [
  "logo_sheet",
  "brand_guide",
  "general",
] as const;
export type PromptContext = (typeof PROMPT_CONTEXTS)[number];

/**
 * Customizable LLM handoff prompts. Admins edit the templates; {{tokens}}
 * (e.g. {{brand.name}}, {{colors.list}}) are filled in when copying.
 */
export const brandPrompts = pgTable(
  "brand_prompts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    context: text("context")
      .$type<PromptContext>()
      .notNull()
      .default("general"),
    name: text("name").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("brand_prompts_brand_name_idx").on(table.brandId, table.name),
  ],
);
