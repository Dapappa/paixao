import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  tagline: string | null;
  bio: string | null;
  gender: string | null;
  pronouns: string | null;
  sexuality: string | null;
  relationship_status: string | null;
  looking_for: string[];
  location: string | null;
  experience_level: string | null;
  interests: UserInterest[];
  boundaries: Boundary[];
  profile_visibility: "visible" | "hidden" | "matches_only";
  onboarding_completed: boolean;
  subscription_tier: string;
  photos: Photo[];
  created_at: string;
  updated_at: string;
}

export interface UserInterest {
  interest_id: string;
  level: "curious" | "interested" | "experienced" | "expert";
  is_hard_limit: boolean;
}

export interface Boundary {
  id: string;
  type: "hard_limit" | "soft_limit" | "must_have";
  category: string;
  description: string;
}

export interface Photo {
  id: string;
  url: string;
  is_primary: boolean;
  is_private: boolean;
  is_nsfw: boolean;
  order: number;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;

  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (isLoading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,

  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  clearAuth: () =>
    set({ session: null, user: null, profile: null, isLoading: false }),
}));
