import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client: bypasses storage policies. Server actions only, and only after the
 * caller has been checked against the order or application the file belongs to.
 * Used to sign short-lived links for prescriptions, so staff never get blanket read access to the bucket.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
