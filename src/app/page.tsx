import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicAssetsPage } from "@/features/assets/components/PublicAssetsPage";

export const metadata: Metadata = {
  title: "Brandy Asset Library",
  description:
    "Public branding assets - browse and download without an account",
};

/**
 * The landing page is the public asset library - no sign-in needed. The
 * admin dashboard lives at /admin behind the session gate (unauthenticated
 * visitors are bounced to /admin/sign-in).
 */
const Home = () => (
  // Suspense: PublicAssetsPage reads URL search params (nuqs) for paging.
  <Suspense fallback={null}>
    <PublicAssetsPage />
  </Suspense>
);

export default Home;
