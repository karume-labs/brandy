import { z } from "zod";
import { ROLE_PERMISSIONS } from "@/features/auth/roles";

// ---------------------------------------------------------------------------
// Auth schemas (sign-in / password reset)
// ---------------------------------------------------------------------------

export const signInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(128, "Password must be at most 128 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ---------------------------------------------------------------------------
// User management schemas (admin CRUD)
// ---------------------------------------------------------------------------

export const roleEnum = z.enum(
  Object.keys(ROLE_PERMISSIONS) as [string, ...string[]],
);

/** Shared base fields for a user (name/email/role/permissions). */
const userBaseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  role: roleEnum,
  permissions: z.array(z.string()).optional(),
});

/** Password field rules — reused across create and update. */
const passwordRequired = z
  .string()
  .min(8, "Password must be at least 8 characters long");

export const createUserSchema = userBaseSchema.extend({
  password: passwordRequired,
});

export const updateUserSchema = userBaseSchema.extend({
  id: z.string(),
  password: passwordRequired.optional(),
});

export const updateRoleSchema = z.object({
  id: z.string(),
  role: roleEnum,
});

export const deleteUserSchema = z.object({ id: z.string() });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
