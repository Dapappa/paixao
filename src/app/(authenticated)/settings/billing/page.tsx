import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BillingClient } from './billing-client';

export const metadata = {
  title: 'Billing & Subscription | PassionDen',
  description: 'Manage your PassionDen subscription and billing',
};

export default async function BillingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return <BillingClient />;
}
