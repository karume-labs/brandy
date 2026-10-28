import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/features/admin/server/require-admin";
import type { VariantRules } from "@/features/assets/brand-schema";
import { brandAssets, VARIANT_TYPES } from "@/features/assets/brand-schema";
import {
  requireAssetAdmin,
  uploadedFileSchema,
  variantRulesSchema,
} from "@/features/assets/server/brand-asset-guards";
import {
  rollbackAssetVersion,
  updateAssetRules,
  uploadAssetVersion,
} from "@/features/assets/server/versions";
import { osServer } from "@/orpc/server";
import { db } from "@/shared/lib/db";

const asBadRequest = (error: unknown, fallback: string) =>
  new ORPCError("BAD_REQUEST", {
    message: error instanceof Error ? error.message : fallback,
  });

export const brandAssetVersionsRouter = osServer.router({
  /** Upload a replacement file as a new immutable version. */
  uploadVersion: osServer
    .route({})
    .input(
      z.object({
        assetId: z.string().uuid(),
        file: uploadedFileSchema,
        notes: z.string().max(300).nullable().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      // requireAssetAdmin enforces admin on the asset's brand workspace.
      const asset = await requireAssetAdmin(context.headers, input.assetId);
      const sessionUser = await requireAdmin(context.headers);

      try {
        return await uploadAssetVersion({
          assetId: asset.id,
          file: input.file,
          notes: input.notes ?? null,
          userId: sessionUser.id,
        });
      } catch (error) {
        throw asBadRequest(error, "Upload failed");
      }
    }),

  /** Flip the active pointer back to an older version. */
  rollback: osServer
    .route({})
    .input(
      z.object({ assetId: z.string().uuid(), versionId: z.string().uuid() }),
    )
    .handler(async ({ input, context }) => {
      await requireAssetAdmin(context.headers, input.assetId);
      try {
        return await rollbackAssetVersion(input);
      } catch (error) {
        throw asBadRequest(error, "Rollback failed");
      }
    }),

  /** Update rule-enforcement metadata on the active version. */
  updateRules: osServer
    .route({})
    .input(z.object({ assetId: z.string().uuid(), rules: variantRulesSchema }))
    .handler(async ({ input, context }) => {
      await requireAssetAdmin(context.headers, input.assetId);
      try {
        return await updateAssetRules({
          assetId: input.assetId,
          rules: input.rules as Partial<VariantRules>,
        });
      } catch (error) {
        throw asBadRequest(error, "Update failed");
      }
    }),

  /** Variant type reassignment (manual correction after ingestion). */
  setVariantType: osServer
    .route({})
    .input(
      z.object({
        assetId: z.string().uuid(),
        variantType: z.enum(VARIANT_TYPES).nullable(),
      }),
    )
    .handler(async ({ input, context }) => {
      await requireAssetAdmin(context.headers, input.assetId);
      const [updated] = await db
        .update(brandAssets)
        .set({ variantType: input.variantType })
        .where(eq(brandAssets.id, input.assetId))
        .returning();
      return updated;
    }),
});
