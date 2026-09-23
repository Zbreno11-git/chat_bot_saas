import type { SupabaseClient } from "@supabase/supabase-js";

export type ResolvedAgent = {
  id: string;
  slug: string;
  name: string;
};

// Resolves an agent from its public slug, the "published ID" the browser is
// allowed to send (see CLAUDE.md's architecture rules: the browser never
// picks organization_id, only the server does, by looking up the agent row).
// Returns null for a missing agent AND for one that exists but isn't
// published yet (draft/disabled) -- callers shouldn't distinguish the two,
// so an unpublished agent doesn't leak its existence to the browser.
export async function resolvePublishedAgent(
  supabase: SupabaseClient,
  slug: string
): Promise<ResolvedAgent | null> {
  const { data, error } = await supabase
    .from("agents")
    .select("id, slug, name")
    .eq("slug", slug)
    .eq("state", "published")
    .maybeSingle();

  if (error) throw error;

  return data;
}
