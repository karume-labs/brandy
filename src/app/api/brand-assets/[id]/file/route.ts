import { and, eq } from "drizzle-orm";
import { assetVersions, brandAssets } from "@/features/assets/brand-schema";
import { auth } from "@/features/auth/server/better-auth";
import { brands } from "@/features/brand/schema";
import { workspaceMembers } from "@/features/workspace/schema";
import { db } from "@/shared/lib/db";
import { storage } from "@/shared/lib/storage";

/**
 * Streams the active version of a brand asset. Versions flagged `isPublic`
 * are served to anyone - this is what powers the public library at / with no
 * sign-in. Everything else requires a workspace session; files live outside
 * public/, so this route is the only way in.
 */
export const GET = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;

  const asset = await db.query.brandAssets.findFirst({
    where: eq(brandAssets.id, id),
  });
  if (!asset?.currentVersionId) {
    return new Response("Not Found", { status: 404 });
  }

  const version = await db.query.assetVersions.findFirst({
    where: eq(assetVersions.id, asset.currentVersionId),
  });
  if (!version) {
    return new Response("Not Found", { status: 404 });
  }

  if (!version.isPublic) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const brand = await db.query.brands.findFirst({
      where: eq(brands.id, asset.brandId),
    });
    if (!brand) {
      return new Response("Not Found", { status: 404 });
    }

    const membership =
      session.user.role === "super admin"
        ? { userId: session.user.id } // super admins bypass membership
        : await db.query.workspaceMembers.findFirst({
            where: and(
              eq(workspaceMembers.workspaceId, brand.workspaceId),
              eq(workspaceMembers.userId, session.user.id),
            ),
          });

    if (!membership) {
      return new Response("Forbidden", { status: 403 });
    }
  }

  try {
    const data = await storage.get(version.filePath);
    const encodedName = encodeURIComponent(version.fileName).replace(
      /['()*]/g,
      (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
    );

    return new Response(new Uint8Array(data), {
      headers: {
        "content-type": version.mimeType,
        "content-length": String(data.length),
        "content-disposition": `inline; filename="${version.fileName.replace(/["\\]/g, "")}"; filename*=UTF-8''${encodedName}`,
        "cache-control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[brand-assets] Failed to stream file:", error);
    return new Response("Not Found", { status: 404 });
  }
};
