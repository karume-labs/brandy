import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/features/admin/server/require-admin";
import { user } from "@/features/auth/schema";
import { workspaceMembers, workspaces } from "@/features/workspace/schema";
import { requireWorkspaceRole } from "@/features/workspace/server/gate";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  workspaceIdSchema,
} from "@/features/workspace/validators";
import { osServer } from "@/orpc/server";
import { db } from "@/shared/lib/db";

export const workspacesManageRouter = osServer.router({
  create: osServer
    .route({})
    .input(createWorkspaceSchema)
    .handler(async ({ input, context }) => {
      const sessionUser = await requireAdmin(context.headers);

      if (input.parentId) {
        const parent = await db.query.workspaces.findFirst({
          where: eq(workspaces.id, input.parentId),
        });
        if (!parent) {
          throw new ORPCError("NOT_FOUND", {
            message: "Parent workspace not found",
          });
        }
      }

      const [created] = await db
        .insert(workspaces)
        .values({
          name: input.name,
          slug: input.slug,
          parentId: input.parentId ?? null,
        })
        .returning();
      if (!created) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Could not create workspace",
        });
      }

      await db.insert(workspaceMembers).values({
        workspaceId: created.id,
        userId: sessionUser.id,
        role: "owner",
      });

      return created;
    }),

  update: osServer
    .route({})
    .input(updateWorkspaceSchema)
    .handler(async ({ input, context }) => {
      await requireWorkspaceRole(context.headers, input.id, "admin");

      const [updated] = await db
        .update(workspaces)
        .set({
          name: input.name,
          parentId: input.parentId === undefined ? undefined : input.parentId,
        })
        .where(eq(workspaces.id, input.id))
        .returning();

      if (!updated) {
        throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });
      }
      return updated;
    }),

  members: osServer
    .route({})
    .input(workspaceIdSchema)
    .handler(async ({ input, context }) => {
      await requireWorkspaceRole(context.headers, input.workspaceId);

      return await db
        .select({
          id: workspaceMembers.id,
          role: workspaceMembers.role,
          email: user.email,
          name: user.name,
          userId: user.id,
        })
        .from(workspaceMembers)
        .innerJoin(user, eq(workspaceMembers.userId, user.id))
        .where(eq(workspaceMembers.workspaceId, input.workspaceId));
    }),
});
