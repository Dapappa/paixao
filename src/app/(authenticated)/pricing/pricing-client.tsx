'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Sparkles, ChevronDown, CreditCard, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { subscriptionTiers } from '@/config/subscription-tiers';
import { PricingCard } from '@/components/payments/pricing-card';
import { PaymentForm } from '@/components/payments/payment-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PricingClientProps {
  currentTier: string;
}

/* ── FAQ data ───────────────────────────────── */
const faqs = [
  {
    q: 'Can I change my mind later?',
    a: 'Of course. Move up or step down whenever you like — the change takes hold right away, and we only bill you for what you use.',
  },
  {
    q: 'How would you like me to pay?',
    a: 'Any major card — Visa, Mastercard, American Express — handled quietly through Stripe. The details stay between you and them.',
  },
  {
    q: 'Is there a way to try before I commit?',
    a: 'The Curious room is free, always. Wander, get a feel for the place, and come closer when it feels right.',
  },
  {
    q: 'What does paying by the year get me?',
    a: 'A softer price — 43% off the monthly rate. One charge a year, and you can step away whenever you choose.',
  },
  {
    q: 'And if I leave?',
    a: 'You keep everything until your term runs out. After that you simply slip back to the free Curious room — no drama, no door slammed.',
  },
  {
    q: 'Will my payment stay private?',
    a: 'Always. Stripe handles it all — PCI Level 1, the strictest there is. Your card never touches our servers.',
  },
];

export function PricingClient({ currentTier }: PricingClientProps) {
  const searchParams = useSearchParams();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>(
    'monthly',
  );
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Check for canceled query param
  useEffect(() => {
    if (searchParams.get('canceled') === 'true') {
      toast.error('Payment was canceled. No charges were made.');
    }
  }, [searchParams]);

  function handleTierSelect(tierId: string) {
    setSelectedTier(tierId);
  }

  return (
    <div className="relative min-h-screen overflow-hidden pb-24">
      {/* ── Distinct atmosphere: parting velvet curtain (bg-stage) ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* assigned hero image, masked into near-black so copy stays legible */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.22]"
          style={{ backgroundImage: 'url(/generated/bg-stage.webp)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" />
        {/* warm aura field + drifting brand glows */}
        <div className="aura-field absolute inset-0 animate-aura-drift opacity-60" />
        <div className="absolute left-1/2 top-[-12%] h-[560px] w-[760px] -translate-x-1/2 rounded-full bg-accent/[0.10] blur-[150px]" />
        <div className="absolute bottom-[-8%] right-[-6%] h-[440px] w-[600px] rounded-full bg-gold/[0.06] blur-[130px]" />
      </div>

      {/* ── Hero Header ── */}
      <div className="relative z-10 px-4 pt-16 pb-14 text-center sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.05, 0.7, 0.1, 1] }}
          className="relative z-10"
        >
          <Badge className="mb-5 border-gold/25 bg-gold/10 px-4 py-1.5 text-sm text-gold">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Beyond the velvet rope
          </Badge>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Pick the room you{' '}
            <span className="text-gradient-brand">belong in.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-text-secondary">
            Each tier draws the curtain back a little further. Come close at your
            own pace — and stay only as long as it feels right.
          </p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.05, 0.7, 0.1, 1] }}
          className="relative z-10 mt-9 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-surface/60 p-1.5 backdrop-blur-sm"
        >
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={cn(
              'rounded-full px-5 py-2 text-sm font-medium transition-all duration-300',
              billingPeriod === 'monthly'
                ? 'bg-foreground/10 text-foreground'
                : 'text-text-secondary hover:text-foreground',
            )}
          >
            Month to month
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={cn(
              'relative rounded-full px-5 py-2 text-sm font-medium transition-all duration-300',
              billingPeriod === 'yearly'
                ? 'bg-foreground/10 text-foreground'
                : 'text-text-secondary hover:text-foreground',
            )}
          >
            By the year
            <span className="ml-2 inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
              Save 43%
            </span>
          </button>
        </motion.div>
      </div>

      {/* ── Pricing Cards ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {subscriptionTiers.map((tier, i) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              billingPeriod={billingPeriod}
              isCurrentTier={
                tier.id === currentTier ||
                (currentTier === 'free' && tier.id === 'curious')
              }
              onSelect={handleTierSelect}
              index={i}
            />
          ))}
        </div>

        {/* Reassurance line */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.05, 0.7, 0.1, 1] }}
          className="mt-10 flex items-center justify-center gap-2 text-center text-sm text-text-secondary"
        >
          <ShieldCheck className="h-4 w-4 text-gold/80" />
          18+ only · You stay anonymous · Leave whenever you like
        </motion.p>
      </div>

      {/* ── Checkout Dialog ── */}
      <Dialog
        open={!!selectedTier}
        onOpenChange={(open) => !open && setSelectedTier(null)}
      >
        <DialogContent className="border-border/60 bg-surface sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-serif text-xl text-foreground">
              <CreditCard className="h-5 w-5 text-accent" />
              One more step inside
            </DialogTitle>
            <DialogDescription className="text-text-secondary">
              You&apos;re about to join the{' '}
              <span className="font-semibold capitalize text-foreground/90">
                {selectedTier}
              </span>{' '}
              room ({billingPeriod === 'yearly' ? 'billed yearly' : 'month to month'}).
              We&apos;ll hand you to Stripe to settle the details — quietly.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex flex-col gap-3">
            {selectedTier && (
              <PaymentForm
                tierId={selectedTier}
                billingPeriod={billingPeriod}
                className="w-full bg-accent font-semibold text-white hover:bg-accent-hover"
              >
                Take me through
              </PaymentForm>
            )}
            <Button
              variant="outline"
              onClick={() => setSelectedTier(null)}
              className="w-full border-border/60 text-text-secondary hover:bg-surface-elevated"
            >
              Not just yet
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── FAQ Section ── */}
      <div className="relative z-10 mx-auto mt-24 max-w-3xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.05, 0.7, 0.1, 1] }}
        >
          <h2 className="text-center font-serif text-3xl font-bold text-foreground">
            Before you decide
          </h2>
          <p className="mb-10 mt-2 text-center text-text-secondary">
            The quiet questions, answered plainly.
          </p>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-border/60 bg-surface/50 backdrop-blur-sm transition-colors duration-300 hover:border-accent/30"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
                >
                  {faq.q}
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-text-secondary transition-transform duration-300',
                      openFaq === i && 'rotate-180 text-accent',
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-4 text-sm leading-relaxed text-text-secondary">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Atmosphere overlays (fixed, non-interactive) ── */}
      <div className="vignette" aria-hidden />
      <div className="film-grain" aria-hidden />
    </div>
  );
}
