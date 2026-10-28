import { randomBytes } from "node:crypto";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "@/shared/env.server";
import type { StorageAdapter, StoredObject } from "@/shared/lib/storage/types";

/**
 * Disk-backed storage adapter. Objects live under UPLOAD_DIR (default
 * <cwd>/storage/assets) - outside public/, so files are only reachable
 * through the guarded file routes.
 */
const ROOT = path.resolve(
  /* turbopackIgnore: true */ process.cwd(),
  env.UPLOAD_DIR,
);

const resolveKey = (key: string): string => {
  const resolved = path.resolve(/* turbopackIgnore: true */ ROOT, key);
  if (resolved !== ROOT && !resolved.startsWith(`${ROOT}${path.sep}`)) {
    throw new Error("Storage key escapes the storage root");
  }
  return resolved;
};

export const diskStorage: StorageAdapter = {
  async put(key, data, contentType): Promise<StoredObject> {
    const target = resolveKey(key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, data);
    return { key, size: data.length, contentType };
  },

  async get(key): Promise<Buffer> {
    return await readFile(resolveKey(key));
  },

  async remove(key): Promise<void> {
    await rm(resolveKey(key), { force: true });
  },

  async exists(key): Promise<boolean> {
    try {
      return (await stat(resolveKey(key))).isFile();
    } catch {
      return false;
    }
  },
};

/** Unique-ish suffix for temp objects (sheet uploads before asset ids exist). */
export const tempSuffix = (ext: string): string =>
  `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
