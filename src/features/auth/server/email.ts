import { env } from "@/shared/env.server";

interface ResetPasswordEmailInput {
  user: { name?: string | null; email: string };
  /** Absolute URL that validates the token and redirects to /admin/reset-password */
  url: string;
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);

const buildResetPasswordHtml = (name: string, email: string, url: string) => `
<html>
  <body style="font-family: Inter, Arial, sans-serif; background-color: #f3ecdd; padding: 40px; margin: 0;">
    <div style="max-width: 520px; margin: 0 auto; background-color: #fbf6ec; border: 1px solid #dcd2c2; border-radius: 16px; padding: 32px;">
      <div style="text-align: center; font-size: 24px; font-weight: 700; color: #a8570a; margin-bottom: 24px; font-family: Georgia, serif;">
        Brandy
      </div>
      <p style="color: #1d1410;">Hello ${escapeHtml(name)},</p>
      <p style="color: #1d1410;">
        We received a request to reset the password for
        <strong>${escapeHtml(email)}</strong>. Click the button below to choose
        a new password:
      </p>
      <p style="text-align: center; margin: 28px 0;">
        <a
          href="${escapeHtml(url)}"
          style="background-color: #a8570a; color: #fbf6ec; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: 700; display: inline-block;"
        >
          Reset my password
        </a>
      </p>
      <p style="font-size: 14px; color: #7a6d61;">
        This link can only be used once and expires in 15 minutes. If you did
        not request a password reset, you can safely ignore this email.
      </p>
      <p style="font-size: 12px; color: #7a6d61; word-break: break-all;">
        If the button does not work, copy and paste this link into your
        browser:<br />${escapeHtml(url)}
      </p>
    </div>
  </body>
</html>`;

/**
 * Sends the password reset email via the Resend HTTP API (no SDK
 * dependency). Without an API key the link is logged to the server console
 * so the flow stays testable in local development.
 */
export const sendResetPasswordEmail = async ({
  user,
  url,
}: ResetPasswordEmailInput): Promise<void> => {
  const html = buildResetPasswordHtml(user.name || "there", user.email, url);

  if (!env.RESEND_API_KEY) {
    // Reset links are secrets: only surface them outside production.
    if (env.NODE_ENV === "production") {
      console.error(
        `[auth] RESEND_API_KEY is not set - cannot email a reset link to ${user.email}`,
      );
      return;
    }
    console.warn(
      `[auth] RESEND_API_KEY is not set - password reset link for ${user.email}: ${url}`,
    );
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM || "Brandy <no-reply@brandy.app>",
        to: [user.email],
        subject: "Reset your Brandy password",
        html,
      }),
    });

    if (!response.ok) {
      console.error(
        `[auth] Failed to send password reset email (${response.status}): ${await response.text()}`,
      );
    }
  } catch (error) {
    console.error("[auth] Failed to send password reset email:", error);
  }
};
