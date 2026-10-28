import { and, count, eq, or } from "drizzle-orm";
import { requireAdmin } from "@/features/admin/server/require-admin";
import { assets } from "@/features/assets/schema";
import { auditLogs } from "@/features/audit/schema";
import { listAuditLogsSchema } from "@/features/audit/validators";
import { hasPermission } from "@/features/auth/roles";
import { user } from "@/features/auth/schema";
import { osServer } from "@/orpc/server";
import { db } from "@/shared/lib/db";
import { offsetForPage } from "@/shared/validators";

/** Audit rows the session user may see when they lack `audit:read`. */
const ownActivityFilter = (actorId: string) =>
  or(
    eq(auditLogs.actorId, actorId),
    and(eq(auditLogs.entityType, "user"), eq(auditLogs.entityId, actorId)),
  );

export const auditRouter = osServer.router({
  /** Paginated audit entries, newest first, optionally filtered by action. */
  list: osServer
    .route({})
    .input(listAuditLogsSchema)
    .handler(async ({ input, context }) => {
      const sessionUser = await requireAdmin(context.headers);
      const canReadAudit = hasPermission(sessionUser, "audit:read");

      const permissionFilter = canReadAudit
        ? undefined
        : ownActivityFilter(sessionUser.id);

      const offset = offsetForPage(input.page, input.pageSize);
      const [items, totalRows] = await Promise.all([
        db.query.auditLogs.findMany({
          where: (t, { eq: eqAction, and }) => {
            const actionFilter = input.action
              ? eqAction(t.action, input.action)
              : undefined;
            return and(actionFilter, permissionFilter);
          },
          orderBy: (t, { desc }) => [desc(t.createdAt)],
          limit: input.pageSize,
          offset,
        }),
        db
          .select({ total: count() })
          .from(auditLogs)
          .where(
            and(
              input.action ? eq(auditLogs.action, input.action) : undefined,
              permissionFilter,
            ),
          ),
      ]);
      return { items, total: totalRows[0]?.total ?? 0 };
    }),

  /** Dashboard overview numbers + latest 8 audit entries. */
  stats: osServer.route({}).handler(async ({ context }) => {
    const sessionUser = await requireAdmin(context.headers);
    const canReadAudit = hasPermission(sessionUser, "audit:read");

    const permissionFilter = canReadAudit
      ? undefined
      : ownActivityFilter(sessionUser.id);

    const [
      userCountRows,
      assetCountRows,
      publicAssetCountRows,
      recentActivity,
    ] = await Promise.all([
      db.select({ total: count() }).from(user),
      db.select({ total: count() }).from(assets),
      db
        .select({ total: count() })
        .from(assets)
        .where(eq(assets.isPublic, true)),
      db.query.auditLogs.findMany({
        where: permissionFilter,
        orderBy: (t, { desc }) => [desc(t.createdAt)],
        limit: 8,
      }),
    ]);

    return {
      users: {
        total: userCountRows[0]?.total ?? 0,
      },
      assets: {
        total: assetCountRows[0]?.total ?? 0,
        public: publicAssetCountRows[0]?.total ?? 0,
      },
      recentActivity,
    };
  }),
});
