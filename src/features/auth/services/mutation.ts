import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/features/auth/client";
import type {
  ForgotPasswordInput,
  ResetPasswordInput,
  SignInInput,
} from "@/features/auth/validators";
import { env } from "@/shared/env";

const authEndpoint = (path: string) =>
  `${env.NEXT_PUBLIC_API_URL}/api/auth${path}`;

export const useSignIn = () => {
  return useMutation({
    mutationFn: async (input: SignInInput) => {
      const { error } = await authClient.signIn.email(input);
      if (error) throw new Error(error.message || "Failed to sign in");
    },
  });
};

/** Step 1 of the reset flow: asks Better Auth to email a reset link. */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (input: ForgotPasswordInput) => {
      const response = await fetch(authEndpoint("/request-password-reset"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: input.email,
          redirectTo: `${env.NEXT_PUBLIC_API_URL}/admin/reset-password`,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          data?.message || "Could not send the reset link. Please try again.",
        );
      }
      return data;
    },
  });
};

/** Step 2 of the reset flow: exchanges the emailed token for a new password. */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (
      input: ResetPasswordInput & { token: string },
    ): Promise<void> => {
      const response = await fetch(authEndpoint("/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword: input.password,
          token: input.token,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          data?.message ||
            "This reset link is invalid or has expired. Please request a new one.",
        );
      }
    },
  });
};
