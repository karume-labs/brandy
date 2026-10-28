import { z } from "zod";

/**
 * Client-safe environment (NEXT_PUBLIC_* only). Parsed on module load.
 * Server secrets live in `@/shared/env.server` - never import that from a
 * client component.
 *
 * `NEXT_PUBLIC_API_URL` is required with no default: it drives the Better Auth
 * baseURL, the auth client, reset-email links and origin/CSRF checks, so a
 * missing value in a deployed environment must fail loudly instead of
 * silently targeting localhost.
 */
const clientSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
});

export const env = clientSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});
