'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Crown, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import type { SubscriptionTier } from '@/config/subscription-tiers';
import { formatPrice, getYearlyMonthlyRate } from '@/config/subscription-tiers';

interface PricingCardProps {
  tier: SubscriptionTier;
  billingPeriod: 'monthly' | 'yearly';
  isCurrentTier: boolean;
  onSelect: (tierId: string) => void;
  index: number;
}

export function PricingCard({
  tier,
  billingPeriod,
  isCurrentTier,
  onSelect,
  index,
}: PricingCardProps) {
  const isPopular = tier.popular;
  const isPatron = tier.id === 'patron';
  const isFree = tier.monthlyPrice === 0;

  const displayPrice =
    billingPeriod === 'yearly' && tier.yearlyPrice > 0
      ? getYearlyMonthlyRate(tier)
      : tier.monthlyPrice;

  const totalYearly = tier.yearlyPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        'relative flex flex-col rounded-2xl border p-6 transition-all duration-300',
        'bg-[#111111]/80 backdrop-blur-sm',
        'hover:translate-y-[-4px] hover:shadow-2xl',
        // Popular tier — crimson accent
        isPopular && [
          'border-[#c2185b]/60 shadow-lg shadow-[#c2185b]/10',
          'scale-[1.02] lg:scale-105',
        ],
        // Patron tier — gold accent
        isPatron && [
          'border-[#d4a574]/50 shadow-lg shadow-[#d4a574]/10',
        ],
        // Default
        !isPopular && !isPatron && 'border-white/10',
        // Current tier glow
        isCurrentTier && 'ring-2 ring-[#c2185b]/40',
      )}
    >
      {/* Badges */}
      <div className="mb-4 flex items-center gap-2">
        {isPopular && (
          <Badge className="bg-[#c2185b] text-white border-0 text-xs">
            <Sparkles className="mr-1 h-3 w-3" />
            Most Popular
          </Badge>
        )}
        {isPatron && (
          <Badge className="bg-gradient-to-r from-[#d4a574] to-[#b8925c] text-black border-0 text-xs font-semibold">
            <Crown className="mr-1 h-3 w-3" />
            Elite
          </Badge>
        )}
        {isCurrentTier && (
          <Badge
            variant="outline"
            className="border-[#c2185b]/50 text-[#c2185b] text-xs"
          >
            Current Plan
          </Badge>
        )}
      </div>

      {/* Tier name & description */}
      <h3
        className={cn(
          'font-serif text-2xl font-bold tracking-wide',
          isPatron ? 'text-[#d4a574]' : 'text-white',
        )}
      >
        {tier.name}
      </h3>
      <p className="mt-1 text-sm text-white/50">{tier.description}</p>

      {/* Price */}
      <div className="mt-6 mb-6">
        {isFree ? (
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-4xl font-bold text-white">
              Free
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-4xl font-bold text-white">
                {formatPrice(displayPrice)}
              </span>
              <span className="text-sm text-white/40">/mo</span>
            </div>
            {billingPeriod === 'yearly' && totalYearly > 0 && (
              <p className="mt-1 text-xs text-white/40">
                ${totalYearly.toFixed(2)}/year &middot;{' '}
                <span className="text-[#c2185b] font-medium">
                  Save {tier.yearlyDiscount}
                </span>
              </p>
            )}
            {billingPeriod === 'monthly' && totalYearly > 0 && (
              <p className="mt-1 text-xs text-white/40">
                or ${(totalYearly / 12).toFixed(2)}/mo billed yearly
              </p>
            )}
          </>
        )}
      </div>

      {/* Divider */}
      <div className="mb-6 h-px bg-white/10" />

      {/* Features */}
      <ul className="mb-8 flex-1 space-y-3">
        {tier.features.map((feature) => (
          <li key={feature.label} className="flex items-start gap-3 text-sm">
            {feature.included ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#c2185b]" />
            ) : (
              <X className="mt-0.5 h-4 w-4 shrink-0 text-white/20" />
            )}
            <span
              className={cn(
                feature.included ? 'text-white/80' : 'text-white/30',
              )}
            >
              {feature.label}
              {feature.limit && feature.included && (
                <span className="ml-1 text-white/40">({feature.limit})</span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      {isCurrentTier ? (
        <Button
          disabled
          className="w-full bg-white/5 text-white/40 border border-white/10 cursor-default"
        >
          Current Plan
        </Button>
      ) : isFree ? (
        <Button
          variant="outline"
          className="w-full border-white/20 text-white/60 hover:bg-white/5"
          disabled
        >
          Free Forever
        </Button>
      ) : (
        <Button
          onClick={() => onSelect(tier.id)}
          className={cn(
            'w-full font-semibold transition-all duration-300',
            isPatron
              ? 'bg-gradient-to-r from-[#d4a574] to-[#b8925c] text-black hover:from-[#d4a574]/90 hover:to-[#b8925c]/90 shadow-lg shadow-[#d4a574]/20'
              : isPopular
                ? 'bg-[#c2185b] text-white hover:bg-[#c2185b]/90 shadow-lg shadow-[#c2185b]/20'
                : 'bg-white/10 text-white hover:bg-white/20',
          )}
        >
          {isCurrentTier ? 'Current Plan' : 'Get Started'}
        </Button>
      )}

      {/* Patron gold glow effect */}
      {isPatron && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-[#d4a574]/5 via-transparent to-[#d4a574]/5" />
      )}
    </motion.div>
  );
}
