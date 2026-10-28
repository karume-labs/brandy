import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { eq } from "drizzle-orm";
import { assets } from "@/features/assets/schema";
import { resolveAssetPath } from "@/features/assets/server/storage";
import { auth } from "@/features/auth/server/better-auth";
import { db } from "@/shared/lib/db";

/**
 * Streams a stored asset file.
 *
 * Public assets (`isPublic`) are served to anyone - this is what makes the
 * /assets page usable without an account. Private assets require a session.
 * Files live outside public/, so this route is the only way in.
 */
export const GET = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;

  const asset = await db.query.assets.findFirst({ where: eq(assets.id, id) });
  if (!asset) {
    return new Response("Not Found", { status: 404 });
  }

  if (!asset.isPublic) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  let filePath: string;
  try {
    filePath = resolveAssetPath(asset.filePath);
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) {
      return new Response("Not Found", { status: 404 });
    }
    const stream = Readable.toWeb(createReadStream(filePath));
    const encodedName = encodeURIComponent(asset.fileName).replace(
      /['()*]/g,
      (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
    );

    return new Response(stream as ReadableStream, {
      headers: {
        "content-type": asset.mimeType,
        "content-length": String(info.size),
        "content-disposition": `attachment; filename="${asset.fileName.replace(/["\\]/g, "")}"; filename*=UTF-8''${encodedName}`,
        "cache-control": asset.isPublic
          ? "public, max-age=3600"
          : "private, no-store",
      },
    });
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? (error as { code?: string }).code
        : undefined;
    if (code === "ENOENT") {
      return new Response("Not Found", { status: 404 });
    }
    console.error("[assets] Failed to stream file:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
