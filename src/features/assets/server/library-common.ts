import { or, sql } from "drizzle-orm";
import { z } from "zod";
import { assets } from "@/features/assets/schema";
import { paginationSchema } from "@/shared/validators";

const listFilters = {
  /** Free-text search across name/description. */
  q: z.string().trim().max(200).optional(),
  category: z.string().trim().max(60).optional(),
};

export const listAssetsSchema = paginationSchema.extend(listFilters);

export const publicListAssetsSchema = paginationSchema.extend({
  q: listFilters.q,
});

export const setVisibilitySchema = z.object({
  id: z.string().min(1),
  isPublic: z.boolean().optional(),
});

export const deleteAssetSchema = z.object({ id: z.string().min(1) });

/** Search across name/description. */
export const searchFilter = (q?: string) => {
  if (!q) return undefined;
  const pattern = `%${q}%`;
  return or(
    sql`${assets.name} ILIKE ${pattern}`,
    sql`${assets.description} ILIKE ${pattern}`,
  );
};
