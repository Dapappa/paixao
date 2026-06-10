"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EventCreateForm } from "@/components/events/event-create-form";
import { LazyMotion, domAnimation, m } from "motion/react";
import { riseIn, stagger } from "@/lib/motion";
import { Crown, ArrowLeft, Sparkle } from "@phosphor-icons/react/ssr";

interface CreateEventClientProps {
  isEligible: boolean;
}

/* ── Shared masquerade atmosphere — candlelit ballroom ── */
function Atmosphere() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0">
        <Image
          src="/generated/bg-masquerade.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-[0.20]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/75 to-background" />
        <div className="aura-field absolute inset-0 animate-aura-drift opacity-55" />
        <div className="absolute left-1/2 top-[12%] h-[420px] w-[560px] -translate-x-1/2 rounded-full bg-gold/[0.06] blur-[130px] animate-breath" />
      </div>
      <div className="vignette" aria-hidden />
      <div className="film-grain" aria-hidden />
    </>
  );
}

export function CreateEventClient({ isEligible }: CreateEventClientProps) {
  const router = useRouter();

  if (!isEligible) {
    return (
      <LazyMotion features={domAnimation}>
        <Atmosphere />
        <div className="relative z-10 mx-auto max-w-lg py-16">
          <m.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <m.div variants={riseIn} custom={0}>
              <Card className="overflow-hidden border-border/50 bg-surface/60 backdrop-blur-sm">
                <div className="relative px-6 py-10 text-center">
                  <div className="aura-field absolute inset-0 opacity-50" />
                  <div className="relative">
                    <div className="mx-auto mb-4 inline-flex animate-breath rounded-2xl bg-gold-muted p-3.5">
                      <Crown weight="duotone" className="h-9 w-9 text-gold" />
                    </div>
                    <h2 className="mb-2 font-serif text-2xl font-bold text-foreground">
                      Earn your place as host
                    </h2>
                    <p className="mx-auto max-w-sm text-sm leading-relaxed text-text-secondary">
                      Hosts are trusted members who open the room and set its
                      tone. Finish your profile first, and the floor is yours.
                    </p>
                  </div>
                </div>
                <CardContent className="space-y-5 p-6">
                  <div className="space-y-3">
                    {[
                      "Finish your profile and onboarding",
                      "Build a little trust in the room",
                      "Open gatherings of your own",
                    ].map((line) => (
                      <div key={line} className="flex items-start gap-3 text-sm">
                        <Sparkle weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                        <span className="text-foreground">{line}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    <Button onClick={() => router.push("/onboarding")}>
                      Finish onboarding
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => router.push("/events")}
                      className="text-text-secondary"
                    >
                      <ArrowLeft weight="bold" className="mr-1 h-4 w-4" />
                      Back to the rooms
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </m.div>
          </m.div>
        </div>
      </LazyMotion>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <Atmosphere />
      <div className="relative z-10 py-8">
        <m.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="mb-10 text-center"
        >
          <m.span
            variants={riseIn}
            custom={0}
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-gold"
          >
            <Sparkle weight="fill" className="h-3.5 w-3.5" />
            Host a night
          </m.span>
          <m.h1
            variants={riseIn}
            custom={1}
            className="mt-4 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Open a <span className="text-gradient-brand">room</span>
          </m.h1>
          <m.p
            variants={riseIn}
            custom={2}
            className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-text-secondary"
          >
            Set the details, name the boundaries, decide who walks in. Every yes
            here is given freely &mdash; build the night to honor it.
          </m.p>
        </m.div>

        <m.div initial="hidden" animate="visible" variants={riseIn} custom={3}>
          <EventCreateForm />
        </m.div>
      </div>
    </LazyMotion>
  );
}
