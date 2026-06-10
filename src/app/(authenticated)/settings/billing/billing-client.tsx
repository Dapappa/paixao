'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkle, ArrowLeft } from '@phosphor-icons/react/ssr';
import { Button } from '@/components/ui/button';
import { SubscriptionManager } from '@/components/payments/subscription-manager';
import Link from 'next/link';

export function BillingClient() {
  const searchParams = useSearchParams();
  const [showCelebration, setShowCelebration] = useState(false);
  const celebratedRef = useRef(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true' && !celebratedRef.current) {
      celebratedRef.current = true;
      setShowCelebration(true);
      toast.success('Subscription activated! Welcome to the experience.', {
        duration: 5000,
      });
      // Hide celebration after animation
      const timer = setTimeout(() => setShowCelebration(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden pb-20">
      {/* ── Ambient aura backdrop (Velvet Aura) ── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.16] mix-blend-screen"
          style={{ backgroundImage: 'url(/generated/bg-bar.webp)' }}
        />
        <div className="aura-field absolute inset-0 animate-aura-drift opacity-60" />
        <div className="absolute left-1/2 top-[-10%] h-[460px] w-[640px] -translate-x-1/2 rounded-full bg-gold/[0.05] blur-[130px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
      </div>

      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          >
            {/* Radial glow */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0.6 }}
              exit={{ scale: 2, opacity: 0 }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute h-96 w-96 rounded-full bg-gradient-radial from-[#c2185b]/30 via-[#c2185b]/10 to-transparent"
            />
            {/* Sparkle particles */}
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                  scale: 0,
                }}
                animate={{
                  x: (Math.random() - 0.5) * 500,
                  y: (Math.random() - 0.5) * 500,
                  opacity: 0,
                  scale: Math.random() * 1.5 + 0.5,
                }}
                transition={{
                  duration: Math.random() * 2 + 1.5,
                  delay: Math.random() * 0.5,
                  ease: 'easeOut',
                }}
                className="absolute"
              >
                <Sparkle
                  weight="fill"
                  className={cn(
                    'h-4 w-4',
                    i % 3 === 0
                      ? 'text-[#c2185b]'
                      : i % 3 === 1
                        ? 'text-[#d4a574]'
                        : 'text-white',
                  )}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="relative z-10 px-4 pt-10 pb-6">
        <div className="mx-auto max-w-3xl">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 text-text-secondary hover:text-foreground"
            >
              <ArrowLeft weight="bold" className="mr-2 h-4 w-4" />
              Back inside
            </Button>
          </Link>
          <span className="text-xs font-medium uppercase tracking-[0.34em] text-gold">
            Your standing
          </span>
          <h1 className="mt-3 font-serif text-3xl font-bold tracking-wide text-foreground sm:text-4xl">
            Your seat &amp; your plan
          </h1>
          <p className="mt-3 leading-relaxed text-text-secondary">
            Everything that keeps your place in the room — your plan, what
            you&apos;ve paid, the details only you can see. Change it whenever you
            like.
          </p>
        </div>
      </div>

      {/* Subscription Manager */}
      <div className="relative z-10 mx-auto max-w-3xl px-4">
        <SubscriptionManager />
      </div>

      {/* ── Atmosphere overlays ── */}
      <div className="vignette" aria-hidden />
      <div className="film-grain" aria-hidden />
    </div>
  );
}
