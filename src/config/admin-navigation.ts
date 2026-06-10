import type { ComponentType } from "react";
import {
  Warning,
  ChartBar,
  CalendarDots,
  ClipboardText,
  House,
  ShieldCheck,
  UserCheck,
  UsersThree,
} from "@phosphor-icons/react/ssr";

/** Phosphor icon component shape (works for both /ssr and client icons). */
export type NavIcon = ComponentType<{
  className?: string;
  size?: number;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
}>;

export interface AdminNavItem {
  label: string;
  href: string;
  icon: NavIcon;
  description?: string;
}

export const adminNavItems: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: House,
    description: "Overview and key metrics",
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: UsersThree,
    description: "Manage user accounts",
  },
  {
    label: "Waitlist",
    href: "/admin/waitlist",
    icon: ClipboardText,
    description: "Pre-sale signups and founding members",
  },
  {
    label: "Events",
    href: "/admin/events",
    icon: CalendarDots,
    description: "Event moderation and management",
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: Warning,
    description: "Review and resolve reports",
  },
  {
    label: "Hosts",
    href: "/admin/hosts",
    icon: UserCheck,
    description: "Host applications",
  },
  {
    label: "Verification",
    href: "/admin/verification",
    icon: ShieldCheck,
    description: "Identity verification queue",
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: ChartBar,
    description: "Platform analytics and trends",
  },
];
