import { getSupabaseClient } from "../lib/supabase";

export interface AuthProfile {
  id: string;
  acceptedTermsAt: string | null;
  acceptedPrivacyAt: string | null;
  status: "active" | "limited" | "banned";
}

interface ProfileRow {
  id: string;
  accepted_terms_at: string | null;
  accepted_privacy_at: string | null;
  status: "active" | "limited" | "banned";
}

function isMissingProfileError(error: { code?: string; details?: string; message?: string }): boolean {
  return error.code === "PGRST116" || error.message === "JSON object requested, multiple (or no) rows returned";
}

export function profileNotFoundFallback(): null {
  return null;
}

export function mapProfileRow(row: ProfileRow): AuthProfile {
  return {
    id: row.id,
    acceptedTermsAt: row.accepted_terms_at,
    acceptedPrivacyAt: row.accepted_privacy_at,
    status: row.status
  };
}

export async function fetchCurrentProfile(userId: string): Promise<AuthProfile | null> {
  const { data, error } = await getSupabaseClient()
    .from("profiles")
    .select("id, accepted_terms_at, accepted_privacy_at, status")
    .eq("id", userId)
    .single<ProfileRow>();

  if (error) {
    if (isMissingProfileError(error)) {
      return profileNotFoundFallback();
    }

    throw error;
  }

  return data ? mapProfileRow(data) : null;
}

export async function acceptCurrentProfilePolicies(
  userId: string,
  consent: { acceptedTermsAt: string; acceptedPrivacyAt: string }
): Promise<AuthProfile> {
  const client = getSupabaseClient();
  const consentPatch = {
    accepted_terms_at: consent.acceptedTermsAt,
    accepted_privacy_at: consent.acceptedPrivacyAt
  };
  const { data: updatedProfile, error: updateError } = await client
    .from("profiles")
    .update(consentPatch)
    .eq("id", userId)
    .select("id, accepted_terms_at, accepted_privacy_at, status")
    .maybeSingle<ProfileRow>();

  if (updateError) {
    throw updateError;
  }

  if (updatedProfile) {
    return mapProfileRow(updatedProfile);
  }

  const { data: insertedProfile, error: insertError } = await client
    .from("profiles")
    .insert({
      id: userId,
      nickname: "新骑友",
      city: "上海",
      rider_tags: [],
      status: "active",
      ...consentPatch
    })
    .select("id, accepted_terms_at, accepted_privacy_at, status")
    .single<ProfileRow>();

  if (insertError) {
    throw insertError;
  }

  return mapProfileRow(insertedProfile);
}
