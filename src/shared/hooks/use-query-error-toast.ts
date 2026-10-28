import { useEffect, useRef } from "react";
import { notify } from "@/shared/lib/notifications";

/**
 * Fires exactly one error notification per distinct query error:
 * toast fires once, never spams on refetch/re-render, and clears when the
 * error resolves.
 */
export const useQueryErrorToast = (error: unknown, title: string): void => {
  const lastMessage = useRef<string | null>(null);

  useEffect(() => {
    if (!error) {
      lastMessage.current = null;
      return;
    }
    const message =
      error instanceof Error
        ? error.message
        : "The request failed. Please try again.";
    if (lastMessage.current === message) {
      return;
    }
    lastMessage.current = message;
    notify.error(title, message);
  }, [error, title]);
};
