"use client";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ORPCError } from "@orpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { theme } from "@/shared/theme";

/** Fresh data for a minute; lists/stats don't need to be hotter. */
const STALE_TIME_MS = 60 * 1000;
/** Don't refire every query when the user alt-tabs back to the window. */
const REFETCH_ON_WINDOW_FOCUS = false;
/** Client errors (401/403/404/429) won't heal on retry; 5xx gets two tries. */
const MAX_RETRIES = 2;

const shouldRetry = (failureCount: number, error: unknown): boolean => {
  if (error instanceof ORPCError) {
    return error.status < 400 || error.status >= 500
      ? failureCount < MAX_RETRIES
      : false;
  }
  return failureCount < MAX_RETRIES;
};

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: STALE_TIME_MS,
            refetchOnWindowFocus: REFETCH_ON_WINDOW_FOCUS,
            retry: shouldRetry,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <Notifications position="bottom-right" />
        {children}
      </MantineProvider>
    </QueryClientProvider>
  );
};
