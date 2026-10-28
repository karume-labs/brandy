import { ORPCError } from "@orpc/server";
import { asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import {
  brandColors,
  brandGradients,
  brandPrompts,
  brands,
  brandTypography,
} from "@/features/brand/schema";
import { requireBrand } from "@/features/brand/server/brand-guards";
import { brandColorsRouter } from "@/features/brand/server/colors-router";
import { brandPromptsRouter } from "@/features/brand/server/prompts-router";
import { brandTypographyRouter } from "@/features/brand/server/typography-router";
import {
  createBrandSchema,
  updateBrandSchema,
} from "@/features/brand/validators";
import { requireWorkspaceRole } from "@/features/workspace/server/gate";
import { osServer } from "@/orpc/server";
import { db } from "@/shared/lib/db";

export const brandsRouter = osServer.router({
  /** Brands inside a workspace (primary first). */
  list: osServer
    .route({})
    .input(z.object({ workspaceId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      await requireWorkspaceRole(context.headers, input.workspaceId);
      return await db.query.brands.findMany({
        where: eq(brands.workspaceId, input.workspaceId),
        orderBy: [desc(brands.isPrimary), asc(brands.name)],
      });
    }),

  /** Full brand bundle: row + tokens in one round trip. */
  get: osServer
    .route({})
    .input(z.object({ brandId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const brand = await requireBrand(context.headers, input.brandId);

      const [colors, gradients, typography, prompts] = await Promise.all([
        db.query.brandColors.findMany({
          where: eq(brandColors.brandId, brand.id),
          orderBy: [asc(brandColors.position), asc(brandColors.name)],
        }),
        db.query.brandGradients.findMany({
          where: eq(brandGradients.brandId, brand.id),
        }),
        db.query.brandTypography.findMany({
          where: eq(brandTypography.brandId, brand.id),
        }),
        db.query.brandPrompts.findMany({
          where: eq(brandPrompts.brandId, brand.id),
          orderBy: [asc(brandPrompts.context), asc(brandPrompts.name)],
        }),
      ]);

      return { brand, colors, gradients, typography, prompts };
    }),

  create: osServer
    .route({})
    .input(createBrandSchema)
    .handler(async ({ input, context }) => {
      await requireWorkspaceRole(context.headers, input.workspaceId, "admin");

      const [created] = await db
        .insert(brands)
        .values({
          workspaceId: input.workspaceId,
          name: input.name,
          slug: input.slug,
          tagline: input.tagline ?? null,
          isPrimary: input.isPrimary,
        })
        .returning();
      if (!created) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Could not create brand",
        });
      }
      return created;
    }),

  update: osServer
    .route({})
    .input(updateBrandSchema)
    .handler(async ({ input, context }) => {
      // requireBrand enforces admin on the brand's workspace.
      await requireBrand(context.headers, input.id, "admin");

      const [updated] = await db
        .update(brands)
        .set({
          // Omitted fields stay untouched (drizzle skips undefined).
          name: input.name,
          tagline: input.tagline,
          description: input.description,
          isPrimary: input.isPrimary,
        })
        .where(eq(brands.id, input.id))
        .returning();
      return updated;
    }),

  ...brandColorsRouter,
  ...brandPromptsRouter,
  ...brandTypographyRouter,
});
