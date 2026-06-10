"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { List, X } from "@phosphor-icons/react/ssr";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Guidelines", href: "/guidelines" },
];

const authLinks = [
  { label: "Log In", href: "/auth/login", variant: "ghost" as const },
  { label: "Sign Up", href: "/auth/signup", variant: "default" as const },
];

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide nav on age-gate page
  const isAgeGate = pathname === "/age-gate";

  if (isAgeGate) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold tracking-wider text-foreground">
              PAIX<span className="text-accent">Ã</span>O
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-foreground"
                    : "text-text-secondary hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="ml-4 h-5 w-px bg-border" />
            <div className="ml-3 flex items-center gap-2">
              {authLinks.map((link) => (
                <Button
                  key={link.href}
                  variant={link.variant}
                  size="sm"
                  asChild
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="rounded-md p-2 text-text-secondary hover:text-foreground md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" weight="bold" />
            ) : (
              <List className="h-5 w-5" weight="bold" />
            )}
          </button>
        </nav>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-surface text-foreground"
                      : "text-text-secondary hover:bg-surface hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="my-3 h-px bg-border" />
              <div className="flex flex-col gap-2 px-3">
                {authLinks.map((link) => (
                  <Button
                    key={link.href}
                    variant={link.variant}
                    size="sm"
                    asChild
                    className="w-full justify-center"
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </header>

      {/* Main content with top padding for fixed header */}
      <main className="flex-1 pt-16">{children}</main>
    </div>
  );
}
