import "server-only";

import { createClient } from "@supabase/supabase-js";

// Never share this client with browser components or attach user cookies to it.
export function createPrivilegedClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || new URL(url).origin !== "https://kfedztfrcolradstwetk.supabase.co" || !key) {
    throw new Error("CHECKOUT_CONFIGURATION");
  }
  const isLegacyServiceKey = (() => {
    try { return JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString()).role === "service_role"; }
    catch { return false; }
  })();
  if (!key.startsWith("sb_secret_") && !isLegacyServiceKey) throw new Error("CHECKOUT_CONFIGURATION");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
