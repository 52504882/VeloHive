import type { ConversationMeetupStatus } from "../src/domain/types";
import { conversations, favorites, hubs, listings, users, verifications } from "../src/data/seed";

describe("seed data", () => {
  const userIds = new Set(users.map((user) => user.id));
  const listingIds = new Set(listings.map((listing) => listing.id));
  const hubIds = new Set(hubs.map((hub) => hub.id));
  const approvedHubIds = new Set(hubs.filter((hub) => hub.onboardingStatus === "approved").map((hub) => hub.id));

  it("contains the expected Task 2 fixture counts", () => {
    expect(users).toHaveLength(2);
    expect(listings).toHaveLength(3);
    expect(hubs).toHaveLength(3);
    expect(verifications).toHaveLength(3);
    expect(conversations).toHaveLength(1);
    expect(favorites).toHaveLength(2);
  });

  it("links every listing seller to an existing user", () => {
    expect(listings.every((listing) => userIds.has(listing.sellerId))).toBe(true);
  });

  it("links every verification to a unique existing listing", () => {
    const verificationListingIds = verifications.map((verification) => verification.listingId);

    expect(verifications.every((verification) => listingIds.has(verification.listingId))).toBe(true);
    expect(new Set(verificationListingIds).size).toBe(verificationListingIds.length);
  });

  it("links inspection-supported listings to approved hubs", () => {
    const supportedListings = listings.filter((listing) => listing.supportsOfflineInspection);

    expect(supportedListings.length).toBeGreaterThan(0);
    expect(
      supportedListings.every((listing) =>
        listing.recommendedHubIds.length > 0 &&
        listing.recommendedHubIds.every((hubId) => approvedHubIds.has(hubId))
      )
    ).toBe(true);
  });

  it("links every conversation to existing marketplace participants", () => {
    const validMeetupStatuses = new Set<ConversationMeetupStatus>([
      "chatting",
      "viewing_scheduled",
      "completed",
      "cancelled"
    ]);

    expect(
      conversations.every(
        (conversation) =>
          listingIds.has(conversation.listingId) &&
          userIds.has(conversation.buyerId) &&
          userIds.has(conversation.sellerId) &&
          validMeetupStatuses.has(conversation.meetupStatus)
      )
    ).toBe(true);
  });

  it("links every favorite to an existing user and target", () => {
    expect(
      favorites.every((favorite) => {
        if (!userIds.has(favorite.userId)) {
          return false;
        }

        if (favorite.targetType === "listing") {
          return listingIds.has(favorite.targetId);
        }

        return hubIds.has(favorite.targetId);
      })
    ).toBe(true);
  });
});
