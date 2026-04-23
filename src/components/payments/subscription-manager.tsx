'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Receipt,
  Crown,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Payment {
  id: string;
  amount_cents: number;
  currency: string;
  payment_type: string;
  status: string;
  created_at: string;
  stripe_payment_intent_id: string | null;
}

interface SubscriptionData {
  tier: string;
  expires_at: string | null;
  payments: Payment[];
}

const tierColors: Record<string, string> = {
  free: 'bg-white/10 text-white/60',
  curious: 'bg-white/10 text-white/60',
  desire: 'bg-[#c2185b]/20 text-[#c2185b] border-[#c2185b]/30',
  obsession: 'bg-[#d4a574]/20 text-[#d4a574] border-[#d4a574]/30',
  patron: 'bg-gradient-to-r from-[#d4a574]/20 to-[#b8925c]/20 text-[#d4a574] border-[#d4a574]/30',
};

const tierNames: Record<string, string> = {
  free: 'Curious (Free)',
  curious: 'Curious (Free)',
  desire: 'Desire',
  obsession: 'Obsession',
  patron: 'Patron',
};

const statusColors: Record<string, string> = {
  succeeded: 'bg-emerald-500/20 text-emerald-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  failed: 'bg-red-500/20 text-red-400',
  refunded: 'bg-blue-500/20 text-blue-400',
};

export function SubscriptionManager() {
  const router = useRouter();
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  async function fetchSubscription() {
    try {
      const res = await fetch('/api/payments/subscription');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    setCanceling(true);
    try {
      const res = await fetch('/api/payments/cancel', { method: 'POST' });
      if (res.ok) {
        toast.success('Subscription canceled successfully');
        setCancelDialogOpen(false);
        fetchSubscription();
      } else {
        toast.error('Failed to cancel subscription');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setCanceling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const tier = data?.tier || 'free';
  const isFree = tier === 'free' || tier === 'curious';
  const expiresAt = data?.expires_at;
  const payments = data?.payments || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Current Plan Card */}
      <div className="rounded-2xl border border-white/10 bg-[#111111]/80 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Crown className="h-5 w-5 text-[#d4a574]" />
          <h2 className="font-serif text-xl font-bold text-white">
            Your Plan
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <Badge
              className={cn(
                'text-sm px-3 py-1 border',
                tierColors[tier] || tierColors.free,
              )}
            >
              {tierNames[tier] || 'Free'}
            </Badge>
            {expiresAt && (
              <div className="flex items-center gap-2 text-sm text-white/50">
                <Calendar className="h-4 w-4" />
                <span>
                  Next billing:{' '}
                  {format(new Date(expiresAt), 'MMMM d, yyyy')}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => router.push('/pricing')}
              className="bg-[#c2185b] text-white hover:bg-[#c2185b]/90"
            >
              {isFree ? 'Upgrade' : 'Change Plan'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {!isFree && (
              <Dialog
                open={cancelDialogOpen}
                onOpenChange={setCancelDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-white/10 text-white/60 hover:bg-white/5 hover:text-white"
                  >
                    Cancel Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#111111] border-white/10">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-white">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      Cancel Subscription
                    </DialogTitle>
                    <DialogDescription className="text-white/50">
                      Are you sure you want to cancel your{' '}
                      <span className="font-medium text-white/70">
                        {tierNames[tier]}
                      </span>{' '}
                      plan? You will lose access to premium features
                      immediately.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      variant="outline"
                      onClick={() => setCancelDialogOpen(false)}
                      className="border-white/10 text-white/60 hover:bg-white/5"
                    >
                      Keep My Plan
                    </Button>
                    <Button
                      onClick={handleCancel}
                      disabled={canceling}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      {canceling ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        'Yes, Cancel'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="rounded-2xl border border-white/10 bg-[#111111]/80 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Receipt className="h-5 w-5 text-[#d4a574]" />
          <h2 className="font-serif text-xl font-bold text-white">
            Payment History
          </h2>
        </div>

        {payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CreditCard className="mb-4 h-10 w-10 text-white/20" />
            <p className="text-white/40 text-sm">No payments yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-white/40">
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 pr-4 font-medium">Amount</th>
                  <th className="pb-3 pr-4 font-medium">Type</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payments.map((payment) => (
                  <tr key={payment.id} className="text-white/70">
                    <td className="py-3 pr-4">
                      {format(
                        new Date(payment.created_at),
                        'MMM d, yyyy',
                      )}
                    </td>
                    <td className="py-3 pr-4 font-medium text-white">
                      ${(payment.amount_cents / 100).toFixed(2)}{' '}
                      <span className="text-white/30 uppercase text-xs">
                        {payment.currency}
                      </span>
                    </td>
                    <td className="py-3 pr-4 capitalize">
                      {payment.payment_type}
                    </td>
                    <td className="py-3">
                      <Badge
                        className={cn(
                          'text-xs border-0',
                          statusColors[payment.status] ||
                            'bg-white/10 text-white/60',
                        )}
                      >
                        {payment.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
