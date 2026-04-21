-- Migration 7: Row-Level Security Policies
-- Paixao - Enable RLS on all tables and define access policies
--
-- Conventions:
--   auth.uid()         = the currently authenticated user's UUID
--   is_blocked()       = helper from migration 5
--   Admins/moderators  = profiles with role IN ('admin','moderator')

-- =============================================================================
-- ENABLE RLS ON ALL TABLES
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boundaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safe_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- HELPER: admin/moderator check
-- =============================================================================
CREATE OR REPLACE FUNCTION is_admin_or_moderator()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================================================
-- PROFILES
-- =============================================================================
CREATE POLICY "Users can view visible profiles"
  ON public.profiles FOR SELECT
  USING (
    profile_visibility = 'visible'
    OR id = auth.uid()
    OR is_admin_or_moderator()
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Insert handled by the handle_new_user() trigger (SECURITY DEFINER)
-- No direct insert policy needed for regular users

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (is_admin_or_moderator());

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (is_admin_or_moderator() OR id = auth.uid());

-- =============================================================================
-- INTERESTS (read-only for users, managed by admins)
-- =============================================================================
CREATE POLICY "Anyone can view active interests"
  ON public.interests FOR SELECT
  USING (is_active = TRUE OR is_admin_or_moderator());

CREATE POLICY "Admins can manage interests"
  ON public.interests FOR ALL
  USING (is_admin_or_moderator());

-- =============================================================================
-- PROFILE INTERESTS
-- =============================================================================
CREATE POLICY "Users can view profile interests"
  ON public.profile_interests FOR SELECT
  USING (
    profile_id = auth.uid()
    OR is_admin_or_moderator()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = profile_interests.profile_id
        AND profile_visibility = 'visible'
    )
  );

CREATE POLICY "Users can manage own profile interests"
  ON public.profile_interests FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own profile interests"
  ON public.profile_interests FOR UPDATE
  USING (profile_id = auth.uid());

CREATE POLICY "Users can delete own profile interests"
  ON public.profile_interests FOR DELETE
  USING (profile_id = auth.uid());

-- =============================================================================
-- PROFILE PHOTOS
-- =============================================================================
CREATE POLICY "Users can view approved public photos"
  ON public.profile_photos FOR SELECT
  USING (
    profile_id = auth.uid()
    OR is_admin_or_moderator()
    OR (
      moderation_status = 'approved'
      AND is_private = FALSE
      AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = profile_photos.profile_id
          AND profile_visibility = 'visible'
      )
    )
  );

CREATE POLICY "Users can view private photos with consent"
  ON public.profile_photos FOR SELECT
  USING (
    is_private = TRUE
    AND moderation_status = 'approved'
    AND EXISTS (
      SELECT 1 FROM public.consent_records
      WHERE requester_id = auth.uid()
        AND responder_id = profile_photos.profile_id
        AND consent_type = 'private_photos'
        AND status = 'granted'
    )
  );

CREATE POLICY "Users can manage own photos"
  ON public.profile_photos FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own photos"
  ON public.profile_photos FOR UPDATE
  USING (profile_id = auth.uid());

CREATE POLICY "Users can delete own photos"
  ON public.profile_photos FOR DELETE
  USING (profile_id = auth.uid());

CREATE POLICY "Admins can manage all photos"
  ON public.profile_photos FOR ALL
  USING (is_admin_or_moderator());

-- =============================================================================
-- BOUNDARIES
-- =============================================================================
CREATE POLICY "Users can view own boundaries"
  ON public.boundaries FOR SELECT
  USING (profile_id = auth.uid() OR is_admin_or_moderator());

CREATE POLICY "Matched users can view boundaries"
  ON public.boundaries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE status = 'active'
        AND (
          (profile_a = auth.uid() AND profile_b = boundaries.profile_id)
          OR (profile_b = auth.uid() AND profile_a = boundaries.profile_id)
        )
    )
  );

CREATE POLICY "Users can manage own boundaries"
  ON public.boundaries FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own boundaries"
  ON public.boundaries FOR UPDATE
  USING (profile_id = auth.uid());

CREATE POLICY "Users can delete own boundaries"
  ON public.boundaries FOR DELETE
  USING (profile_id = auth.uid());

-- =============================================================================
-- EVENTS
-- =============================================================================
CREATE POLICY "Anyone can view published events"
  ON public.events FOR SELECT
  USING (
    (is_published = TRUE AND status = 'published')
    OR host_id = auth.uid()
    OR is_admin_or_moderator()
  );

CREATE POLICY "Hosts can create events"
  ON public.events FOR INSERT
  WITH CHECK (
    host_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('host', 'admin', 'moderator')
    )
  );

CREATE POLICY "Hosts can update own events"
  ON public.events FOR UPDATE
  USING (host_id = auth.uid() OR is_admin_or_moderator());

