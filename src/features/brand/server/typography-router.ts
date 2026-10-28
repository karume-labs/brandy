import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { brandGradients, brandTypography } from "@/features/brand/schema";
import { requireBrand } from "@/features/brand/server/brand-guards";
import {
  upsertGradientSchema,
  upsertTypographySchema,
} from "@/features/brand/validators";
import { osServer } from "@/orpc/server";
import { db } from "@/shared/lib/db";

export const brandTypographyRouter = osServer.router({
  upsertGradient: osServer
    .route({})
    .input(upsertGradientSchema)
    .handler(async ({ input, context }) => {
      await requireBrand(context.headers, input.brandId, "admin");

      if (input.id) {
        const [updated] = await db
          .update(brandGradients)
          .set({
            name: input.name,
            fromHex: input.fromHex,
            toHex: input.toHex,
            angle: input.angle,
          })
          .where(eq(brandGradients.id, input.id))
          .returning();
        if (!updated) {
          throw new ORPCError("NOT_FOUND", { message: "Gradient not found" });
        }
        return updated;
      }

      const [created] = await db
        .insert(brandGradients)
        .values({
          brandId: input.brandId,
          name: input.name,
          fromHex: input.fromHex,
          toHex: input.toHex,
          angle: input.angle,
        })
        .returning();
      return created;
    }),

  /** Locked typography governance per role (upsert by brand+role). */
  upsertTypography: osServer
    .route({})
    .input(upsertTypographySchema)
    .handler(async ({ input, context }) => {
      await requireBrand(context.headers, input.brandId, "admin");

      const [saved] = await db
        .insert(brandTypography)
        .values({
          brandId: input.brandId,
          role: input.role,
          fontFamily: input.fontFamily,
          fontWeight: input.fontWeight,
          tracking: input.tracking,
          lineHeight: input.lineHeight,
          isLocked: input.isLocked,
        })
        .onConflictDoUpdate({
          target: [brandTypography.brandId, brandTypography.role],
          set: {
            fontFamily: input.fontFamily,
            fontWeight: input.fontWeight,
            tracking: input.tracking,
            lineHeight: input.lineHeight,
            isLocked: input.isLocked,
          },
        })
        .returning();
      return saved;
    }),
});
