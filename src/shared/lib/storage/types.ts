/**
 * Storage abstraction. Today it is backed by local disk; swapping in an
 * S3-compatible adapter (MinIO/B2) later only requires a second
 * implementation - features never touch paths directly.
 */
export interface StoredObject {
  key: string;
  size: number;
  contentType: string;
}

export interface StorageAdapter {
  /** Writes an object under `key` (keys are app-generated, e.g. `assets/<id>/v1.png`). */
  put(key: string, data: Buffer, contentType: string): Promise<StoredObject>;
  /** Reads the whole object. Throws ENOENT-equivalent when missing. */
  get(key: string): Promise<Buffer>;
  /** Best-effort delete; missing objects are not an error. */
  remove(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

/** Builds a storage key that can never escape the storage root. */
export const safeKey = (...parts: string[]): string => {
  const key = parts
    .join("/")
    .replace(/[^a-zA-Z0-9._/-]/g, "-")
    .replace(/\.\./g, "-")
    .replace(/^\/+/, "");
  if (!key) throw new Error("Empty storage key");
  return key;
};
