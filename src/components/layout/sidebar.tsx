"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { sidebarNavItems } from "@/config/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/hooks/use-auth";
import { useProfile } from "@/lib/hooks/use-profile";
import { motion } from "framer-motion";
import {
  CaretUp,
  SignOut,
  Gear,
  User,
  Sparkle,
} from "@phosphor-icons/react/ssr";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const { profile } = useProfile();

  const displayName = profile?.display_name || "Anonymous";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
      <div className="flex h-full flex-col bg-[var(--color-surface)] border-r border-[var(--color-border)]">
        {/* Logo */}
        <div className="flex h-20 items-center px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <h1 className="animate-breath font-serif text-3xl font-bold tracking-[0.18em] text-foreground">
              PAIX<span className="text-[var(--color-accent)]">Ã</span>O
            </h1>
          </Link>
        </div>

        <Separator className="bg-[var(--color-border)]" />

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-1">
            {sidebarNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/");
              const Icon = item.icon;

              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
                        : "text-muted-foreground hover:bg-[var(--color-surface-elevated)] hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 h-8 w-[3px] rounded-r-full bg-[var(--color-accent)]"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    <Icon
                      weight={isActive ? "fill" : "light"}
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        isActive
                          ? "text-[var(--color-accent)]"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-accent)] px-1.5 text-[10px] font-bold text-white">
                        {item.badge}
                      </span>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Subscription Upgrade CTA */}
        {profile?.subscription_tier === "curious" && (
          <div className="px-3 pb-2">
            <Link href="/profile/settings">
              <div className="rounded-xl bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--color-gold)]/10 border border-[var(--color-accent)]/20 p-3 transition-all hover:border-[var(--color-accent)]/40">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkle weight="fill" className="h-4 w-4 text-[var(--color-gold)]" />
                  <span className="text-xs font-semibold text-[var(--color-gold)]">
                    Upgrade
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Unlock unlimited matches & messages
                </p>
              </div>
            </Link>
          </div>
        )}

        <Separator className="bg-[var(--color-border)]" />

        {/* User Profile */}
        <div className="p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[var(--color-surface-elevated)]">
                <Avatar className="h-9 w-9 border border-[var(--color-border)]">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-[var(--color-accent-muted)] text-[var(--color-accent)] text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium text-foreground">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground capitalize">
                    {profile?.subscription_tier || "Curious"} tier
                  </p>
                </div>
                <CaretUp weight="bold" className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              className="w-56 bg-[var(--color-surface)] border-[var(--color-border)]"
            >
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
    </aside>
  );
}
