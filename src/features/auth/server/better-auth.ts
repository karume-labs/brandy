import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { recordAudit } from "@/features/audit/server/record";
import * as authSchema from "@/features/auth/schema";
import { user } from "@/features/auth/schema";
import { sendResetPasswordEmail } from "@/features/auth/server/email";
import { env } from "@/shared/env.server";
import { db } from "@/shared/lib/db";

/** Reset links are valid for 15 minutes. */
const RESET_PASSWORD_TOKEN_TTL_SECONDS = 900;

/** Per-IP budgets for the password-reset endpoints. */
const RESET_EMAIL_RATE_LIMIT = { window: 60, max: 3 } as const;
const RESET_TOKEN_RATE_LIMIT = { window: 60, max: 5 } as const;

/** Only this endpoint represents a user-initiated sign-out. */
const SIGN_OUT_PATH = "/sign-out";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...authSchema,
    },
  }),
  session: {
    expiresIn: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },
  // Audit sign-ins / sign-outs. Auditing must never break authentication, so
  // each hook swallows its own errors.
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          try {
            const accountUser = await db.query.user.findFirst({
              where: eq(user.id, session.userId),
            });
            await recordAudit(
              {
                action: "sign_in",
                entityType: "user",
                entityId: session.userId,
                entityLabel: accountUser?.email ?? null,
                summary: accountUser
                  ? `${accountUser.name || accountUser.email} signed in`
                  : "User signed in",
              },
              accountUser,
            );
          } catch (error) {
            console.error("[audit] Failed to record sign-in:", error);
          }
        },
      },
      delete: {
        after: async (session, context) => {
          // Sessions are also deleted on password reset, bans and internal
          // cleanups - only the explicit /sign-out endpoint is an event.
          if (context?.path !== SIGN_OUT_PATH) {
            return;
          }
          try {
            const accountUser = await db.query.user.findFirst({
              where: eq(user.id, session.userId),
            });
            await recordAudit(
              {
                action: "sign_out",
                entityType: "user",
                entityId: session.userId,
                entityLabel: accountUser?.email ?? null,
                summary: accountUser
                  ? `${accountUser.name || accountUser.email} signed out`
                  : "User signed out",
              },
              accountUser,
            );
          } catch (error) {
            console.error("[audit] Failed to record sign-out:", error);
          }
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    // Self sign-up is closed: users are created exclusively by an admin or
    // the seed's admin bootstrap (seedAdmin), so no public registration path
    // exists.
    disableSignUp: true,
    resetPasswordTokenExpiresIn: RESET_PASSWORD_TOKEN_TTL_SECONDS,
    // Changing the password invalidates every existing session
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail({ user, url });
    },
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.NEXT_PUBLIC_API_URL,
  // Enabled in every environment (Better Auth only enables this in production
  // by default). Counts are kept in memory - per-instance, no extra table.
  rateLimit: {
    enabled: true,
    customRules: {
      "/request-password-reset": RESET_EMAIL_RATE_LIMIT,
      "/reset-password": RESET_TOKEN_RATE_LIMIT,
    },
  },
  // Note: admin() only guards /api/auth/*; the application's oRPC API is
  // gated by requireAdmin (src/features/admin/server/require-admin.ts).
  plugins: [admin()],
});
