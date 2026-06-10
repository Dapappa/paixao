"use client";

import { cn } from "@/lib/utils";
import { UsersThree } from "@phosphor-icons/react/ssr";

interface EventAttendeesProps {
  count: number;
  capacity?: number | null;
  /** Optional list of avatar URLs (anonymous placeholders) */
  avatarUrls?: string[];
  className?: string;
}

export function EventAttendees({
  count,
  capacity,
  avatarUrls = [],
  className,
}: EventAttendeesProps) {
  // Show up to 5 avatar circles
  const visibleAvatars = avatarUrls.slice(0, 5);
  const overflowCount = Math.max(0, count - visibleAvatars.length);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Avatar stack */}
      {visibleAvatars.length > 0 && (
        <div className="flex -space-x-2">
          {visibleAvatars.map((url, idx) => (
            <div
              key={idx}
              className="relative h-8 w-8 rounded-full border-2 border-surface bg-[var(--color-surface-elevated)] overflow-hidden"
              style={{ zIndex: visibleAvatars.length - idx }}
            >
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          ))}
          {overflowCount > 0 && (
            <div
              className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-[var(--color-accent-muted)] text-xs font-semibold text-[var(--color-accent)]"
              style={{ zIndex: 0 }}
            >
              +{overflowCount > 99 ? "99" : overflowCount}
            </div>
          )}
        </div>
      )}

      {/* Fallback: icon + count when no avatars */}
      {visibleAvatars.length === 0 && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent-muted)]">
          <UsersThree className="h-4 w-4 text-[var(--color-accent)]" />
        </div>
      )}

      {/* Text */}
      <div className="text-sm">
        <span className="font-semibold text-foreground">{count}</span>
        <span className="text-muted-foreground">
          {" "}
          {count === 1 ? "person" : "people"} attending
        </span>
        {capacity && (
          <span className="text-muted-foreground">
            {" "}
            &middot; {capacity - count > 0
              ? `${capacity - count} spots left`
              : "Full"}
          </span>
        )}
      </div>
    </div>
  );
}
