import { z } from "zod";

/**
 * Server-side environment. Parsed once on module load; hard-fails on invalid
 * values. `process.env` may only be read here and in `@/shared/env` -
 * everything else imports a validated `env` object.
 */

/** Values shipped in older `.env.example` files - rejected in production. */
const KNOWN_BAD_SECRETS = new Set(["development_secret_key"]);

const serverSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    SUPER_ADMIN_EMAIL: z.string().email().optional(),
    SUPER_ADMIN_PASSWORD: z.string().min(8).optional(),
    /** Password-reset emails (Resend). Optional - unset logs links instead. */
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().optional(),
    NEXT_PUBLIC_API_URL: z.string().url(),
    /**
     * Root directory for on-disk asset storage. Local-disk storage (no object
     * storage) - defaults to <cwd>/storage/assets, outside public/ so files
     * are only downloadable through the guarded /api/assets/[id]/file route.
     * Override in production to a mounted volume.
     */
    UPLOAD_DIR: z.string().min(1).default("storage/assets"),
  })
  .superRefine((value, ctx) => {
    if (value.NODE_ENV !== "production") {
      return;
    }
    if (
      value.BETTER_AUTH_SECRET.length < 32 ||
      KNOWN_BAD_SECRETS.has(value.BETTER_AUTH_SECRET)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["BETTER_AUTH_SECRET"],
        message:
          "BETTER_AUTH_SECRET must be a strong, non-example secret in production (32+ characters)",
      });
    }
  });

export const env = serverSchema.parse({
  ...process.env,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});
