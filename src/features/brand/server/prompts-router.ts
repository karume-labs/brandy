import { ORPCError } from "@orpc/server";
import { asc, eq } from "drizzle-orm";
import { brandPrompts } from "@/features/brand/schema";
import { requireBrand } from "@/features/brand/server/brand-guards";
import {
  removePromptSchema,
  upsertPromptSchema,
} from "@/features/brand/validators";
import { osServer } from "@/orpc/server";
import { db } from "@/shared/lib/db";

export const brandPromptsRouter = osServer.router({
  /** All LLM handoff templates for a brand, grouped by context in the UI. */
  listPrompts: osServer
    .route({})
    .input(upsertPromptSchema.pick({ brandId: true }))
    .handler(async ({ input, context }) => {
      await requireBrand(context.headers, input.brandId);
      return await db.query.brandPrompts.findMany({
        where: eq(brandPrompts.brandId, input.brandId),
        orderBy: [asc(brandPrompts.context), asc(brandPrompts.name)],
      });
    }),

  /** Admin-editable: create or update a copy-paste prompt template. */
  upsertPrompt: osServer
    .route({})
    .input(upsertPromptSchema)
    .handler(async ({ input, context }) => {
      await requireBrand(context.headers, input.brandId, "admin");

      if (input.id) {
        const [updated] = await db
          .update(brandPrompts)
          .set({
            context: input.context,
            name: input.name,
            body: input.body,
          })
          .where(eq(brandPrompts.id, input.id))
          .returning();
        if (!updated) {
          throw new ORPCError("NOT_FOUND", { message: "Prompt not found" });
        }
        return updated;
      }

      const [created] = await db
        .insert(brandPrompts)
        .values({
          brandId: input.brandId,
          context: input.context,
          name: input.name,
          body: input.body,
        })
        .returning();
      return created;
    }),

  removePrompt: osServer
    .route({})
    .input(removePromptSchema)
    .handler(async ({ input, context }) => {
      const prompt = await db.query.brandPrompts.findFirst({
        where: eq(brandPrompts.id, input.id),
      });
      if (!prompt) {
        throw new ORPCError("NOT_FOUND", { message: "Prompt not found" });
      }
      await requireBrand(context.headers, prompt.brandId, "admin");

      await db.delete(brandPrompts).where(eq(brandPrompts.id, input.id));
      return { ok: true };
    }),
});
