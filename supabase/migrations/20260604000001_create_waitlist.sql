-- Migration 8: Waitlist & Founding Pre-Sale
-- Paixao - Demand-validation funnel (landing → waitlist + founding membership)

-- =============================================================================
-- WAITLIST
-- =============================================================================
-- Captures both free waitlist signups and paid founding members. All writes go
-- through the service-role API (admin client), so RLS denies anon/authenticated
-- access by default — there are intentionally no public policies on this table.
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  city TEXT,
  -- What the visitor is here for: e.g. {'events','matchmaking'}
  interested_in TEXT[] DEFAULT '{}',
  -- Marketing attribution (utm_source / campaign tag from the landing URL)
  source TEXT,
  -- Funnel state
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','founding','converted')),
  is_founding BOOLEAN NOT NULL DEFAULT FALSE,
  founding_paid_at TIMESTAMPTZ,
  stripe_session_id TEXT,
  amount_cents INTEGER,
  currency TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX idx_waitlist_status ON public.waitlist(status);
CREATE INDEX idx_waitlist_is_founding ON public.waitlist(is_founding);
CREATE INDEX idx_waitlist_created ON public.waitlist(created_at DESC);
CREATE UNIQUE INDEX idx_waitlist_stripe_session
  ON public.waitlist(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

-- =============================================================================
-- TRIGGERS
-- =============================================================================
-- Reuses update_updated_at() defined in migration 1.
CREATE TRIGGER set_waitlist_updated_at
  BEFORE UPDATE ON public.waitlist
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- RLS — lock the table down; only the service role (API) may read/write.
-- =============================================================================
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
-- No policies are created, so PostgREST (anon/authenticated) is denied all
-- access. The service-role key bypasses RLS for trusted server-side writes.
