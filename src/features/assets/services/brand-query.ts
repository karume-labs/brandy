import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpcQuery } from "@/shared/lib/orpc-client";

/** Sheet + variant assets for a brand, active version resolved. */
export const useBrandAssets = (brandId: string | null) => {
  return useQuery(
    orpcQuery.brandAssets.listByBrand.queryOptions({
      input: { brandId: brandId ?? "" },
      enabled: Boolean(brandId),
    }),
  );
};

/** Bytes for an asset's active version (visibility enforced server-side). */
export const brandAssetFileUrl = (assetId: string): string =>
  `/api/brand-assets/${assetId}/file`;

/** Drag-and-drop master sheet -> segmented, background-stripped variants. */
export const useIngestSheet = (brandId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    ...orpcQuery.brandAssets.ingestSheet.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: orpcQuery.brandAssets.listByBrand.key({
          input: { brandId },
        }),
      });
    },
  });
};

/** Upload a replacement file as a new immutable version. */
export const useUploadAssetVersion = (brandId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    ...orpcQuery.brandAssets.uploadVersion.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: orpcQuery.brandAssets.listByBrand.key({
          input: { brandId },
        }),
      });
    },
  });
};
