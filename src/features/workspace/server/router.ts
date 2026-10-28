import { asc, eq, isNull } from "drizzle-orm";
import { requireAdmin } from "@/features/admin/server/require-admin";
import {
  type WorkspaceRole,
  workspaceMembers,
  workspaces,
} from "@/features/workspace/schema";
import { workspacesManageRouter } from "@/features/workspace/server/manage-router";
import { osServer } from "@/orpc/server";
import { db } from "@/shared/lib/db";

export interface WorkspaceWithMeta {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  /** The session user's effective role (super admins count as owner). */
  myRole: WorkspaceRole;
  createdAt: Date;
}

export const workspacesRouter = osServer.router({
  /**
   * Every workspace the session user can enter. Super admins see the full
   * registry; everyone else sees their memberships.
   */
  list: osServer
    .route({})
    .handler(async ({ context }): Promise<WorkspaceWithMeta[]> => {
      const sessionUser = await requireAdmin(context.headers);

      const rows = await db.query.workspaces.findMany({
        orderBy: [asc(workspaces.name)],
      });

      if (sessionUser.role === "super admin") {
        return rows.map((row) => ({
          ...row,
          myRole: "owner" as WorkspaceRole,
        }));
      }

      const memberships = await db.query.workspaceMembers.findMany({
        where: eq(workspaceMembers.userId, sessionUser.id),
      });
      const roleByWorkspace = new Map(
        memberships.map((m) => [m.workspaceId, m.role]),
      );

      return rows
        .filter((row) => roleByWorkspace.has(row.id))
        .map((row) => ({
          ...row,
          myRole: roleByWorkspace.get(row.id) ?? "member",
        }));
    }),

  /** Anchors only (workspaces with no parent) - used by the subsidiary picker. */
  anchors: osServer.route({}).handler(async ({ context }) => {
    await requireAdmin(context.headers);
    return await db.query.workspaces.findMany({
      where: isNull(workspaces.parentId),
      orderBy: [asc(workspaces.name)],
    });
  }),

  ...workspacesManageRouter,
});
