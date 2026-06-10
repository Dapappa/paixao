import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Count paid founding members. Resilient: returns 0 if Supabase isn't
 * configured yet, so the funnel still renders during setup.
 *
 * Used by BOTH the /founding page (to display the live price) and the checkout
 * route (to charge it) — keeping a single source of truth for the count.
 */
export async function getFoundingCount(): Promise<number> {
  try {
    const admin = createAdminClient();
    const { count, error } = await (admin.from('waitlist') as any)
      .select('*', { count: 'exact', head: true })
      .eq('is_founding', true);
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}
