import { useQuery } from "@tanstack/react-query";
import { orpcQuery } from "@/shared/lib/orpc-client";

/** Direct download/preview URL for an asset (honours isPublic server-side). */
export const assetFileUrl = (id: string): string => `/api/assets/${id}/file`;

/** Admin list of all assets (session required by the procedure). */
export const useAssets = (page: number, pageSize: number, q?: string) => {
  return useQuery(
    orpcQuery.assets.list.queryOptions({ input: { page, pageSize, q } }),
  );
};

/** Public list of `isPublic` assets - usable without signing in. */
export const usePublicAssets = (page: number, pageSize: number, q?: string) => {
  return useQuery(
    orpcQuery.assets.publicList.queryOptions({ input: { page, pageSize, q } }),
  );
};
