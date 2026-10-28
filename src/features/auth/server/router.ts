import { requireAdmin } from "@/features/admin/server/require-admin";
import { usersManageRouter } from "@/features/auth/server/manage-router";
import { osServer } from "@/orpc/server";
import { db } from "@/shared/lib/db";

export const usersRouter = osServer.router({
  list: osServer.route({}).handler(async ({ context }) => {
    await requireAdmin(context.headers);
    return await db.query.user.findMany({
      orderBy: (u, { desc }) => [desc(u.createdAt)],
    });
  }),

  ...usersManageRouter,
});
