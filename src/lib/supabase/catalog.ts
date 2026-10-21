import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";

export function createCatalogClient() {
  const { url, key } = getSupabaseConfig();

  // Deliberately separate from the session client: public reads never inherit
  // an administrator's cookies, access token or broader RLS permissions.
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}
