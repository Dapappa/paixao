import type { ComponentType } from "react";
import {
  House,
  CalendarDots,
  Heart,
  ChatCircle,
  User,
  ShieldCheck,
} from "@phosphor-icons/react/ssr";

/** Phosphor icon component shape (works for both /ssr and client icons). */
export type NavIcon = ComponentType<{
  className?: string;
  size?: number;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
}>;

export interface NavItem {
  label: string;
  href: string;
  icon: NavIcon;
  badge?: string;
  description?: string;
}

export const sidebarNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: House,
    description: "Overview and activity feed",
  },
  {
    label: "Events",
    href: "/events",
    icon: CalendarDots,
    description: "Browse and manage events",
  },
  {
    label: "Matches",
    href: "/matches",
    icon: Heart,
    description: "Your connections and mutual interests",
  },
  {
    label: "Messages",
    href: "/messages",
    icon: ChatCircle,
    description: "Private conversations",
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
    description: "Your identity and preferences",
  },
  {
    label: "Safety",
    href: "/safety",
    icon: ShieldCheck,
    description: "Consent settings, blocks, and reporting",
  },
];
