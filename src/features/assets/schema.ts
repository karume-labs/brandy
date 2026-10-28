import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "@/features/auth/schema";

/**
 * Branding assets (logos, fonts, brand kits, documents) stored on local disk.
 * `filePath` is the stored (obfuscated) name inside UPLOAD_DIR - downloads go
 * through /api/assets/[id]/file, which honours `isPublic`.
 */
export const assets = pgTable(
  "assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    /** Display name (usually the original filename). */
    name: text("name").notNull(),
    description: text("description"),
    /** Free-form grouping: logo, font, image, document, ... */
    category: text("category"),
    /** Stored file name on disk (never a path - resolved against UPLOAD_DIR). */
    filePath: text("file_path").notNull(),
    /** Original filename, used for the download Content-Disposition. */
    fileName: text("file_name").notNull(),
    mimeType: text("mime_type").notNull(),
    fileSize: integer("file_size").notNull(),
    /** Public assets are viewable/downloadable without a session. */
    isPublic: boolean("is_public").default(true).notNull(),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("assets_created_at_idx").on(table.createdAt),
    index("assets_is_public_idx").on(table.isPublic),
    index("assets_category_idx").on(table.category),
  ],
);
