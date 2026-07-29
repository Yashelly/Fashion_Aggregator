import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let serverClient: SupabaseClient | null | undefined;

/**
 * Returns an admin client only on the server. The service role key must never
 * use a NEXT_PUBLIC_ prefix or be passed into browser components.
 */
export function getSupabaseServerClient() {
  if (serverClient !== undefined) return serverClient;

  const supabaseUrl =
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    serverClient = null;
    return serverClient;
  }

  try {
    serverClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch {
    serverClient = null;
  }

  return serverClient;
}
