-- Migration 3: Matchmaking — Preferences, Groups, Actions, Matches
-- Paixao - Matchmaking and compatibility tables
--
-- NOTE: The check_mutual_match() function is created here WITHOUT the
-- automatic conversation insert. Migration 4 replaces the function body
-- after the conversations table exists.

-- =============================================================================
-- MATCH PREFERENCES
-- =============================================================================
CREATE TABLE public.match_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  preferred_genders TEXT[],
  preferred_age_min INTEGER DEFAULT 18,
  preferred_age_max INTEGER DEFAULT 99,
  preferred_distance_km INTEGER DEFAULT 100,
  preferred_experience_levels TEXT[],
  preferred_relationship_types TEXT[],
  deal_breakers TEXT[],
  show_me_to TEXT DEFAULT 'everyone'
    CHECK (show_me_to IN ('everyone','matches_only','nobody')),
  allow_messages_from TEXT DEFAULT 'matches'
    CHECK (allow_messages_from IN ('everyone','matches','nobody')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- MATCH GROUPS (for group matching / play-partner groups)
-- =============================================================================
CREATE TABLE public.match_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_type TEXT DEFAULT 'couple'
    CHECK (group_type IN ('couple','triad','quad','polycule','custom')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- MATCH GROUP MEMBERS
-- =============================================================================
CREATE TABLE public.match_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.match_groups(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member'
    CHECK (role IN ('owner','admin','member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, profile_id)
);

-- =============================================================================
-- MATCH ACTIONS (swipes / likes / passes)
-- =============================================================================
CREATE TABLE public.match_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL
    CHECK (action IN ('like','pass','super_like')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(actor_id, target_id)
);

-- =============================================================================
-- MATCHES (confirmed mutual matches)
-- =============================================================================
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_a UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_b UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active','unmatched','blocked')),
  unmatched_at TIMESTAMPTZ,
  unmatched_by UUID REFERENCES public.profiles(id),
  conversation_id UUID, -- will reference conversations after migration 4
  compatibility_score FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_a, profile_b),
  CHECK (profile_a < profile_b) -- enforce ordering to prevent duplicates
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX idx_match_preferences_profile ON public.match_preferences(profile_id);
CREATE INDEX idx_match_groups_creator ON public.match_groups(created_by);
CREATE INDEX idx_match_group_members_group ON public.match_group_members(group_id);
CREATE INDEX idx_match_group_members_profile ON public.match_group_members(profile_id);
CREATE INDEX idx_match_actions_actor ON public.match_actions(actor_id);
CREATE INDEX idx_match_actions_target ON public.match_actions(target_id);
CREATE INDEX idx_match_actions_pair ON public.match_actions(actor_id, target_id);
CREATE INDEX idx_matches_profile_a ON public.matches(profile_a);
CREATE INDEX idx_matches_profile_b ON public.matches(profile_b);
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_matches_conversation ON public.matches(conversation_id);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Updated_at triggers
CREATE TRIGGER set_match_preferences_updated_at
  BEFORE UPDATE ON match_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_match_groups_updated_at
  BEFORE UPDATE ON match_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Mutual match detection (Phase 1: without conversation creation)
-- This function is replaced in migration 4 after the conversations table exists.
CREATE OR REPLACE FUNCTION check_mutual_match()
RETURNS TRIGGER AS $$
DECLARE
  v_reverse_action TEXT;
  v_profile_a UUID;
  v_profile_b UUID;
BEGIN
  -- Only proceed if the action is a like or super_like
  IF NEW.action NOT IN ('like', 'super_like') THEN
    RETURN NEW;
  END IF;

  -- Check if there is a reciprocal like/super_like
  SELECT action INTO v_reverse_action
  FROM public.match_actions
  WHERE actor_id = NEW.target_id
    AND target_id = NEW.actor_id
    AND action IN ('like', 'super_like');

  -- If mutual interest exists, create a match
  IF v_reverse_action IS NOT NULL THEN
    -- Enforce profile_a < profile_b ordering
    IF NEW.actor_id < NEW.target_id THEN
      v_profile_a := NEW.actor_id;
      v_profile_b := NEW.target_id;
    ELSE
      v_profile_a := NEW.target_id;
      v_profile_b := NEW.actor_id;
    END IF;

    -- Insert match (ignore if already exists)
    INSERT INTO public.matches (profile_a, profile_b)
    VALUES (v_profile_a, v_profile_b)
    ON CONFLICT (profile_a, profile_b) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_match_action
  AFTER INSERT ON match_actions
  FOR EACH ROW EXECUTE FUNCTION check_mutual_match();
