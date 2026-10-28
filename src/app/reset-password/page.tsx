import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

/** Suspense: the form reads the token from URL search params (nuqs). */
const ResetPasswordPage = () => (
  <Suspense fallback={null}>
    <ResetPasswordForm />
  </Suspense>
);

export default ResetPasswordPage;
