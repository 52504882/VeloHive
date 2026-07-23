import { canEnterApp } from "./policyConsent";
import type { AuthProfile } from "./profile";

export type AppGateState = "loading" | "auth" | "consent" | "ready" | "blocked";

export function resolveAppGateState(input: {
  loading: boolean;
  authenticated: boolean;
  profile: AuthProfile | null;
}): AppGateState {
  if (input.loading) {
    return "loading";
  }

  if (!input.authenticated) {
    return "auth";
  }

  if (input.profile?.status === "banned") {
    return "blocked";
  }

  if (
    !input.profile ||
    !canEnterApp({
      acceptedTermsAt: input.profile.acceptedTermsAt,
      acceptedPrivacyAt: input.profile.acceptedPrivacyAt
    })
  ) {
    return "consent";
  }

  return "ready";
}
