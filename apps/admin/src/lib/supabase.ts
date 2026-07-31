import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "https://example.supabase.co";
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "missing-anon-key";
    client = createClient(supabaseUrl, supabaseAnonKey);
  }

  return client;
}
