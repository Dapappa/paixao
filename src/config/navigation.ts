import {
  CalendarDays,
  Heart,
  LayoutDashboard,
  MessageCircle,
  Shield,
  User,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  description?: string;
}

export const sidebarNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview and activity feed",
  },
  {
    label: "Events",
    href: "/events",
    icon: CalendarDays,
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
    icon: MessageCircle,
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
    icon: Shield,
    description: "Consent settings, blocks, and reporting",
  },
];
