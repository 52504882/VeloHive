import { mapProfileRow, profileNotFoundFallback } from "../src/services/profile";

describe("profile service", () => {
  it("maps Supabase profile rows into mobile auth profiles", () => {
    expect(
      mapProfileRow({
        id: "user-1",
        accepted_terms_at: "2026-07-23T08:00:00.000Z",
        accepted_privacy_at: null,
        status: "limited"
      })
    ).toEqual({
      id: "user-1",
      acceptedTermsAt: "2026-07-23T08:00:00.000Z",
      acceptedPrivacyAt: null,
      status: "limited"
    });
  });

  it("uses null profile as the first-time user fallback", () => {
    expect(profileNotFoundFallback()).toBeNull();
  });
});
