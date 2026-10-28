import { os } from "@orpc/server";

/**
 * Shared oRPC instance. All procedures run in the request context of the
 * incoming headers.
 */
export const osServer = os.$context<{ headers: Headers }>();
