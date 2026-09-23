import { createClient } from "@supabase/supabase-js";

// Server-only client: uses the secret key, which bypasses RLS.
// Never import this from app code that runs in the browser.
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");
  }

  return createClient(supabaseUrl, supabaseSecretKey);
}
