import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/features/admin/server/require-admin";
import { diffObjects, recordAudit } from "@/features/audit/server/record";
import { user } from "@/features/auth/schema";
import {
  createUserWithRole,
  updateUserWithAudit,
} from "@/features/auth/server/user-write";
import {
  createUserSchema,
  deleteUserSchema,
  updateRoleSchema,
  updateUserSchema,
} from "@/features/auth/validators";
import { osServer } from "@/orpc/server";
import { db } from "@/shared/lib/db";

export const usersManageRouter = osServer.router({
  updateRole: osServer
    .route({})
    .input(updateRoleSchema)
    .handler(async ({ input, context }) => {
      const sessionUser = await requireAdmin(context.headers);

      const [before] = await db
        .select()
        .from(user)
        .where(eq(user.id, input.id));
      if (!before) {
        throw new ORPCError("NOT_FOUND", { message: "User not found" });
      }

      const [updated] = await db
        .update(user)
        .set({ role: input.role, permissions: null, updatedAt: new Date() })
        .where(eq(user.id, input.id))
        .returning();

      if (updated) {
        await recordAudit(
          {
            action: "update",
            entityType: "user",
            entityId: updated.id,
            entityLabel: updated.email,
            summary: `Updated role for ${updated.email}`,
            changes: diffObjects(before, updated, ["role", "permissions"]),
          },
          sessionUser,
        );
      }
      return updated;
    }),

  create: osServer
    .route({})
    .input(createUserSchema)
    .handler(async ({ input, context }) => {
      const sessionUser = await requireAdmin(context.headers);
      return await createUserWithRole(input, sessionUser);
    }),

  update: osServer
    .route({})
    .input(updateUserSchema)
    .handler(async ({ input, context }) => {
      const sessionUser = await requireAdmin(context.headers);
      return await updateUserWithAudit(input, sessionUser);
    }),

  delete: osServer
    .route({})
    .input(deleteUserSchema)
    .handler(async ({ input, context }) => {
      const sessionUser = await requireAdmin(context.headers);
      const [deleted] = await db
        .delete(user)
        .where(eq(user.id, input.id))
        .returning();

      if (!deleted) {
        throw new ORPCError("NOT_FOUND", { message: "User not found" });
      }

      await recordAudit(
        {
          action: "delete",
          entityType: "user",
          entityId: deleted.id,
          entityLabel: deleted.email,
          summary: `Deleted user ${deleted.email}`,
        },
        sessionUser,
      );

      return deleted;
    }),
});
