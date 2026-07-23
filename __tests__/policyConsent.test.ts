import { canEnterApp, createConsentPatch } from "../src/services/policyConsent";

describe("policy consent", () => {
  it("blocks app entry until both terms and privacy are accepted", () => {
    expect(canEnterApp({ acceptedTermsAt: null, acceptedPrivacyAt: "2026-07-23T00:00:00.000Z" })).toBe(false);
    expect(canEnterApp({ acceptedTermsAt: "2026-07-23T00:00:00.000Z", acceptedPrivacyAt: null })).toBe(false);
  });

  it("allows app entry after both policies are accepted", () => {
    expect(
      canEnterApp({
        acceptedTermsAt: "2026-07-23T00:00:00.000Z",
        acceptedPrivacyAt: "2026-07-23T00:00:00.000Z"
      })
    ).toBe(true);
  });

  it("creates matching timestamps for terms and privacy acceptance", () => {
    expect(createConsentPatch("2026-07-23T08:00:00.000Z")).toEqual({
      acceptedTermsAt: "2026-07-23T08:00:00.000Z",
      acceptedPrivacyAt: "2026-07-23T08:00:00.000Z"
    });
  });
});
