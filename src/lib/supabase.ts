import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";
import { getPublicEnv } from "../config/env";

const publicEnv = getPublicEnv();

export const supabase = createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: false,
    persistSession: true,
    lock: processLock,
    storage: AsyncStorage
  }
});
