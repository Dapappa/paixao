"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { sidebarNavItems } from "@/config/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { useProfile } from "@/lib/hooks/use-profile";
import { motion } from "framer-motion";
import { NotificationBell } from "@/components/notifications/notification-bell";
import {
  SignOut,
  List,
  Gear,
  User,
} from "@phosphor-icons/react/ssr";
import { useState } from "react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/events": "Events",
  "/matches": "Matches",
  "/messages": "Messages",
  "/profile": "Profile",
  "/profile/edit": "Edit Profile",
  "/profile/photos": "Photos",
  "/profile/settings": "Settings",
  "/safety": "Safety",
  "/onboarding": "Onboarding",
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  // Try matching partial paths
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(path)) return title;
  }
  return "Paixão";
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName = profile?.display_name || "Anonymous";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const pageTitle = getPageTitle(pathname);

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center border-b border-[var(--color-border)] bg-background/80 backdrop-blur-xl px-4 md:px-6">
      {/* Mobile: Hamburger */}
      <div className="md:hidden">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <List weight="bold" className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-72 bg-[var(--color-surface)] border-[var(--color-border)] p-0"
          >
            <SheetHeader className="px-6 pt-6 pb-4">
              <SheetTitle className="font-serif text-2xl tracking-[0.15em] text-foreground text-left">
                PAIX<span className="text-[var(--color-accent)]">Ã</span>O
              </SheetTitle>
            </SheetHeader>
            <Separator className="bg-[var(--color-border)]" />
            <ScrollArea className="flex-1 px-3 py-4">
              <nav className="flex flex-col gap-1">
                {sidebarNavItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
                            : "text-muted-foreground hover:bg-[var(--color-surface-elevated)] hover:text-foreground"
                        )}
                      >
                        <Icon weight={isActive ? "fill" : "light"} className="h-5 w-5 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </ScrollArea>
            <Separator className="bg-[var(--color-border)]" />
            <div className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-[var(--color-border)]">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-[var(--color-accent-muted)] text-[var(--color-accent)] text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {displayName}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {profile?.subscription_tier || "Curious"} tier
                  </p>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile: Logo (centered) */}
      <div className="flex flex-1 items-center justify-center md:hidden">
        <Link href="/dashboard">
          <h1 className="font-serif text-2xl font-bold tracking-[0.18em] text-foreground">
            PAIX<span className="text-[var(--color-accent)]">Ã</span>O
          </h1>
        </Link>
      </div>

      {/* Desktop: Page title */}
      <div className="hidden md:flex md:flex-1 md:items-center">
        <motion.h2
          key={pageTitle}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-semibold text-foreground"
        >
          {pageTitle}
        </motion.h2>
      </div>

      {/* Right side: notifications + avatar */}
      <div className="flex items-center gap-2">
        <NotificationBell />

        {/* Desktop avatar dropdown */}
        <div className="hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-[var(--color-surface-elevated)]">
                <Avatar className="h-8 w-8 border border-[var(--color-border)]">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-[var(--color-accent-muted)] text-[var(--color-accent)] text-[10px] font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-[var(--color-surface)] border-[var(--color-border)]"
            >
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {profile?.subscription_tier || "Curious"} tier
                </p>
              </div>
              <DropdownMenuSeparator className="bg-[var(--color-border)]" />
              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="cursor-pointer"
              >
                <User weight="light" className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/profile/settings")}
                className="cursor-pointer"
              >
                <Gear weight="light" className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[var(--color-border)]" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-[var(--color-danger)] focus:text-[var(--color-danger)]"
              >
                <SignOut weight="light" className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
