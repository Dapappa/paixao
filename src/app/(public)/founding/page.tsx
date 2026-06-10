import { foundingCap, resolveFoundingPricing } from '@/config/founding';
import { getFoundingCount } from '@/lib/founding/server';
import { siteConfig } from '@/config/site';
import { FoundingClient } from './founding-client';

export const metadata = {
  title: `Founding Membership | ${siteConfig.name}`,
  description:
    'Be one of the first founding members of Paixão. Lock in the lowest lifetime price before it rises. Welcome to the Passion Den.',
};

// Always render fresh so the spots-remaining counter and live price are current.
export const dynamic = 'force-dynamic';

export default async function FoundingPage() {
  const claimed = await getFoundingCount();
  const pricing = resolveFoundingPricing(claimed);

  return <FoundingClient claimed={claimed} cap={foundingCap} pricing={pricing} />;
}
