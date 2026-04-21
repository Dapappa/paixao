-- Migration 2: Events, Registrations, Event Photos
-- Paixao - Event management tables

-- =============================================================================
-- EVENTS
-- =============================================================================
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  event_type TEXT NOT NULL
    CHECK (event_type IN ('party','workshop','munch','play_party','social','private','other')),
  venue_name TEXT,
  venue_address TEXT,
  location_city TEXT,
  location_province TEXT DEFAULT 'Alberta',
  is_virtual BOOLEAN DEFAULT FALSE,
  virtual_link TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'America/Edmonton',
  capacity INTEGER,
  current_attendees INTEGER DEFAULT 0,
  price_cents INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'CAD',
  dress_code TEXT,
  rules TEXT,
  requirements TEXT[],
  age_minimum INTEGER DEFAULT 18,
  cover_image_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  requires_approval BOOLEAN DEFAULT FALSE,
  requires_verification BOOLEAN DEFAULT FALSE,
  allow_plus_ones BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','published','cancelled','completed')),
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- EVENT REGISTRATIONS
-- =============================================================================
CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','waitlisted','cancelled')),
  ticket_type TEXT DEFAULT 'general',
  plus_ones INTEGER DEFAULT 0,
  amount_paid_cents INTEGER DEFAULT 0,
  payment_status TEXT DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid','paid','refunded','comped')),
  notes TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, profile_id)
);

-- =============================================================================
-- EVENT PHOTOS
-- =============================================================================
CREATE TABLE public.event_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  caption TEXT,
  is_cover BOOLEAN DEFAULT FALSE,
  is_nsfw BOOLEAN DEFAULT FALSE,
  moderation_status TEXT DEFAULT 'pending'
    CHECK (moderation_status IN ('pending','approved','rejected')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX idx_events_host ON public.events(host_id);
CREATE INDEX idx_events_type ON public.events(event_type);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_starts_at ON public.events(starts_at);
CREATE INDEX idx_events_location ON public.events(location_city);
CREATE INDEX idx_events_published ON public.events(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_events_featured ON public.events(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_registrations_event ON public.event_registrations(event_id);
CREATE INDEX idx_registrations_profile ON public.event_registrations(profile_id);
CREATE INDEX idx_registrations_status ON public.event_registrations(status);
CREATE INDEX idx_event_photos_event ON public.event_photos(event_id);
CREATE INDEX idx_event_photos_uploader ON public.event_photos(uploaded_by);
CREATE INDEX idx_event_photos_moderation ON public.event_photos(moderation_status);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Updated_at trigger for events
CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Updated_at trigger for registrations
CREATE TRIGGER set_registrations_updated_at
  BEFORE UPDATE ON event_registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update attendee count when registrations change
CREATE OR REPLACE FUNCTION update_attendee_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.events
    SET current_attendees = (
      SELECT COUNT(*)
      FROM public.event_registrations
      WHERE event_id = NEW.event_id
        AND status = 'approved'
    )
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.events
    SET current_attendees = (
      SELECT COUNT(*)
      FROM public.event_registrations
      WHERE event_id = OLD.event_id
        AND status = 'approved'
    )
    WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_event_attendees
  AFTER INSERT OR UPDATE OR DELETE ON event_registrations
  FOR EACH ROW EXECUTE FUNCTION update_attendee_count();
