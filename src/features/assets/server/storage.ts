import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "@/shared/env.server";

/**
 * Local-disk asset storage (deliberately no object storage). Files live under
 * UPLOAD_DIR (default <cwd>/storage/assets) - outside public/, so they are
 * only reachable through /api/assets/[id]/file, which enforces `isPublic` /
 * session checks. Stored names are obfuscated so a leaked path isn't
 * guessable, but that is defence in depth, not access control.
 */
const STORAGE_ROOT = path.resolve(
  /* turbopackIgnore: true */ process.cwd(),
  env.UPLOAD_DIR,
);

/** Refuse anything that would escape the storage root. */
const safeBasename = (name: string): string => {
  const base = path.basename(name);
  if (!base || base === "." || base === "..") {
    throw new Error("Invalid asset file name");
  }
  return base;
};

const safeExtension = (originalName: string): string => {
  const ext = path.extname(originalName).toLowerCase();
  // Keep the extension conservative: letters/digits/dot only, max 10 chars.
  return /^\.[a-z0-9]{1,9}$/.test(ext) ? ext : "";
};

/** Absolute path for a stored asset file name (throws if it escapes). */
export const resolveAssetPath = (filePath: string): string => {
  const resolved = path.resolve(
    /* turbopackIgnore: true */ STORAGE_ROOT,
    safeBasename(filePath),
  );
  if (
    resolved !== STORAGE_ROOT &&
    !resolved.startsWith(`${STORAGE_ROOT}${path.sep}`)
  ) {
    throw new Error("Asset path escapes the storage root");
  }
  return resolved;
};

/** Persists an uploaded file and returns its stored (obfuscated) name. */
export const saveAssetFile = async (
  file: File,
  originalName: string,
): Promise<string> => {
  await mkdir(STORAGE_ROOT, { recursive: true });
  const storedName = `${Date.now()}-${randomBytes(8).toString("hex")}${safeExtension(originalName)}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(resolveAssetPath(storedName), bytes);
  return storedName;
};

/** Deletes a stored asset file. Missing files are ignored. */
export const deleteAssetFile = async (filePath: string): Promise<void> => {
  try {
    await unlink(resolveAssetPath(filePath));
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? (error as { code?: string }).code
        : undefined;
    if (code !== "ENOENT") {
      throw error;
    }
  }
};

/** Human-readable size lives in @/features/assets/format (client-safe). */
