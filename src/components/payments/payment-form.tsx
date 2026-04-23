'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { toast } from 'sonner';
import { ExternalLink } from 'lucide-react';

interface PaymentFormProps {
  tierId: string;
  billingPeriod: 'monthly' | 'yearly';
  className?: string;
  children?: React.ReactNode;
}

export function PaymentForm({
  tierId,
  billingPeriod,
  className,
  children,
}: PaymentFormProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId, billingPeriod }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to create checkout session');
        setLoading(false);
        return;
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        toast.error('No checkout URL returned');
        setLoading(false);
      }
    } catch {
      toast.error('An error occurred. Please try again.');
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" />
          <span className="ml-2">Redirecting&hellip;</span>
        </>
      ) : children ? (
        children
      ) : (
        <>
          Subscribe
          <ExternalLink className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}
