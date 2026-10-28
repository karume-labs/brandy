import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import { requireAdmin } from "@/features/admin/server/require-admin";
import {
  WORKSPACE_ROLE_RANK,
  type WorkspaceRole,
  workspaceMembers,
} from "@/features/workspace/schema";
import { db } from "@/shared/lib/db";

/**
 * Tenant gate for every workspace-scoped procedure. Resolves the session
 * user, then enforces membership (and a minimum role) in `workspaceId`.
 * Platform super admins bypass membership; everyone else must belong.
 */
export const requireWorkspaceRole = async (
  headers: Headers,
  workspaceId: string,
  minRole: WorkspaceRole = "member",
) => {
  const sessionUser = await requireAdmin(headers);

  if (sessionUser.role === "super admin") {
    return sessionUser;
  }

  const membership = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, workspaceId),
      eq(workspaceMembers.userId, sessionUser.id),
    ),
  });

  if (!membership) {
    throw new ORPCError("FORBIDDEN", {
      message: "You do not have access to this workspace",
    });
  }

  if (WORKSPACE_ROLE_RANK[membership.role] < WORKSPACE_ROLE_RANK[minRole]) {
    throw new ORPCError("FORBIDDEN", {
      message: `This action requires the ${minRole} role in this workspace`,
    });
  }

  return sessionUser;
};

/** Resolves the workspace behind a brand (for brand-scoped procedures). */
export const requireBrandRole = async (
  headers: Headers,
  brandWorkspaceId: string,
  minRole: WorkspaceRole = "member",
) => requireWorkspaceRole(headers, brandWorkspaceId, minRole);
