import { auditLogs } from "@/features/audit/schema";
import { user } from "@/features/auth/schema";
import { seedAdmin } from "@/features/auth/server/seed";
import { seedBrands } from "@/features/brand/server/seed";
import { env } from "@/shared/env.server";
import { db } from "@/shared/lib/db";

const args = process.argv.slice(2);
const force = args.includes("--force") || args.includes("-f");

const runSeed = async () => {
  if (force) {
    console.log("Clearing data before seeding...");
    await db.delete(auditLogs);
    await db.delete(user);
    console.log("  Data cleared.");
  }

  console.log("Seeding...\n");

  await seedAdmin();

  // Brands need a workspace owner; reuse the seeded admin when present.
  const adminEmail = env.SUPER_ADMIN_EMAIL;
  const admin = adminEmail
    ? await db.query.user.findFirst({
        where: (users, { eq }) => eq(users.email, adminEmail),
      })
    : undefined;

  console.log("");
  await seedBrands(admin?.id ?? null);

  console.log("\nSeeding complete!");
  process.exit(0);
};

runSeed().catch((error) => {
  console.error("Seeding error:", error);
  process.exit(1);
});
