"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  CalendarDots,
  Heart,
  House,
  ChatCircle,
  User,
} from "@phosphor-icons/react/ssr";

const mobileNavItems = [
  { label: "Home", href: "/dashboard", icon: House },
  { label: "Events", href: "/events", icon: CalendarDots },
  { label: "Matches", href: "/matches", icon: Heart },
  { label: "Messages", href: "/messages", icon: ChatCircle },
  { label: "Profile", href: "/profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-xl md:hidden">
      <div className="flex h-16 items-center justify-around px-2 pb-safe">
        {mobileNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center gap-1 px-3 py-1"
            >
              <div className="relative">
                <Icon
                  weight={isActive ? "fill" : "light"}
                  className={cn(
                    "h-6 w-6 transition-colors",
                    isActive
                      ? "text-[var(--color-accent)]"
                      : "text-muted-foreground"
                  )}
                />
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--color-accent)]"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive
                    ? "text-[var(--color-accent)]"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
