import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock, type SupabaseClient } from "@supabase/supabase-js";
import { getPublicEnv } from "../config/env";

let cachedClient: SupabaseClient | null = null;

export function createSupabaseClient(): SupabaseClient {
  const publicEnv = getPublicEnv();

  return createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: false,
      persistSession: true,
      lock: processLock,
      storage: AsyncStorage
    }
  });
}

export function getSupabaseClient(): SupabaseClient {
  if (!cachedClient) {
    cachedClient = createSupabaseClient();
  }

  return cachedClient;
}
