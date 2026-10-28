import type { Metadata } from "next";
import { DashboardView } from "@/features/audit/components/DashboardView";

export const metadata: Metadata = {
  title: "Dashboard",
};

/** Server shell for the dashboard - client stats live in DashboardView. */
const DashboardPage = () => <DashboardView />;

export default DashboardPage;
