import { getSupabaseClient } from "../lib/supabase";

export async function signInWithOtp(phone: string) {
  return getSupabaseClient().auth.signInWithOtp({ phone });
}

export async function verifyOtp(phone: string, token: string) {
  return getSupabaseClient().auth.verifyOtp({ phone, token, type: "sms" });
}

export async function signOut() {
  return getSupabaseClient().auth.signOut();
}

export async function getCurrentSession() {
  return getSupabaseClient().auth.getSession();
}
