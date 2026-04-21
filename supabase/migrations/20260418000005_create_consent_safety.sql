-- Migration 5: Consent & Safety — Consent Records, Reports, Blocks, Safe Words
-- Paixao - Consent-first safety infrastructure

-- =============================================================================
-- CONSENT RECORDS
-- =============================================================================
CREATE TABLE public.consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL
    CHECK (consent_type IN ('photo_sharing','nsfw_content','private_photos','meeting','play','contact_info','video_call')),
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','granted','denied','revoked','expired')),
  message TEXT,
  response_message TEXT,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- REPORTS
-- =============================================================================
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL
    CHECK (report_type IN (
      'harassment','non_consensual','impersonation','underage',
      'spam','hate_speech','threats','doxxing','revenge_porn',
      'boundary_violation','unsafe_behaviour','other'
    )),
  description TEXT NOT NULL,
  evidence_urls TEXT[],
  related_message_id UUID REFERENCES public.messages(id),
  related_event_id UUID REFERENCES public.events(id),
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','investigating','resolved','dismissed','escalated')),
  severity TEXT DEFAULT 'medium'
    CHECK (severity IN ('low','medium','high','critical')),
  assigned_to UUID REFERENCES public.profiles(id),
  resolution_notes TEXT,
  action_taken TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- BLOCKS
-- =============================================================================
CREATE TABLE public.blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- =============================================================================
-- SAFE WORDS (per-user or per-conversation safe word configuration)
-- =============================================================================
CREATE TABLE public.safe_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  action TEXT DEFAULT 'pause'
    CHECK (action IN ('pause','stop','alert_moderator','end_conversation')),
  is_active BOOLEAN DEFAULT TRUE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX idx_consent_requester ON public.consent_records(requester_id);
CREATE INDEX idx_consent_responder ON public.consent_records(responder_id);
CREATE INDEX idx_consent_status ON public.consent_records(status);
CREATE INDEX idx_consent_type ON public.consent_records(consent_type);
CREATE INDEX idx_reports_reporter ON public.reports(reporter_id);
CREATE INDEX idx_reports_reported ON public.reports(reported_id);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_severity ON public.reports(severity);
CREATE INDEX idx_reports_assigned ON public.reports(assigned_to);
CREATE INDEX idx_blocks_blocker ON public.blocks(blocker_id);
CREATE INDEX idx_blocks_blocked ON public.blocks(blocked_id);
CREATE INDEX idx_blocks_pair ON public.blocks(blocker_id, blocked_id);
CREATE INDEX idx_safe_words_profile ON public.safe_words(profile_id);
CREATE INDEX idx_safe_words_conversation ON public.safe_words(conversation_id);

-- =============================================================================
-- TRIGGERS
-- =============================================================================
CREATE TRIGGER set_consent_updated_at
  BEFORE UPDATE ON consent_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_safe_words_updated_at
  BEFORE UPDATE ON safe_words
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- UTILITY FUNCTION: check if a block exists between two users
-- =============================================================================
CREATE OR REPLACE FUNCTION is_blocked(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.blocks
    WHERE (blocker_id = user_a AND blocked_id = user_b)
       OR (blocker_id = user_b AND blocked_id = user_a)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
