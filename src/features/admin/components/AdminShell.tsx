"use client";

import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { AdminNavbar } from "@/features/admin/components/AdminNavbar";
import { authClient } from "@/features/auth/client";
import { IdleTimeoutModal } from "@/features/auth/components/IdleTimeoutModal";
import { WorkspaceProvider } from "@/features/workspace/context";
import { notify } from "@/shared/lib/notifications";

const HEADER_HEIGHT = 76;
const SIDEBAR_WIDTH_EXPANDED = 260;
const SIDEBAR_WIDTH_COLLAPSED = 96;
const SIDEBAR_STORAGE_KEY = "brandy-sidebar-expanded";

interface AdminShellProps {
  children: React.ReactNode;
}

/** Session-gated app frame: header, collapsible sidebar, idle timeout. */
export const AdminShell: React.FC<AdminShellProps> = ({ children }) => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(false);
  const [isExpanded, setIsExpanded] = useLocalStorage({
    key: SIDEBAR_STORAGE_KEY,
    defaultValue: true,
  });

  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { setColorScheme } = useMantineColorScheme();
  const colorScheme = useComputedColorScheme("light");

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [session, isPending, router]);

  const isDark = colorScheme === "dark";

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      router.push("/sign-in");
      router.refresh();
    } catch (error: unknown) {
      notify.error(
        "Sign out failed",
        error instanceof Error ? error.message : "Please try again.",
      );
      setIsSigningOut(false);
    }
  };

  return (
    <WorkspaceProvider>
      <AppShell
        layout="alt"
        header={{ height: HEADER_HEIGHT }}
        navbar={{
          width: isExpanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED,
          breakpoint: "md",
          collapsed: { mobile: !mobileOpened },
        }}
        padding="md"
      >
        <AppShellHeader withBorder={false} px="md" pt="md" bg="transparent">
          <AdminHeader
            user={session?.user}
            isExpanded={isExpanded}
            isDark={isDark}
            isSigningOut={isSigningOut}
            mobileOpened={mobileOpened}
            onToggleSidebar={() => setIsExpanded((o) => !o)}
            onToggleMobile={toggleMobile}
            onToggleColorScheme={() =>
              setColorScheme(isDark ? "light" : "dark")
            }
            onSignOut={handleSignOut}
          />
        </AppShellHeader>

        <AdminNavbar
          isExpanded={isExpanded}
          mobileOpened={mobileOpened}
          toggleMobile={toggleMobile}
        />

        <AppShellMain>{children}</AppShellMain>

        {session && <IdleTimeoutModal />}
      </AppShell>
    </WorkspaceProvider>
  );
};
