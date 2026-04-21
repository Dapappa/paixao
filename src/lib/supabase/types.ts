/**
 * Supabase Database types.
 *
 * This file is a placeholder. After running the Supabase migrations, generate
 * the real types with:
 *
 *   npx supabase gen types typescript --local > src/lib/supabase/types.ts
 *
 * or for a remote project:
 *
 *   npx supabase gen types typescript --project-id <project-id> > src/lib/supabase/types.ts
 *
 * The generated file will replace this placeholder entirely.
 */

export type Database = {
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
