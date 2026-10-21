"use client";

import { createClient } from "@/lib/supabase/client";

// Keeps the existing import used by the admin panel on the shared auth client.
export const supabase = createClient();
