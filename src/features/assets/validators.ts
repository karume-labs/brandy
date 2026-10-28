import { z } from "zod";
import { paginationSchema } from "@/shared/validators";

/** Filters accepted by every asset list procedure. */
const listFilters = {
  /** Free-text search across name/description. */
  q: z.string().trim().max(200).optional(),
  category: z.string().trim().max(60).optional(),
};

/** Admin list: everything, paginated. */
export const listAssetsSchema = paginationSchema.extend(listFilters);

/** Public list: only assets flagged `isPublic`. */
export const publicListAssetsSchema = paginationSchema.extend({
  q: listFilters.q,
});

export const createAssetSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).optional(),
  category: z.string().trim().max(60).optional(),
  isPublic: z.boolean().default(true),
});

export const updateAssetSchema = createAssetSchema.partial().extend({
  id: z.string().min(1),
});

export const deleteAssetSchema = z.object({ id: z.string().min(1) });

export type ListAssetsInput = z.infer<typeof listAssetsSchema>;
export type PublicListAssetsInput = z.infer<typeof publicListAssetsSchema>;
export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type DeleteAssetInput = z.infer<typeof deleteAssetSchema>;
