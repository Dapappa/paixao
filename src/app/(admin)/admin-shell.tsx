"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { adminNavItems } from "@/config/admin-navigation";
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
import { motion, AnimatePresence } from "framer-motion";
import {
  CaretRight,
  SignOut,
  List,
  CaretDoubleLeft,
  Gear,
} from "@phosphor-icons/react/ssr";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

interface AdminShellProps {
  children: React.ReactNode;
  user: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    role: string;
  };
}

export function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = user.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Build breadcrumbs from pathname
  const breadcrumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const crumbs: { label: string; href: string }[] = [];
    let path = "";
    for (const segment of segments) {
      path += `/${segment}`;
      const navItem = adminNavItems.find((item) => item.href === path);
      crumbs.push({
        label: navItem?.label || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: path,
      });
    }
    return crumbs;
  }, [pathname]);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <h1 className="font-serif text-xl tracking-[0.15em] text-white">
            PASSION
            <span className="text-[#c2185b]">D</span>EN
          </h1>
          <span className="ml-1 rounded bg-[#c2185b]/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#c2185b]">
            Admin
          </span>
        </Link>
      </div>

      <Separator className="bg-white/[0.06]" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {adminNavItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            const iconWeight = isActive ? "fill" : "light";

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
              >
                <motion.div
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[#c2185b]/10 text-[#c2185b]"
                      : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="admin-sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3px] rounded-r-full bg-[#c2185b]"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  <Icon
                    weight={iconWeight}
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive ? "text-[#c2185b]" : "text-zinc-500 group-hover:text-zinc-300"
                    )}
                  />
                  <span>{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-white/[0.06]" />

      {/* Back to main app */}
      <div className="p-3">
        <Link href="/dashboard">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-300">
            <CaretDoubleLeft weight="bold" className="h-5 w-5 shrink-0" />
            <span>Back to App</span>
          </div>
        </Link>
      </div>

      {/* Admin user */}
      <div className="p-3 pt-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]">
              <Avatar className="h-9 w-9 border border-white/10">
                <AvatarImage src={user.avatarUrl || undefined} />
                <AvatarFallback className="bg-[#c2185b]/20 text-[#c2185b] text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-zinc-200">
                  {user.displayName}
                </p>
                <p className="truncate text-xs capitalize text-zinc-500">
                  {user.role}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="w-56 bg-zinc-900 border-zinc-800"
          >
            <DropdownMenuItem
              onClick={() => router.push("/profile/settings")}
              className="cursor-pointer text-zinc-300 focus:bg-white/[0.06] focus:text-white"
            >
              <Gear weight="light" className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem
              onClick={() => router.push("/auth/login")}
              className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400"
            >
              <SignOut weight="light" className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  return (
    <div className="min-h-dvh bg-[#141414]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
        <div className="flex h-full flex-col bg-[#0a0a0a] border-r border-white/[0.06]">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-64 md:hidden"
            >
              <div className="flex h-full flex-col bg-[#0a0a0a] border-r border-white/[0.06]">
                {sidebarContent}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="md:pl-64">
        {/* Top header bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-white/[0.06] bg-[#141414]/80 px-4 backdrop-blur-xl md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-zinc-400 hover:text-white hover:bg-white/[0.06]"
            onClick={() => setSidebarOpen(true)}
          >
            <List weight="bold" className="h-5 w-5" />
          </Button>

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-sm">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1.5">
                {i > 0 && (
                  <CaretRight weight="bold" className="h-3.5 w-3.5 text-zinc-600" />
                )}
                {i === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-zinc-200">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-zinc-500 transition-colors hover:text-zinc-300"
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Admin avatar */}
          <Avatar className="h-8 w-8 border border-white/10">
            <AvatarImage src={user.avatarUrl || undefined} />
            <AvatarFallback className="bg-[#c2185b]/20 text-[#c2185b] text-[10px] font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100dvh-3.5rem)] p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
