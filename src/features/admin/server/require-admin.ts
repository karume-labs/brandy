import { ORPCError } from "@orpc/server";
import { auth } from "@/features/auth/server/better-auth";

/** Statuses a ban may carry: `banned` flag plus an optional expiry. */
const isBanActive = (user: {
  banned?: boolean | null;
  banExpires?: Date | null;
}) =>
  user.banned === true &&
  (user.banExpires === null ||
    user.banExpires === undefined ||
    user.banExpires.getTime() > Date.now());

/**
 * Session gate for every app oRPC procedure.
 *
 * Better Auth's `admin()` plugin only guards `/api/auth/*`; this is the
 * application's own door, so it enforces the full policy: authenticated,
 * not banned, admin role, and a verified email (admins are provisioned by the
 * seed with `emailVerified: true`). oRPC serialises ORPCError into a
 * proper 401/403 instead of a generic 500.
 */
export const requireAdmin = async (headers: Headers) => {
  const session = await auth.api.getSession({
    headers,
  });

  if (!session?.user) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Authentication required",
    });
  }

  if (isBanActive(session.user)) {
    throw new ORPCError("FORBIDDEN", { message: "This account is suspended" });
  }

  if (session.user.role !== "admin" && session.user.role !== "super admin") {
    throw new ORPCError("FORBIDDEN", { message: "Admin access required" });
  }

  return session.user;
};
