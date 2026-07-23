import { resolveAppGateState } from "../src/services/appGate";

describe("app gate state", () => {
  it("shows auth when there is no authenticated session", () => {
    expect(resolveAppGateState({ loading: false, authenticated: false, profile: null })).toBe("auth");
  });

  it("shows consent when the authenticated profile has not accepted policies", () => {
    expect(
      resolveAppGateState({
        loading: false,
        authenticated: true,
        profile: {
          id: "user-1",
          acceptedTermsAt: null,
          acceptedPrivacyAt: "2026-07-23T00:00:00.000Z",
          status: "active"
        }
      })
    ).toBe("consent");
  });

  it("allows ready profiles into the app", () => {
    expect(
      resolveAppGateState({
        loading: false,
        authenticated: true,
        profile: {
          id: "user-1",
          acceptedTermsAt: "2026-07-23T00:00:00.000Z",
          acceptedPrivacyAt: "2026-07-23T00:00:00.000Z",
          status: "active"
        }
      })
    ).toBe("ready");
  });

  it("blocks banned profiles", () => {
    expect(
      resolveAppGateState({
        loading: false,
        authenticated: true,
        profile: {
          id: "user-1",
          acceptedTermsAt: "2026-07-23T00:00:00.000Z",
          acceptedPrivacyAt: "2026-07-23T00:00:00.000Z",
          status: "banned"
        }
      })
    ).toBe("blocked");
  });
});
