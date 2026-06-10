"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  CalendarDots,
  CheckCircle,
  Heart,
  ChatCircle,
  Shield,
  Sparkle,
  Star,
  UserCheck,
  XCircle,
  CreditCard,
  Warning,
} from "@phosphor-icons/react/ssr";
import type { Notification } from "@/lib/hooks/use-notifications";

/* ─────────────────────────────────────────────
   Icon mapping by notification type
   ───────────────────────────────────────────── */

const typeConfig: Record<
  string,
  { icon: typeof Bell; color: string; bgColor: string }
> = {
  new_match: {
    icon: Heart,
    color: "text-[var(--color-accent)]",
    bgColor: "bg-[var(--color-accent)]/10",
  },
  match_suggestion: {
    icon: Sparkle,
    color: "text-[var(--color-gold)]",
    bgColor: "bg-[var(--color-gold)]/10",
  },
  new_message: {
    icon: ChatCircle,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  event_reminder: {
    icon: CalendarDots,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  event_update: {
    icon: CalendarDots,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  registration_confirmed: {
    icon: CheckCircle,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  report_update: {
    icon: Shield,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
  },
  consent_request: {
    icon: Warning,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
  },
  system_announcement: {
    icon: Bell,
    color: "text-zinc-400",
    bgColor: "bg-zinc-500/10",
  },
  verification_approved: {
    icon: UserCheck,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  verification_rejected: {
    icon: XCircle,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
  },
  host_application_update: {
    icon: Star,
    color: "text-[var(--color-gold)]",
    bgColor: "bg-[var(--color-gold)]/10",
  },
  subscription_expiring: {
    icon: CreditCard,
    color: "text-[var(--color-gold)]",
    bgColor: "bg-[var(--color-gold)]/10",
  },
};

const defaultConfig = {
  icon: Bell,
  color: "text-zinc-400",
  bgColor: "bg-zinc-500/10",
};

/* ─────────────────────────────────────────────
   Component
   ───────────────────────────────────────────── */

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  compact?: boolean;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  compact = false,
}: NotificationItemProps) {
  const config = typeConfig[notification.type] ?? defaultConfig;
  const Icon = config.icon;

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
  });

  const handleClick = () => {
    if (!notification.is_read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative flex gap-3 rounded-lg border border-transparent transition-all duration-200",
        compact ? "px-3 py-2.5" : "px-4 py-3",
        !notification.is_read
          ? "border-l-2 border-l-[var(--color-accent)] bg-[var(--color-accent)]/[0.04]"
          : "hover:bg-[var(--color-surface-elevated)]",
      )}
      onClick={handleClick}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full",
          compact ? "h-8 w-8" : "h-10 w-10",
          config.bgColor,
        )}
      >
        <Icon weight="light" className={cn(compact ? "h-4 w-4" : "h-5 w-5", config.color)} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm leading-snug",
            !notification.is_read
              ? "font-semibold text-foreground"
              : "font-medium text-muted-foreground",
          )}
        >
          {notification.title}
        </p>
        {notification.body && !compact && (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground/80">
            {notification.body}
          </p>
        )}
        <p className="mt-1 text-[11px] text-muted-foreground/60">{timeAgo}</p>
      </div>

      {/* Unread dot */}
      {!notification.is_read && (
        <div className="flex shrink-0 items-start pt-1.5">
          <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
        </div>
      )}
    </motion.div>
  );

  if (notification.action_url) {
    return (
      <Link href={notification.action_url} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
