import { getRequiredEnv } from "../src/config/env";

describe("environment config", () => {
  it("throws a readable error when a required public env var is missing", () => {
    expect(() => getRequiredEnv({}, "EXPO_PUBLIC_SUPABASE_URL")).toThrow(
      "Missing required environment variable: EXPO_PUBLIC_SUPABASE_URL"
    );
  });

  it("returns a required public env var when it exists", () => {
    expect(getRequiredEnv({ EXPO_PUBLIC_SUPABASE_URL: "https://example.supabase.co" }, "EXPO_PUBLIC_SUPABASE_URL")).toBe(
      "https://example.supabase.co"
    );
  });
});
