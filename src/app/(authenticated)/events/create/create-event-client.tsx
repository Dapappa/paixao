"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EventCreateForm } from "@/components/events/event-create-form";
import { motion } from "framer-motion";
import { Crown, ArrowLeft, Sparkles } from "lucide-react";

interface CreateEventClientProps {
  isEligible: boolean;
}

export function CreateEventClient({ isEligible }: CreateEventClientProps) {
  const router = useRouter();

  if (!isEligible) {
    return (
      <div className="mx-auto max-w-lg py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-surface border-border overflow-hidden">
            <div className="bg-gradient-to-r from-[var(--color-gold)]/20 to-[var(--color-accent)]/20 px-6 py-8 text-center">
              <Crown className="mx-auto mb-3 h-12 w-12 text-[var(--color-gold)]" />
              <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                Become a Host
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                To create events on Paixão, you need to complete your
                profile setup. Hosts are trusted community members who
                organize safe, consensual experiences.
              </p>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <Sparkles className="mt-0.5 h-4 w-4 text-[var(--color-gold)]" />
                  <span className="text-foreground">
                    Complete your profile and onboarding
                  </span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Sparkles className="mt-0.5 h-4 w-4 text-[var(--color-gold)]" />
                  <span className="text-foreground">
                    Build trust within the community
                  </span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Sparkles className="mt-0.5 h-4 w-4 text-[var(--color-gold)]" />
                  <span className="text-foreground">
                    Start hosting exclusive events
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  onClick={() => router.push("/onboarding")}
                  className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
                >
                  Complete Onboarding
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/events")}
                  className="text-muted-foreground"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to Events
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
          Create an Event
        </h1>
        <p className="text-sm text-muted-foreground">
          Set up your event details, rules, and consent requirements
        </p>
      </motion.div>

      <EventCreateForm />
    </div>
  );
}
