'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen pb-20">
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
                <Sparkles
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
      <div className="px-4 pt-8 pb-6">
        <div className="mx-auto max-w-3xl">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 text-white/40 hover:text-white/60"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="font-serif text-3xl font-bold text-white tracking-wide">
            Billing &amp; Subscription
          </h1>
          <p className="mt-2 text-white/50">
            Manage your plan, view payment history, and update billing
            preferences.
          </p>
        </div>
      </div>

      {/* Subscription Manager */}
      <div className="mx-auto max-w-3xl px-4">
        <SubscriptionManager />
      </div>
    </div>
  );
}
