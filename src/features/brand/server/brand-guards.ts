import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { brands } from "@/features/brand/schema";
import type { WorkspaceRole } from "@/features/workspace/schema";
import { requireWorkspaceRole } from "@/features/workspace/server/gate";
import { db } from "@/shared/lib/db";

/** Resolves a brand, enforcing the caller's role on its workspace. */
export const requireBrand = async (
  headers: Headers,
  brandId: string,
  minRole: WorkspaceRole = "member",
) => {
  const brand = await db.query.brands.findFirst({
    where: eq(brands.id, brandId),
  });
  if (!brand) {
    throw new ORPCError("NOT_FOUND", { message: "Brand not found" });
  }
  await requireWorkspaceRole(headers, brand.workspaceId, minRole);
  return brand;
};
