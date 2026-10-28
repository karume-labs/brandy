import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/features/admin/server/require-admin";
import { diffObjects, recordAudit } from "@/features/audit/server/record";
import { user } from "@/features/auth/schema";
import { auth } from "@/features/auth/server/better-auth";
import {
  createUserSchema,
  deleteUserSchema,
  updateRoleSchema,
  updateUserSchema,
} from "@/features/auth/validators";
import { osServer } from "@/orpc/server";
import { db } from "@/shared/lib/db";

export const usersRouter = osServer.router({
  list: osServer.route({}).handler(async ({ context }) => {
    await requireAdmin(context.headers);
    return await db.query.user.findMany({
      orderBy: (u, { desc }) => [desc(u.createdAt)],
    });
  }),

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
      const result = await auth.api.createUser({
        body: {
          name: input.name,
          email: input.email,
          password: input.password,
        },
      });
      if (result?.user?.id) {
        await db
          .update(user)
          .set({
            emailVerified: true,
            role: input.role,
            permissions: input.permissions ?? null,
          })
          .where(eq(user.id, result.user.id));

        await recordAudit(
          {
            action: "create",
            entityType: "user",
            entityId: result.user.id,
            entityLabel: result.user.email,
            summary: `Created user ${result.user.email}`,
          },
          sessionUser,
        );
      }
      return result;
    }),

  update: osServer
    .route({})
    .input(updateUserSchema)
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
        .set({
          name: input.name,
          email: input.email,
          role: input.role,
          permissions: input.permissions ?? null,
          updatedAt: new Date(),
        })
        .where(eq(user.id, input.id))
        .returning();

      if (updated) {
        await recordAudit(
          {
            action: "update",
            entityType: "user",
            entityId: updated.id,
            entityLabel: updated.email,
            summary: `Updated user ${updated.email}`,
            changes: diffObjects(before, updated, [
              "name",
              "email",
              "role",
              "permissions",
            ]),
          },
          sessionUser,
        );
      }

      if (input.password) {
        await auth.api
          .setUserPassword({
            body: {
              userId: input.id,
              newPassword: input.password,
            },
          })
          .catch((e: unknown) => {
            console.error("Failed to update password via better-auth admin", e);
          });
      }

      return updated;
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
