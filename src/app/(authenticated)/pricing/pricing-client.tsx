'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Sparkles, ChevronDown, CreditCard } from 'lucide-react';
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
    q: 'Can I switch plans at any time?',
    a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and your billing will be prorated.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards (Visa, Mastercard, American Express) through our secure Stripe payment processor.',
  },
  {
    q: 'Is there a free trial?',
    a: 'The Curious tier is completely free and gives you a taste of the PassionDen experience. Upgrade when you are ready for more.',
  },
  {
    q: 'How does yearly billing work?',
    a: 'Yearly billing saves you 43% compared to monthly. You will be charged once per year and can cancel anytime.',
  },
  {
    q: 'What happens if I cancel?',
    a: 'You will retain access to your current plan until the end of your billing period. After that, you will be downgraded to the free Curious tier.',
  },
  {
    q: 'Is my payment information secure?',
    a: 'Absolutely. All payments are processed by Stripe, a PCI Level 1 certified payment processor. We never store your card details on our servers.',
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
    <div className="min-h-screen pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden px-4 pt-12 pb-16 text-center">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[400px] w-[600px] rounded-full bg-[#c2185b]/8 blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <Badge className="mb-4 bg-[#c2185b]/10 text-[#c2185b] border-[#c2185b]/20 text-sm px-4 py-1.5">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Choose Your Experience
          </Badge>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white tracking-wide">
            Unlock Your{' '}
            <span className="text-[#c2185b]">Passion</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/50">
            Select the tier that matches your desires. Every plan unlocks a
            deeper level of connection.
          </p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-10 mt-8 flex items-center justify-center gap-3"
        >
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={cn(
              'rounded-full px-5 py-2 text-sm font-medium transition-all duration-300',
              billingPeriod === 'monthly'
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/60',
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={cn(
              'relative rounded-full px-5 py-2 text-sm font-medium transition-all duration-300',
              billingPeriod === 'yearly'
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/60',
            )}
          >
            Yearly
            <span className="ml-2 inline-flex items-center rounded-full bg-[#c2185b] px-2 py-0.5 text-[10px] font-bold text-white">
              Save 43%
            </span>
          </button>
        </motion.div>
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto max-w-7xl px-4">
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
      </div>

      {/* Checkout Dialog */}
      <Dialog
        open={!!selectedTier}
        onOpenChange={(open) => !open && setSelectedTier(null)}
      >
        <DialogContent className="bg-[#111111] border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white font-serif text-xl">
              <CreditCard className="h-5 w-5 text-[#c2185b]" />
              Confirm Your Plan
            </DialogTitle>
            <DialogDescription className="text-white/50">
              You are about to subscribe to the{' '}
              <span className="font-semibold text-white/80 capitalize">
                {selectedTier}
              </span>{' '}
              plan ({billingPeriod} billing). You will be redirected to our
              secure payment partner.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex flex-col gap-3">
            {selectedTier && (
              <PaymentForm
                tierId={selectedTier}
                billingPeriod={billingPeriod}
                className="w-full bg-[#c2185b] text-white hover:bg-[#c2185b]/90 font-semibold"
              >
                Continue to Checkout
              </PaymentForm>
            )}
            <Button
              variant="outline"
              onClick={() => setSelectedTier(null)}
              className="w-full border-white/10 text-white/60 hover:bg-white/5"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* FAQ Section */}
      <div className="mx-auto mt-24 max-w-3xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-center font-serif text-3xl font-bold text-white mb-2">
            Common Questions
          </h2>
          <p className="text-center text-white/40 mb-10">
            Everything you need to know about our plans
          </p>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-[#111111]/60 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  {faq.q}
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-white/40 transition-transform duration-300',
                      openFaq === i && 'rotate-180',
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
                      <div className="px-6 pb-4 text-sm text-white/50 leading-relaxed">
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
    </div>
  );
}
