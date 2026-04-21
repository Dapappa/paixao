"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

interface AuthenticatedShellProps {
  children: React.ReactNode;
  onboardingCompleted: boolean;
}

export function AuthenticatedShell({
  children,
  onboardingCompleted,
}: AuthenticatedShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isOnboardingPage = pathname.startsWith("/onboarding");

  useEffect(() => {
    if (!onboardingCompleted && !isOnboardingPage) {
      router.replace("/onboarding");
    }
  }, [onboardingCompleted, isOnboardingPage, router]);

  // During onboarding, show a minimal layout
  if (isOnboardingPage) {
    return (
      <div className="min-h-dvh bg-background">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <Sidebar />
      <div className="md:pl-64">
        <Header />
        <main className="min-h-[calc(100dvh-4rem)] pb-20 md:pb-0">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
