"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { WorkspaceWithMeta } from "@/features/workspace/server/router";
import { useWorkspaces } from "@/features/workspace/services/query";

const STORAGE_KEY = "brandy-active-workspace";

interface WorkspaceContextValue {
  workspaces: WorkspaceWithMeta[];
  activeWorkspaceId: string | null;
  activeWorkspace: WorkspaceWithMeta | null;
  setActiveWorkspaceId: (id: string) => void;
  isPending: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

/**
 * Active-workspace state for the whole admin shell. Persisted so a reload
 * lands on the same cellar; falls back to the first available workspace.
 */
export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: workspaces, isPending } = useWorkspaces();
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const exists = workspaces?.some((w) => w.id === saved);
    if (exists && saved) {
      setActiveWorkspaceId(saved);
    } else if (workspaces && workspaces.length > 0 && !activeWorkspaceId) {
      setActiveWorkspaceId(workspaces[0]?.id ?? null);
    }
  }, [workspaces, activeWorkspaceId]);

  const selectWorkspace = useCallback((id: string) => {
    setActiveWorkspaceId(id);
    window.localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const value = useMemo<WorkspaceContextValue>(() => {
    const active = workspaces?.find((w) => w.id === activeWorkspaceId) ?? null;
    return {
      workspaces: workspaces ?? [],
      activeWorkspaceId: active?.id ?? null,
      activeWorkspace: active,
      setActiveWorkspaceId: selectWorkspace,
      isPending,
    };
  }, [workspaces, activeWorkspaceId, isPending, selectWorkspace]);

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useActiveWorkspace = (): WorkspaceContextValue => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useActiveWorkspace must be used inside WorkspaceProvider");
  }
  return context;
};
