import { extname } from "node:path";
import type { UploadedFile } from "@/features/assets/server/asset-upload";

/** Where the manually-managed branding material currently lives. */
export const BRANDING_DIR = "/home/karume/Downloads/branding";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const titleize = (slug: string): string =>
  slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

/** Brand slug ("go-play") from go-play-logo-sheet.jpg / go-play-brand-guide.pdf. */
export const brandSlug = (entry: string): string | null => {
  const match = entry.match(/^(.+?)-(logo-sheet|brand-guide)\./i);
  return match?.[1] ? slugify(match[1]) : null;
};

/** File -> browser-shaped upload the ingestion pipeline accepts. */
export const fileAsUpload = (
  buffer: Buffer,
  name: string,
  type: string,
): UploadedFile => ({
  name,
  type,
  size: buffer.length,
  arrayBuffer: async () =>
    buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as ArrayBuffer,
});

export const mimeFor = (fileName: string): string =>
  MIME_BY_EXT[extname(fileName).toLowerCase()] ?? "application/octet-stream";

/**
 * One brand per logo sheet / guide. A guide whose slug prefixes a sheet slug
 * (townlink-brand-guide vs townlink-limited-logo-sheet) belongs to that
 * brand - don't fork a second, empty one.
 */
export const targetSlugs = (entries: string[]): string[] => {
  const all = new Set(entries.map(brandSlug).filter((s) => s !== null));
  const sheets = new Set(
    entries.filter((entry) => /-logo-sheet\./i.test(entry)).map(brandSlug),
  );

  return [...all].filter(
    (slug) =>
      sheets.has(slug) ||
      ![...sheets].some((sheet) => sheet?.startsWith(`${slug}-`)),
  );
};
