import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { brandAssets } from "@/features/assets/brand-schema";
import { brands } from "@/features/brand/schema";
import { requireWorkspaceRole } from "@/features/workspace/server/gate";
import { db } from "@/shared/lib/db";

/** Browser File/FormData entry; validated for type+size during ingestion. */
export const uploadedFileSchema = z.custom<{
  name: string;
  type: string;
  size: number;
  arrayBuffer(): Promise<ArrayBuffer>;
}>((value) => {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { name?: string }).name === "string" &&
    typeof (value as { arrayBuffer?: unknown }).arrayBuffer === "function"
  );
}, "Expected a file upload");

export const variantRulesSchema = z.object({
  minDisplayPct: z.number().min(0.1).max(100).nullable().optional(),
  clearSpace: z.enum(["1x", "0.5x", "none"]).optional(),
  orientation: z.enum(["any", "landscape", "portrait", "square"]).optional(),
  tile: z
    .object({
      color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      radius: z.number().min(0).max(64),
    })
    .nullable()
    .optional(),
});

/** Resolves a brand and enforces admin on its workspace. */
export const requireBrandAdmin = async (headers: Headers, brandId: string) => {
  const brand = await db.query.brands.findFirst({
    where: eq(brands.id, brandId),
  });
  if (!brand) {
    throw new ORPCError("NOT_FOUND", { message: "Brand not found" });
  }
  await requireWorkspaceRole(headers, brand.workspaceId, "admin");
  return brand;
};

/** Resolves an asset and enforces admin on its brand's workspace. */
export const requireAssetAdmin = async (headers: Headers, assetId: string) => {
  const asset = await db.query.brandAssets.findFirst({
    where: eq(brandAssets.id, assetId),
  });
  if (!asset) {
    throw new ORPCError("NOT_FOUND", { message: "Asset not found" });
  }
  await requireBrandAdmin(headers, asset.brandId);
  return asset;
};
