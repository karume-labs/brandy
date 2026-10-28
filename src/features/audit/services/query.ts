import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuditAction } from "@/features/audit/constants";
import { orpcQuery } from "@/shared/lib/orpc-client";

/** One server-sliced page of audit entries (newest first) + total count. */
export const useAuditLogs = (
  page: number,
  pageSize: number,
  action?: AuditAction,
) => {
  return useQuery(
    orpcQuery.audit.list.queryOptions({
      input: { page, pageSize, action },
    }),
  );
};

/** Dashboard stats: counts per entity + latest 8 audit entries. */
export const useDashboardStats = () => {
  return useQuery(orpcQuery.audit.stats.queryOptions());
};

/**
 * Returns a callback that invalidates every list/stats query affected by
 * asset/user mutations (assets, audit log + stats).
 */
export const useInvalidateData = () => {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({
      queryKey: orpcQuery.assets.list.key(),
    });
    void queryClient.invalidateQueries({
      queryKey: orpcQuery.audit.list.key(),
    });
    void queryClient.invalidateQueries({
      queryKey: orpcQuery.audit.stats.key(),
    });
  };
};
