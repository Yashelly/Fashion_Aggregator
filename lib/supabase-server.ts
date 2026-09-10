import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let serverClient: SupabaseClient | null | undefined;
let publicServerClient: SupabaseClient | null | undefined;

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

/**
 * Returns a least-privilege server-side client for public, RLS-protected reads.
 * This deliberately uses the publishable/anon key instead of service_role so
 * search RPCs remain subject to the same database policy as any public caller.
 */
export function getSupabasePublicServerClient() {
  if (publicServerClient !== undefined) return publicServerClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !publishableKey) {
    publicServerClient = null;
    return publicServerClient;
  }

  try {
    publicServerClient = createClient(supabaseUrl, publishableKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch {
    publicServerClient = null;
  }

  return publicServerClient;
}
