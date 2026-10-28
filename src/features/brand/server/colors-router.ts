import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { brandColors } from "@/features/brand/schema";
import { requireBrand } from "@/features/brand/server/brand-guards";
import {
  removeColorSchema,
  upsertColorSchema,
} from "@/features/brand/validators";
import { osServer } from "@/orpc/server";
import { db } from "@/shared/lib/db";

export const brandColorsRouter = osServer.router({
  upsertColor: osServer
    .route({})
    .input(upsertColorSchema)
    .handler(async ({ input, context }) => {
      await requireBrand(context.headers, input.brandId, "admin");

      if (input.id) {
        const [updated] = await db
          .update(brandColors)
          .set({
            name: input.name,
            hex: input.hex,
            role: input.role,
            position: input.position,
          })
          .where(eq(brandColors.id, input.id))
          .returning();
        if (!updated) {
          throw new ORPCError("NOT_FOUND", { message: "Color not found" });
        }
        return updated;
      }

      const [created] = await db
        .insert(brandColors)
        .values({
          brandId: input.brandId,
          name: input.name,
          hex: input.hex,
          role: input.role,
          position: input.position ?? 0,
        })
        .returning();
      return created;
    }),

  removeColor: osServer
    .route({})
    .input(removeColorSchema)
    .handler(async ({ input, context }) => {
      const color = await db.query.brandColors.findFirst({
        where: eq(brandColors.id, input.id),
      });
      if (!color) {
        throw new ORPCError("NOT_FOUND", { message: "Color not found" });
      }
      await requireBrand(context.headers, color.brandId, "admin");

      await db.delete(brandColors).where(eq(brandColors.id, input.id));
      return { ok: true };
    }),
});
