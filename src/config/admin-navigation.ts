import {
  AlertTriangle,
  BarChart3,
  Calendar,
  LayoutDashboard,
  ShieldCheck,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

export const adminNavItems: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Overview and key metrics",
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
    description: "Manage user accounts",
  },
  {
    label: "Events",
    href: "/admin/events",
    icon: Calendar,
    description: "Event moderation and management",
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: AlertTriangle,
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
    icon: BarChart3,
    description: "Platform analytics and trends",
  },
];
