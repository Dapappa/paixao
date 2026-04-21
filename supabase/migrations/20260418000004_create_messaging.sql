-- Migration 4: Messaging — Conversations, Messages, Group Conversations
-- Paixao - Direct and group messaging tables
--
-- After creating the conversations table, this migration replaces
-- check_mutual_match() to auto-create a conversation on match.

-- =============================================================================
-- CONVERSATIONS (1-to-1 DMs between matched users)
-- =============================================================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_a UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_b UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  is_archived_a BOOLEAN DEFAULT FALSE,
  is_archived_b BOOLEAN DEFAULT FALSE,
  is_muted_a BOOLEAN DEFAULT FALSE,
  is_muted_b BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_a, participant_b),
  CHECK (participant_a < participant_b) -- enforce ordering
);

-- =============================================================================
-- MESSAGES
-- =============================================================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT, -- may be NULL for media-only messages
  encrypted_content TEXT, -- E2E encrypted content
  message_type TEXT DEFAULT 'text'
    CHECK (message_type IN ('text','image','video','audio','system','consent_request','safe_word')),
  media_url TEXT,
  media_type TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  reply_to_id UUID REFERENCES public.messages(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- GROUP CONVERSATIONS
-- =============================================================================
CREATE TABLE public.group_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  max_members INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT TRUE,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- GROUP CONVERSATION MEMBERS
-- =============================================================================
CREATE TABLE public.group_conversation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_conversation_id UUID NOT NULL REFERENCES public.group_conversations(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member'
    CHECK (role IN ('owner','admin','member')),
  is_muted BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,
  UNIQUE(group_conversation_id, profile_id)
);

-- =============================================================================
-- GROUP MESSAGES
-- =============================================================================
CREATE TABLE public.group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_conversation_id UUID NOT NULL REFERENCES public.group_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT,
  encrypted_content TEXT,
  message_type TEXT DEFAULT 'text'
    CHECK (message_type IN ('text','image','video','audio','system')),
  media_url TEXT,
  media_type TEXT,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  reply_to_id UUID REFERENCES public.group_messages(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX idx_conversations_participant_a ON public.conversations(participant_a);
CREATE INDEX idx_conversations_participant_b ON public.conversations(participant_b);
CREATE INDEX idx_conversations_last_message ON public.conversations(last_message_at DESC);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX idx_messages_unread ON public.messages(conversation_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_group_conversations_creator ON public.group_conversations(created_by);
CREATE INDEX idx_group_members_conversation ON public.group_conversation_members(group_conversation_id);
CREATE INDEX idx_group_members_profile ON public.group_conversation_members(profile_id);
CREATE INDEX idx_group_messages_conversation ON public.group_messages(group_conversation_id);
CREATE INDEX idx_group_messages_sender ON public.group_messages(sender_id);
CREATE INDEX idx_group_messages_created ON public.group_messages(created_at DESC);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Updated_at triggers
CREATE TRIGGER set_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_group_conversations_updated_at
  BEFORE UPDATE ON group_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- REPLACE check_mutual_match() to include conversation auto-creation
-- Now that the conversations table exists, the function can insert into it.
-- =============================================================================
CREATE OR REPLACE FUNCTION check_mutual_match()
RETURNS TRIGGER AS $$
DECLARE
  v_reverse_action TEXT;
  v_profile_a UUID;
  v_profile_b UUID;
  v_match_id UUID;
  v_conversation_id UUID;
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

  -- If mutual interest exists, create a match and a conversation
  IF v_reverse_action IS NOT NULL THEN
    -- Enforce profile_a < profile_b ordering
    IF NEW.actor_id < NEW.target_id THEN
      v_profile_a := NEW.actor_id;
      v_profile_b := NEW.target_id;
    ELSE
      v_profile_a := NEW.target_id;
      v_profile_b := NEW.actor_id;
    END IF;

    -- Create conversation
    INSERT INTO public.conversations (participant_a, participant_b)
    VALUES (v_profile_a, v_profile_b)
    ON CONFLICT (participant_a, participant_b) DO UPDATE
      SET updated_at = NOW()
    RETURNING id INTO v_conversation_id;

    -- Create match with conversation reference
    INSERT INTO public.matches (profile_a, profile_b, conversation_id)
    VALUES (v_profile_a, v_profile_b, v_conversation_id)
    ON CONFLICT (profile_a, profile_b) DO UPDATE
      SET conversation_id = COALESCE(public.matches.conversation_id, v_conversation_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add the foreign key constraint from matches.conversation_id to conversations.id
-- (deferred from migration 3 because conversations didn't exist yet)
ALTER TABLE public.matches
  ADD CONSTRAINT fk_matches_conversation
  FOREIGN KEY (conversation_id)
  REFERENCES public.conversations(id)
  ON DELETE SET NULL;
