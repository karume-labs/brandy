import { z } from "zod";

/**
 * Server-side pagination contract shared by every list procedure.
 * `pageSize` is capped so a single request can never scan an unbounded set.
 */
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

/** offset for a 1-based page number. */
export const offsetForPage = (page: number, pageSize: number): number =>
  (page - 1) * pageSize;
