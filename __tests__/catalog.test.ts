import { hubs, listings, users, verifications } from "../src/data/seed";

describe("seed data", () => {
  it("contains Shanghai-area marketplace content", () => {
    expect(users.length).toBeGreaterThanOrEqual(2);
    expect(listings.length).toBeGreaterThanOrEqual(3);
    expect(hubs.length).toBeGreaterThanOrEqual(3);
  });

  it("links every verification to an existing listing", () => {
    const listingIds = new Set(listings.map((listing) => listing.id));
    expect(verifications.every((verification) => listingIds.has(verification.listingId))).toBe(true);
  });

  it("links inspection-supported listings to approved hubs", () => {
    const approvedHubIds = new Set(hubs.filter((hub) => hub.onboardingStatus === "approved").map((hub) => hub.id));
    const supportedListings = listings.filter((listing) => listing.supportsOfflineInspection);

    expect(supportedListings.length).toBeGreaterThan(0);
    expect(
      supportedListings.every((listing) =>
        listing.recommendedHubIds.length > 0 &&
        listing.recommendedHubIds.every((hubId) => approvedHubIds.has(hubId))
      )
    ).toBe(true);
  });
});
