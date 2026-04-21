-- Migration 1: Profiles, Interests, Photos, Boundaries
-- Paixao - Core identity and preference tables

-- =============================================================================
-- PROFILES
-- =============================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL UNIQUE,
  tagline TEXT,
  bio TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  gender TEXT,
  pronouns TEXT,
  sexuality TEXT,
  relationship_status TEXT,
  looking_for TEXT[],
  location_city TEXT,
  location_province TEXT DEFAULT 'Alberta',
  experience_level TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  profile_visibility TEXT DEFAULT 'visible'
    CHECK (profile_visibility IN ('visible','hidden','matches_only')),
  is_verified BOOLEAN DEFAULT FALSE,
  verification_method TEXT,
  verified_at TIMESTAMPTZ,
  role TEXT DEFAULT 'member'
    CHECK (role IN ('member','host','moderator','admin')),
  subscription_tier TEXT DEFAULT 'free'
    CHECK (subscription_tier IN ('free','desire','obsession','patron')),
  subscription_expires_at TIMESTAMPTZ,
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  banned_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  public_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INTERESTS (master list)
-- =============================================================================
CREATE TABLE public.interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PROFILE <-> INTEREST junction
-- =============================================================================
CREATE TABLE public.profile_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  interest_id UUID NOT NULL REFERENCES public.interests(id) ON DELETE CASCADE,
  interest_level TEXT DEFAULT 'interested'
    CHECK (interest_level IN ('curious','interested','experienced','expert')),
  is_hard_limit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, interest_id)
);

-- =============================================================================
-- PROFILE PHOTOS
-- =============================================================================
CREATE TABLE public.profile_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE,
  is_nsfw BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  moderation_status TEXT DEFAULT 'pending'
    CHECK (moderation_status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- BOUNDARIES
-- =============================================================================
CREATE TABLE public.boundaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  boundary_type TEXT NOT NULL
    CHECK (boundary_type IN ('hard_limit','soft_limit','must_have')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX idx_profiles_display_name ON public.profiles(display_name);
CREATE INDEX idx_profiles_location ON public.profiles(location_city);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_visibility ON public.profiles(profile_visibility);
CREATE INDEX idx_profiles_subscription ON public.profiles(subscription_tier);
CREATE INDEX idx_profiles_last_active ON public.profiles(last_active_at DESC);
CREATE INDEX idx_profile_interests_profile ON public.profile_interests(profile_id);
CREATE INDEX idx_profile_interests_interest ON public.profile_interests(interest_id);
CREATE INDEX idx_photos_profile ON public.profile_photos(profile_id);
CREATE INDEX idx_photos_moderation ON public.profile_photos(moderation_status);
CREATE INDEX idx_boundaries_profile ON public.boundaries(profile_id);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Generic updated_at trigger function (reused across tables)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_boundaries_updated_at
  BEFORE UPDATE ON boundaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create a profile row when a new auth user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, 'user_' || LEFT(NEW.id::TEXT, 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
