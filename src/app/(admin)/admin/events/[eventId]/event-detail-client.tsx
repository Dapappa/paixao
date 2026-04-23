"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  DollarSign,
  MapPin,
  Star,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";

interface EventDetail {
  id: string;
  title: string;
  description: string;
  short_description: string | null;
  event_type: string;
  format: string;
  status: string;
  is_featured: boolean;
  starts_at: string;
  ends_at: string | null;
  venue_name: string | null;
  venue_city: string | null;
  venue_address: string | null;
  capacity: number | null;
  current_attendees: number;
  ticket_price_cents: number;
  currency: string;
  cover_image_url: string | null;
  created_at: string;
  host: { id: string; display_name: string; avatar_url: string | null } | null;
}

const statusBadge: Record<string, string> = {
  draft: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  published: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  rejected: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export function EventDetailClient({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      try {
        // Use the admin events API with search by fetching all and finding
        // For a single event, we use admin client indirectly
        const res = await fetch(`/api/admin/events?search=&per_page=50`);
        if (res.ok) {
          const data = await res.json();
          const found = (data.events || []).find((e: EventDetail) => e.id === eventId);
          if (found) setEvent(found);
        }
      } catch (err) {
        console.error("Failed to fetch event:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [eventId]);

  const handleAction = async (action: "approve" | "reject" | "feature" | "unfeature" | "cancel") => {
    try {
      const res = await fetch("/api/admin/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventIds: [eventId], action }),
      });
      if (res.ok) {
        // Refresh
        const updated = await res.json();
        if (updated.events?.[0]) {
          setEvent((prev) => prev ? { ...prev, ...updated.events[0] } : prev);
        }
      }
    } catch (err) {
      console.error("Action failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-white/[0.03]" />
        <Skeleton className="h-[400px] rounded-xl bg-white/[0.03]" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-zinc-500">Event not found</p>
        <Button variant="ghost" className="mt-4 text-zinc-400" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-500 hover:text-white hover:bg-white/[0.06]"
          onClick={() => router.push("/admin/events")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">{event.title}</h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="outline" className={cn("text-[10px] capitalize", statusBadge[event.status])}>
              {event.status}
            </Badge>
            {event.is_featured && (
              <Badge variant="outline" className="text-[10px] bg-[#d4a574]/20 text-[#d4a574] border-[#d4a574]/30">
                Featured
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-4"
        >
          {event.cover_image_url && (
            <div className="aspect-video rounded-lg overflow-hidden bg-zinc-800">
              <img
                src={event.cover_image_url}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <p className="text-sm text-zinc-300 leading-relaxed">
            {event.description || event.short_description || "No description"}
          </p>

          <Separator className="bg-white/[0.06]" />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-zinc-400">
              <Calendar className="h-4 w-4 text-zinc-600" />
              <span>
                {event.starts_at ? format(new Date(event.starts_at), "MMM dd, yyyy 'at' h:mm a") : "TBD"}
              </span>
            </div>
            {event.venue_name && (
              <div className="flex items-center gap-2 text-zinc-400">
                <MapPin className="h-4 w-4 text-zinc-600" />
                <span>{event.venue_name}{event.venue_city ? `, ${event.venue_city}` : ""}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-zinc-400">
              <Users className="h-4 w-4 text-zinc-600" />
              <span>{event.current_attendees}{event.capacity ? ` / ${event.capacity}` : ""} attendees</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <DollarSign className="h-4 w-4 text-zinc-600" />
              <span>
                {event.ticket_price_cents > 0
                  ? `$${(event.ticket_price_cents / 100).toFixed(2)} ${event.currency}`
                  : "Free"}
              </span>
            </div>
          </div>

          {/* Host info */}
          {event.host && (
            <>
              <Separator className="bg-white/[0.06]" />
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-white/10">
                  <AvatarImage src={event.host.avatar_url || undefined} />
                  <AvatarFallback className="bg-zinc-800 text-sm text-zinc-400">
                    {(event.host.display_name || "?")[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-zinc-300">
                    {event.host.display_name}
                  </p>
                  <p className="text-xs text-zinc-600">Event Host</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto h-7 text-xs bg-white/[0.03] border-white/[0.08] text-zinc-400"
                  onClick={() => router.push(`/admin/users/${event.host!.id}`)}
                >
                  View Profile
                </Button>
              </div>
            </>
          )}
        </motion.div>

        {/* Actions sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-300">Actions</h3>

            {event.status === "draft" && (
              <>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleAction("approve")}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve & Publish
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-white/[0.03] border-white/[0.08] text-orange-400 hover:bg-orange-500/10"
                  onClick={() => handleAction("reject")}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </>
            )}

            {event.status === "published" && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => handleAction("cancel")}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Event
              </Button>
            )}

            <Button
              variant="outline"
              className={cn(
                "w-full bg-white/[0.03] border-white/[0.08]",
                event.is_featured ? "text-zinc-400" : "text-[#d4a574]"
              )}
              onClick={() => handleAction(event.is_featured ? "unfeature" : "feature")}
            >
              <Star className={cn("mr-2 h-4 w-4", event.is_featured && "fill-[#d4a574] text-[#d4a574]")} />
              {event.is_featured ? "Remove Featured" : "Feature Event"}
            </Button>
          </div>

          {/* Event meta */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-300">Details</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Type</span>
                <span className="capitalize text-zinc-300">{event.event_type?.replace(/_/g, " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Format</span>
                <span className="capitalize text-zinc-300">{event.format?.replace(/_/g, " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Created</span>
                <span className="text-zinc-300">{format(new Date(event.created_at), "MMM dd, yyyy")}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
