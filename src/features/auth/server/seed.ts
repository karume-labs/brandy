import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { account, session, user, verification } from "@/features/auth/schema";
import { env } from "@/shared/env.server";
import { db } from "@/shared/lib/db";

/**
 * Provisions the first administrator from SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD.
 * Self sign-up is disabled (`disableSignUp`), so this is the only way users
 * get created. The admin is marked `emailVerified: true` because
 * `requireAdmin` enforces verified emails and there is no email-verification
 * inbox flow in this internal tool.
 */
export const seedAdmin = async () => {
  console.log("Seeding administrator account...");

  const adminEmail = env.SUPER_ADMIN_EMAIL;
  const adminPassword = env.SUPER_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.log(
      "  Skipping admin seed: SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not set.",
    );
    return;
  }

  const existingAdmins = await db.query.user.findMany({
    where: (users, { eq }) => eq(users.email, adminEmail),
  });

  if (existingAdmins.length > 0) {
    console.log(
      "  Admin account already exists. Updating role to super admin...",
    );
    await db
      .update(user)
      .set({ role: "super admin", emailVerified: true })
      .where(eq(user.id, existingAdmins[0].id));
    console.log("  Admin account updated successfully!");
    return;
  }

  const seedAuth = betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: { user, account, session, verification },
    }),
    emailAndPassword: { enabled: true },
    baseURL: env.NEXT_PUBLIC_API_URL,
    plugins: [admin()],
  });

  const response = await seedAuth.api.signUpEmail({
    body: {
      email: adminEmail,
      password: adminPassword,
      name: "Administrator",
    },
    headers: new Headers(),
  });

  if (response?.user) {
    await db
      .update(user)
      .set({ role: "super admin", emailVerified: true })
      .where(eq(user.id, response.user.id));
    console.log(
      "  Administrator account successfully seeded with role 'super admin'.",
    );
  } else {
    console.error("  Failed to create administrator account.");
  }
};
