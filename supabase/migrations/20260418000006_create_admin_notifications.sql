-- Migration 6: Admin & Notifications
-- Paixao - Notifications, Verification, Host Applications, Payments, Audit Log

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL
    CHECK (type IN (
      'match','message','event_invite','event_reminder','event_update',
      'consent_request','consent_response','report_update','verification',
      'system','moderation','subscription','safe_word_triggered',
      'host_application','photo_approved','photo_rejected'
    )),
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- NOTIFICATION PREFERENCES
-- =============================================================================
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  push_matches BOOLEAN DEFAULT TRUE,
  push_messages BOOLEAN DEFAULT TRUE,
  push_events BOOLEAN DEFAULT TRUE,
  push_consent BOOLEAN DEFAULT TRUE,
  push_system BOOLEAN DEFAULT TRUE,
  email_matches BOOLEAN DEFAULT TRUE,
  email_messages BOOLEAN DEFAULT FALSE,
  email_events BOOLEAN DEFAULT TRUE,
  email_consent BOOLEAN DEFAULT TRUE,
  email_system BOOLEAN DEFAULT TRUE,
  email_marketing BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- VERIFICATION SUBMISSIONS
-- =============================================================================
CREATE TABLE public.verification_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL
    CHECK (verification_type IN ('photo','id','video','in_person')),
  submission_url TEXT,
  selfie_url TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','expired')),
  reviewer_id UUID REFERENCES public.profiles(id),
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- HOST APPLICATIONS
-- =============================================================================
CREATE TABLE public.host_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  experience_description TEXT NOT NULL,
  event_types_interested TEXT[],
  venue_access BOOLEAN DEFAULT FALSE,
  venue_description TEXT,
  references_text TEXT,
  social_links TEXT[],
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','revoked')),
  reviewer_id UUID REFERENCES public.profiles(id),
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PAYMENTS
-- =============================================================================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL
    CHECK (payment_type IN ('subscription','event_ticket','tip','refund')),
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'CAD',
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','processing','completed','failed','refunded','cancelled')),
  provider TEXT DEFAULT 'stripe'
    CHECK (provider IN ('stripe','paypal','interac')),
  provider_payment_id TEXT,
  provider_customer_id TEXT,
  subscription_tier TEXT,
  event_id UUID REFERENCES public.events(id),
  receipt_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- AUDIT LOG
-- =============================================================================
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX idx_notifications_profile ON public.notifications(profile_id);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_unread ON public.notifications(profile_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX idx_notification_prefs_profile ON public.notification_preferences(profile_id);
CREATE INDEX idx_verification_profile ON public.verification_submissions(profile_id);
CREATE INDEX idx_verification_status ON public.verification_submissions(status);
CREATE INDEX idx_verification_reviewer ON public.verification_submissions(reviewer_id);
CREATE INDEX idx_host_apps_profile ON public.host_applications(profile_id);
CREATE INDEX idx_host_apps_status ON public.host_applications(status);
CREATE INDEX idx_payments_profile ON public.payments(profile_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_type ON public.payments(payment_type);
CREATE INDEX idx_payments_provider ON public.payments(provider_payment_id);
CREATE INDEX idx_payments_event ON public.payments(event_id);
CREATE INDEX idx_audit_actor ON public.audit_log(actor_id);
CREATE INDEX idx_audit_action ON public.audit_log(action);
CREATE INDEX idx_audit_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON public.audit_log(created_at DESC);

-- =============================================================================
-- TRIGGERS
-- =============================================================================
CREATE TRIGGER set_notification_prefs_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_verification_updated_at
  BEFORE UPDATE ON verification_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_host_apps_updated_at
  BEFORE UPDATE ON host_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