CREATE POLICY "Hosts can delete own events"
  ON public.events FOR DELETE
  USING (host_id = auth.uid() OR is_admin_or_moderator());

-- =============================================================================
-- EVENT REGISTRATIONS
-- =============================================================================
CREATE POLICY "Users can view own registrations"
  ON public.event_registrations FOR SELECT
  USING (
    profile_id = auth.uid()
    OR is_admin_or_moderator()
    OR EXISTS (
      SELECT 1 FROM public.events
      WHERE id = event_registrations.event_id
        AND host_id = auth.uid()
    )
  );

CREATE POLICY "Users can register for events"
  ON public.event_registrations FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own registration"
  ON public.event_registrations FOR UPDATE
  USING (
    profile_id = auth.uid()
    OR is_admin_or_moderator()
    OR EXISTS (
      SELECT 1 FROM public.events
      WHERE id = event_registrations.event_id
        AND host_id = auth.uid()
    )
  );

CREATE POLICY "Users can cancel own registration"
  ON public.event_registrations FOR DELETE
  USING (profile_id = auth.uid() OR is_admin_or_moderator());

-- =============================================================================
-- EVENT PHOTOS
-- =============================================================================
CREATE POLICY "Anyone can view approved event photos"
  ON public.event_photos FOR SELECT
  USING (
    moderation_status = 'approved'
    OR uploaded_by = auth.uid()
    OR is_admin_or_moderator()
    OR EXISTS (
      SELECT 1 FROM public.events
      WHERE id = event_photos.event_id AND host_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload event photos"
  ON public.event_photos FOR INSERT
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can manage own event photos"
  ON public.event_photos FOR UPDATE
  USING (uploaded_by = auth.uid() OR is_admin_or_moderator());

CREATE POLICY "Users can delete own event photos"
  ON public.event_photos FOR DELETE
  USING (uploaded_by = auth.uid() OR is_admin_or_moderator());

-- =============================================================================
-- MATCH PREFERENCES
-- =============================================================================
CREATE POLICY "Users can view own match preferences"
  ON public.match_preferences FOR SELECT
  USING (profile_id = auth.uid() OR is_admin_or_moderator());

CREATE POLICY "Users can manage own match preferences"
  ON public.match_preferences FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own match preferences"
  ON public.match_preferences FOR UPDATE
  USING (profile_id = auth.uid());

CREATE POLICY "Users can delete own match preferences"
  ON public.match_preferences FOR DELETE
  USING (profile_id = auth.uid());

-- =============================================================================
-- MATCH GROUPS
-- =============================================================================
CREATE POLICY "Members can view their groups"
  ON public.match_groups FOR SELECT
  USING (
    created_by = auth.uid()
    OR is_admin_or_moderator()
    OR EXISTS (
      SELECT 1 FROM public.match_group_members
      WHERE group_id = match_groups.id
        AND profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can create match groups"
  ON public.match_groups FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Owners can update match groups"
  ON public.match_groups FOR UPDATE
  USING (created_by = auth.uid() OR is_admin_or_moderator());

CREATE POLICY "Owners can delete match groups"
  ON public.match_groups FOR DELETE
  USING (created_by = auth.uid() OR is_admin_or_moderator());

-- =============================================================================
-- MATCH GROUP MEMBERS
-- =============================================================================
CREATE POLICY "Members can view group members"
  ON public.match_group_members FOR SELECT
  USING (
    profile_id = auth.uid()
    OR is_admin_or_moderator()
    OR EXISTS (
      SELECT 1 FROM public.match_group_members mgm
      WHERE mgm.group_id = match_group_members.group_id
        AND mgm.profile_id = auth.uid()
    )
  );

CREATE POLICY "Group owners can add members"
  ON public.match_group_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.match_groups
      WHERE id = match_group_members.group_id
        AND created_by = auth.uid()
    )
    OR profile_id = auth.uid()
  );

CREATE POLICY "Group owners can remove members"
  ON public.match_group_members FOR DELETE
  USING (
    profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.match_groups
      WHERE id = match_group_members.group_id
        AND created_by = auth.uid()
    )
    OR is_admin_or_moderator()
  );

-- =============================================================================
-- MATCH ACTIONS
-- =============================================================================
CREATE POLICY "Users can view own match actions"
  ON public.match_actions FOR SELECT
  USING (actor_id = auth.uid() OR is_admin_or_moderator());

CREATE POLICY "Users can create match actions"
  ON public.match_actions FOR INSERT
  WITH CHECK (
    actor_id = auth.uid()
    AND NOT is_blocked(auth.uid(), target_id)
  );

CREATE POLICY "Users can delete own match actions"
  ON public.match_actions FOR DELETE
  USING (actor_id = auth.uid());

-- =============================================================================
-- MATCHES
-- =============================================================================
CREATE POLICY "Users can view own matches"
  ON public.matches FOR SELECT
  USING (
    profile_a = auth.uid()
    OR profile_b = auth.uid()
    OR is_admin_or_moderator()
  );

CREATE POLICY "Users can update own matches (unmatch)"
  ON public.matches FOR UPDATE
  USING (
    profile_a = auth.uid()
    OR profile_b = auth.uid()
    OR is_admin_or_moderator()
  );

-- =============================================================================
-- CONVERSATIONS
-- =============================================================================
CREATE POLICY "Participants can view own conversations"
  ON public.conversations FOR SELECT
  USING (
    participant_a = auth.uid()
    OR participant_b = auth.uid()
    OR is_admin_or_moderator()
  );

CREATE POLICY "Participants can update own conversations"
  ON public.conversations FOR UPDATE
  USING (
    participant_a = auth.uid()
    OR participant_b = auth.uid()
  );

-- Conversations are created by the check_mutual_match trigger (SECURITY DEFINER)
-- Allow explicit creation only between matched users
CREATE POLICY "Matched users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (
    (participant_a = auth.uid() OR participant_b = auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.matches
      WHERE status = 'active'
        AND (
          (profile_a = LEAST(conversations.participant_a, conversations.participant_b)
           AND profile_b = GREATEST(conversations.participant_a, conversations.participant_b))
        )
    )
  );

