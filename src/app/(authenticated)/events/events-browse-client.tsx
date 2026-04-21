"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/events/event-card";
import { EventFilterBar } from "@/components/events/event-filter-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useEvents, type EventFilters } from "@/lib/hooks/use-events";
import { motion } from "framer-motion";
import {
  Plus,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface EventsBrowseClientProps {
  canCreateEvent: boolean;
}

export function EventsBrowseClient({
  canCreateEvent,
}: EventsBrowseClientProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<EventFilters>({});

  const { events, loading, error, totalCount, page, totalPages, setPage } =
    useEvents({ filters, page: 1, perPage: 12 });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Events
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Discover exclusive gatherings in your community
          </p>
        </div>

        {canCreateEvent && (
          <Button
            onClick={() => router.push("/events/create")}
            className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-[0_0_20px_rgba(194,24,91,0.2)]"
          >
            <Plus className="mr-1 h-4 w-4" />
            Create Event
          </Button>
        )}
      </div>

      {/* Filter bar */}
      <EventFilterBar filters={filters} onFiltersChange={setFilters} />

      {/* Results count */}
      {!loading && totalCount > 0 && (
        <p className="text-sm text-muted-foreground">
          Showing {events.length} of {totalCount} events
        </p>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-center">
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
        </div>
      )}

      {/* Events grid */}
      {!loading && !error && events.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {events.map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <EventCard event={event} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && !error && events.length === 0 && (
        <EmptyState
          icon={CalendarDays}
          title="No events found"
          description="There are no upcoming events matching your filters. Try adjusting your search or check back later."
          action={
            canCreateEvent
              ? {
                  label: "Create an Event",
                  onClick: () => router.push("/events/create"),
                }
              : undefined
          }
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="border-border"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="border-border"
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
