import { Suspense } from "react";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminShell>
      <Suspense fallback={null}>{children}</Suspense>
    </AdminShell>
  );
}