-- =============================================================================
-- MESSAGES
-- =============================================================================
CREATE POLICY "Conversation participants can view messages"
  ON public.messages FOR SELECT
  USING (
    is_admin_or_moderator()
    OR EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = messages.conversation_id
        AND (participant_a = auth.uid() OR participant_b = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = messages.conversation_id
        AND (participant_a = auth.uid() OR participant_b = auth.uid())
    )
    AND NOT is_blocked(
      auth.uid(),
      (SELECT CASE WHEN participant_a = auth.uid() THEN participant_b ELSE participant_a END
       FROM public.conversations WHERE id = messages.conversation_id)
    )
  );

CREATE POLICY "Senders can update own messages"
  ON public.messages FOR UPDATE
  USING (sender_id = auth.uid() OR is_admin_or_moderator());

CREATE POLICY "Senders can delete own messages"
  ON public.messages FOR DELETE
  USING (sender_id = auth.uid() OR is_admin_or_moderator());

-- =============================================================================
-- GROUP CONVERSATIONS
-- =============================================================================
CREATE POLICY "Members can view group conversations"
  ON public.group_conversations FOR SELECT
  USING (
    created_by = auth.uid()
    OR is_admin_or_moderator()
    OR EXISTS (
      SELECT 1 FROM public.group_conversation_members
      WHERE group_conversation_id = group_conversations.id
        AND profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can create group conversations"
  ON public.group_conversations FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Owners can update group conversations"
  ON public.group_conversations FOR UPDATE
  USING (created_by = auth.uid() OR is_admin_or_moderator());

CREATE POLICY "Owners can delete group conversations"
  ON public.group_conversations FOR DELETE
  USING (created_by = auth.uid() OR is_admin_or_moderator());

-- =============================================================================
-- GROUP CONVERSATION MEMBERS
-- =============================================================================
CREATE POLICY "Members can view group members"
  ON public.group_conversation_members FOR SELECT
  USING (
    profile_id = auth.uid()
    OR is_admin_or_moderator()
    OR EXISTS (
      SELECT 1 FROM public.group_conversation_members gcm
      WHERE gcm.group_conversation_id = group_conversation_members.group_conversation_id
        AND gcm.profile_id = auth.uid()
    )
  );

CREATE POLICY "Group owners/admins can add members"
  ON public.group_conversation_members FOR INSERT
  WITH CHECK (
    profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.group_conversations
      WHERE id = group_conversation_members.group_conversation_id
        AND created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.group_conversation_members gcm
      WHERE gcm.group_conversation_id = group_conversation_members.group_conversation_id
        AND gcm.profile_id = auth.uid()
        AND gcm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Members can leave or be removed"
  ON public.group_conversation_members FOR DELETE
  USING (
    profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.group_conversations
      WHERE id = group_conversation_members.group_conversation_id
        AND created_by = auth.uid()
    )
    OR is_admin_or_moderator()
  );

-- =============================================================================
-- GROUP MESSAGES
-- =============================================================================
CREATE POLICY "Group members can view messages"
  ON public.group_messages FOR SELECT
  USING (
    is_admin_or_moderator()
    OR EXISTS (
      SELECT 1 FROM public.group_conversation_members
      WHERE group_conversation_id = group_messages.group_conversation_id
        AND profile_id = auth.uid()
    )
  );

CREATE POLICY "Group members can send messages"
  ON public.group_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.group_conversation_members
      WHERE group_conversation_id = group_messages.group_conversation_id
        AND profile_id = auth.uid()
    )
  );

