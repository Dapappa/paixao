"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useProfile } from "@/lib/hooks/use-profile";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Heart,
  MessageCircle,
  TrendingUp,
  MapPin,
  Clock,
  Users,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Placeholder data
const upcomingEvents = [
  {
    id: "1",
    title: "Velvet Lounge Night",
    date: "Apr 22, 2026",
    time: "9:00 PM",
    location: "The Crimson Room",
    attendees: 24,
    category: "Social",
  },
  {
    id: "2",
    title: "Rope Art Workshop",
    date: "Apr 25, 2026",
    time: "7:00 PM",
    location: "Studio 54",
    attendees: 12,
    category: "Workshop",
  },
  {
    id: "3",
    title: "Masquerade Ball",
    date: "May 1, 2026",
    time: "10:00 PM",
    location: "Grand Ballroom",
    attendees: 89,
    category: "Event",
  },
];

const suggestedProfiles = [
  { id: "1", name: "Midnight Rose", tagline: "Curious explorer", matchScore: 92 },
  { id: "2", name: "Velvet Shadow", tagline: "Experienced guide", matchScore: 87 },
  { id: "3", name: "Crimson Heart", tagline: "Open mind, warm heart", matchScore: 84 },
];

function StatCard({
  icon: Icon,
  label,
  value,
  accentColor,
  glowColor,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string | number;
  accentColor: string;
  glowColor: string;
}) {
  return (
    <motion.div variants={item}>
      <Card className="group relative overflow-hidden border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-300 hover:border-[var(--color-border)]/60 hover:shadow-lg">
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${glowColor}, transparent 70%)`,
          }}
        />
        <CardContent className="relative flex items-center gap-4 p-5">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <Icon className="h-6 w-6" style={{ color: accentColor }} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { profile, loading } = useProfile();

  if (loading) {
    return <DashboardSkeleton />;
  }

  const displayName = profile?.display_name || "there";

  // Calculate profile completion percentage
  const profileFields = [
    profile?.display_name,
    profile?.avatar_url,
    profile?.bio,
    profile?.gender,
    profile?.sexuality,
    profile?.relationship_status,
    profile?.location,
  ];
  const completedFields = profileFields.filter(Boolean).length;
  const completionPercent = Math.round(
    (completedFields / profileFields.length) * 100
  );

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 p-4 md:p-6 lg:p-8"
    >
      {/* Welcome */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Welcome back,{" "}
          <span className="text-gradient-brand">{displayName}</span>
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s what&apos;s happening in your world
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={CalendarDays}
          label="Upcoming Events"
          value={3}
          accentColor="#c2185b"
          glowColor="rgba(194, 24, 91, 0.08)"
        />
        <StatCard
          icon={Heart}
          label="Active Matches"
          value={7}
          accentColor="#e91e63"
          glowColor="rgba(233, 30, 99, 0.08)"
        />
        <StatCard
          icon={MessageCircle}
          label="Unread Messages"
          value={4}
          accentColor="#d4a574"
          glowColor="rgba(212, 165, 116, 0.08)"
        />
        <StatCard
          icon={TrendingUp}
          label="Profile Completion"
          value={`${completionPercent}%`}
          accentColor="#4caf50"
          glowColor="rgba(76, 175, 80, 0.08)"
        />
      </div>

      {/* Upcoming Events */}
      <motion.section variants={item}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Upcoming Events
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((event, index) => (
            <motion.div
              key={event.id}
              variants={item}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="group cursor-pointer overflow-hidden border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-300 hover:border-[var(--color-accent)]/30 hover:shadow-lg hover:shadow-[var(--color-accent)]/5">
                {/* Gradient top bar */}
                <div className="h-1 w-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)]" />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base font-semibold text-foreground line-clamp-1">
                      {event.title}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="shrink-0 bg-[var(--color-accent-muted)] text-[var(--color-accent)] border-0"
                    >
                      {event.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>
                      {event.date} at {event.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4 shrink-0" />
                    <span>{event.attendees} attending</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Suggested For You */}
      <motion.section variants={item}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Suggested for You
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            Explore
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {suggestedProfiles.map((person) => (
            <motion.div
              key={person.id}
              variants={item}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="group cursor-pointer border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-300 hover:border-[var(--color-accent)]/30 hover:shadow-lg hover:shadow-[var(--color-accent)]/5">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-gold)]/20 border border-[var(--color-border)]">
                    <span className="text-lg font-semibold text-[var(--color-accent)]">
                      {person.name[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {person.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {person.tagline}
                    </p>
                  </div>
                  <div className="flex flex-col items-center shrink-0">
                    <div className="flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-[var(--color-gold)]" />
                      <span className="text-sm font-bold text-[var(--color-gold)]">
                        {person.matchScore}%
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      match
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
