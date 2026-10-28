import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpcQuery } from "@/shared/lib/orpc-client";

/** Workspaces the session user can enter. */
export const useWorkspaces = () => {
  return useQuery(orpcQuery.workspaces.list.queryOptions());
};

/** Corporate anchors only (for the subsidiary picker). */
export const useAnchorWorkspaces = () => {
  return useQuery(orpcQuery.workspaces.anchors.queryOptions());
};

export const useWorkspaceMembers = (workspaceId: string | null) => {
  return useQuery(
    orpcQuery.workspaces.members.queryOptions({
      input: { workspaceId: workspaceId ?? "" },
      enabled: Boolean(workspaceId),
    }),
  );
};

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...orpcQuery.workspaces.create.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: orpcQuery.workspaces.list.key(),
      });
      void queryClient.invalidateQueries({
        queryKey: orpcQuery.workspaces.anchors.key(),
      });
    },
  });
};
