import { createClient } from '@/lib/supabase/server';
import { PricingClient } from './pricing-client';

export const metadata = {
  title: 'Membership | Paixão',
  description: 'Pick the room you belong in. Every tier opens a little more of the night.',
};

export default async function PricingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentTier = 'free';

  if (user) {
    const { data: profile } = await (supabase.from('profiles') as any)
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    if (profile?.subscription_tier) {
      currentTier = profile.subscription_tier;
    }
  }

  return <PricingClient currentTier={currentTier} />;
}
