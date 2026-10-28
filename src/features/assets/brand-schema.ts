import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import {
  type AssetCategory,
  type BrandAssetKind,
  DEFAULT_VARIANT_RULES,
  type VariantRules,
  type VariantType,
} from "@/features/assets/brand-asset-types";
import { user } from "@/features/auth/schema";
import { brands } from "@/features/brand/schema";

// Re-exported so consumers import every brand-asset type from one path.
export * from "@/features/assets/brand-asset-types";

/**
 * Master asset record. Everything downstream references THIS row, never a
 * concrete file - flipping `currentVersionId` propagates an update across
 * documents without breaking layout history.
 */
export const brandAssets = pgTable(
  "brand_assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    kind: text("kind").$type<BrandAssetKind>().notNull().default("image"),
    variantType: text("variant_type").$type<VariantType>(),
    /** Marketing materials, guides, fonts, social kits - not just logos. */
    category: text("category").$type<AssetCategory>().notNull().default("logo"),
    name: text("name").notNull(),
    /** Pointer to the active asset_versions row. */
    currentVersionId: uuid("current_version_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("brand_assets_brand_id_idx").on(table.brandId),
    uniqueIndex("brand_assets_brand_variant_idx").on(
      table.brandId,
      table.variantType,
    ),
  ],
);

/** Immutable file versions; only the pointer on the master record moves. */
export const assetVersions = pgTable(
  "asset_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => brandAssets.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    filePath: text("file_path").notNull(),
    fileName: text("file_name").notNull(),
    mimeType: text("mime_type").notNull(),
    fileSize: integer("file_size").notNull(),
    width: integer("width"),
    height: integer("height"),
    isTransparent: boolean("is_transparent").default(false).notNull(),
    isPublic: boolean("is_public").default(false).notNull(),
    rules: jsonb("rules")
      .$type<VariantRules>()
      .notNull()
      .default(DEFAULT_VARIANT_RULES),
    notes: text("notes"),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("asset_versions_asset_version_idx").on(
      table.assetId,
      table.version,
    ),
  ],
);

export const brandAssetsRelations = relations(brandAssets, ({ many }) => ({
  versions: many(assetVersions),
}));

export const assetVersionsRelations = relations(assetVersions, ({ one }) => ({
  asset: one(brandAssets, {
    fields: [assetVersions.assetId],
    references: [brandAssets.id],
  }),
}));