CREATE POLICY "Senders can update own group messages"
  ON public.group_messages FOR UPDATE
  USING (sender_id = auth.uid() OR is_admin_or_moderator());

CREATE POLICY "Senders can delete own group messages"
  ON public.group_messages FOR DELETE
  USING (sender_id = auth.uid() OR is_admin_or_moderator());

-- =============================================================================
-- CONSENT RECORDS
-- =============================================================================
CREATE POLICY "Participants can view their consent records"
  ON public.consent_records FOR SELECT
  USING (
    requester_id = auth.uid()
    OR responder_id = auth.uid()
    OR is_admin_or_moderator()
  );

CREATE POLICY "Users can create consent requests"
  ON public.consent_records FOR INSERT
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Responders can update consent status"
  ON public.consent_records FOR UPDATE
  USING (
    responder_id = auth.uid()
    OR requester_id = auth.uid()
    OR is_admin_or_moderator()
  );

-- =============================================================================
-- REPORTS
-- =============================================================================
CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT
  USING (reporter_id = auth.uid() OR is_admin_or_moderator());

CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Admins can update reports"
  ON public.reports FOR UPDATE
  USING (is_admin_or_moderator());

-- =============================================================================
-- BLOCKS
-- =============================================================================
CREATE POLICY "Users can view own blocks"
  ON public.blocks FOR SELECT
  USING (blocker_id = auth.uid() OR is_admin_or_moderator());

CREATE POLICY "Users can create blocks"
  ON public.blocks FOR INSERT
  WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "Users can remove own blocks"
  ON public.blocks FOR DELETE
  USING (blocker_id = auth.uid());

-- =============================================================================
-- SAFE WORDS
-- =============================================================================
CREATE POLICY "Users can view own safe words"
  ON public.safe_words FOR SELECT
  USING (profile_id = auth.uid() OR is_admin_or_moderator());

CREATE POLICY "Users can create safe words"
  ON public.safe_words FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own safe words"
  ON public.safe_words FOR UPDATE
  USING (profile_id = auth.uid());

CREATE POLICY "Users can delete own safe words"
  ON public.safe_words FOR DELETE
  USING (profile_id = auth.uid());

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (profile_id = auth.uid() OR is_admin_or_moderator());

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (is_admin_or_moderator() OR profile_id = auth.uid());

CREATE POLICY "Users can update own notifications (mark read)"
  ON public.notifications FOR UPDATE
  USING (profile_id = auth.uid());

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (profile_id = auth.uid() OR is_admin_or_moderator());

-- =============================================================================
-- NOTIFICATION PREFERENCES
-- =============================================================================
CREATE POLICY "Users can view own notification preferences"
  ON public.notification_preferences FOR SELECT
  USING (profile_id = auth.uid() OR is_admin_or_moderator());

CREATE POLICY "Users can create own notification preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own notification preferences"
  ON public.notification_preferences FOR UPDATE
  USING (profile_id = auth.uid());

-- =============================================================================
-- VERIFICATION SUBMISSIONS
-- =============================================================================
CREATE POLICY "Users can view own verification submissions"
  ON public.verification_submissions FOR SELECT
  USING (profile_id = auth.uid() OR is_admin_or_moderator());

CREATE POLICY "Users can create verification submissions"
  ON public.verification_submissions FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Admins can update verifications"
  ON public.verification_submissions FOR UPDATE
  USING (is_admin_or_moderator());

-- =============================================================================
-- HOST APPLICATIONS
-- =============================================================================
CREATE POLICY "Users can view own host applications"
  ON public.host_applications FOR SELECT
  USING (profile_id = auth.uid() OR is_admin_or_moderator());

CREATE POLICY "Users can create host applications"
  ON public.host_applications FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own pending applications"
  ON public.host_applications FOR UPDATE
  USING (
    (profile_id = auth.uid() AND status = 'pending')
    OR is_admin_or_moderator()
  );

-- =============================================================================
-- PAYMENTS
-- =============================================================================
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (profile_id = auth.uid() OR is_admin_or_moderator());

CREATE POLICY "System can create payments"
  ON public.payments FOR INSERT
  WITH CHECK (profile_id = auth.uid() OR is_admin_or_moderator());

CREATE POLICY "Admins can update payments"
  ON public.payments FOR UPDATE
  USING (is_admin_or_moderator());

-- =============================================================================
-- AUDIT LOG (admin-only)
-- =============================================================================
CREATE POLICY "Admins can view audit log"
  ON public.audit_log FOR SELECT
  USING (is_admin_or_moderator());

CREATE POLICY "System can insert audit log"
  ON public.audit_log FOR INSERT
  WITH CHECK (TRUE); -- Inserts come from SECURITY DEFINER functions
