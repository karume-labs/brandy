import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpcQuery } from "@/shared/lib/orpc-client";

/** Brands inside a workspace (primary first). */
export const useBrands = (workspaceId: string | null) => {
  return useQuery(
    orpcQuery.brands.list.queryOptions({
      input: { workspaceId: workspaceId ?? "" },
      enabled: Boolean(workspaceId),
    }),
  );
};

/** Full brand bundle: row + colors + gradients + typography + prompts. */
export const useBrand = (brandId: string | null) => {
  return useQuery(
    orpcQuery.brands.get.queryOptions({
      input: { brandId: brandId ?? "" },
      enabled: Boolean(brandId),
    }),
  );
};

/** Re-runs the brand bundle (and the workspace's brand list) after a write. */
const useBrandInvalidator = (brandId: string) => {
  const queryClient = useQueryClient();
  return () => {
    if (brandId) {
      void queryClient.invalidateQueries({
        queryKey: orpcQuery.brands.get.key({ input: { brandId } }),
      });
    }
    void queryClient.invalidateQueries({
      queryKey: orpcQuery.brands.list.key(),
    });
  };
};

export const useCreateBrand = () => {
  const invalidate = useBrandInvalidator("");
  return useMutation({
    ...orpcQuery.brands.create.mutationOptions(),
    onSuccess: invalidate,
  });
};

export const useUpsertColor = (brandId: string) => {
  const invalidate = useBrandInvalidator(brandId);
  return useMutation({
    ...orpcQuery.brands.upsertColor.mutationOptions(),
    onSuccess: invalidate,
  });
};

export const useRemoveColor = (brandId: string) => {
  const invalidate = useBrandInvalidator(brandId);
  return useMutation({
    ...orpcQuery.brands.removeColor.mutationOptions(),
    onSuccess: invalidate,
  });
};

export const useUpsertPrompt = (brandId: string) => {
  const invalidate = useBrandInvalidator(brandId);
  return useMutation({
    ...orpcQuery.brands.upsertPrompt.mutationOptions(),
    onSuccess: invalidate,
  });
};

export const useRemovePrompt = (brandId: string) => {
  const invalidate = useBrandInvalidator(brandId);
  return useMutation({
    ...orpcQuery.brands.removePrompt.mutationOptions(),
    onSuccess: invalidate,
  });
};
