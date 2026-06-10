import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BillingClient } from './billing-client';

export const metadata = {
  title: 'Billing & Subscription | Paixão',
  description: 'Manage your Paixão subscription and billing',
};

export default async function BillingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && process.env.PREVIEW_AUTH !== "1") {
    redirect('/auth/login');
  }

  return <BillingClient />;
}
