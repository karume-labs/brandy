import { auditLogs } from "@/features/audit/schema";
import { user } from "@/features/auth/schema";
import { seedAdmin } from "@/features/auth/server/seed";
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

  console.log("\nSeeding complete!");
  process.exit(0);
};

runSeed().catch((error) => {
  console.error("Seeding error:", error);
  process.exit(1);
});
