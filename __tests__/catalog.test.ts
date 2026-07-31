import type { ConversationMeetupStatus } from "../src/domain/types";
import { conversations, favorites, hubs, listings, users, verifications } from "../src/data/seed";
import {
  findHubById,
  findListingById,
  getListingSeller,
  getListingVerification,
  getProfileStats,
  getTrustLabel,
  publicHubs,
  searchListings,
  suitableInspectionHubs
} from "../src/services/catalog";

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

  it("uses mobile-optimized image URLs for visible listing and hub cards", () => {
    const visibleImageUrls = [
      ...listings.flatMap((listing) => listing.imageUrls),
      ...hubs.flatMap((hub) => hub.imageUrls)
    ];

    expect(visibleImageUrls.every((imageUrl) => imageUrl.includes("auto=format"))).toBe(true);
    expect(visibleImageUrls.every((imageUrl) => imageUrl.includes("fit=crop"))).toBe(true);
    expect(visibleImageUrls.every((imageUrl) => imageUrl.includes("w=900"))).toBe(true);
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

describe("catalog services", () => {
  it("searches listings by title, brand, and model", () => {
    expect(searchListings("tarmac").map((listing) => listing.id)).toEqual(["listing-001"]);
    expect(searchListings("Shimano").map((listing) => listing.id)).toEqual(["listing-002"]);
    expect(searchListings("edge").map((listing) => listing.id)).toEqual(["listing-003"]);
  });

  it("filters listings by offline inspection support", () => {
    expect(searchListings("", { supportsOfflineInspection: true }).map((listing) => listing.id)).toEqual([
      "listing-001",
      "listing-002"
    ]);
  });

  it("returns trusted labels from self-verification scores", () => {
    expect(getTrustLabel(92)).toBe("自证完整");
    expect(getTrustLabel(74)).toBe("自证较完整");
    expect(getTrustLabel(58)).toBe("基础自证");
  });

  it("resolves listing relationships", () => {
    expect(findListingById("listing-001")?.title).toContain("Tarmac");
    expect(getListingSeller("listing-001")?.nickname).toBe("浦西爬坡手");
    expect(getListingVerification("listing-001")?.selfVerificationScore).toBe(92);
    expect(findHubById("hub-001")?.name).toBe("青浦湖畔咖啡");
  });

  it("returns hubs that are suitable for inspection", () => {
    expect(suitableInspectionHubs().map((hub) => hub.id)).toEqual(["hub-001", "hub-002"]);
  });

  it("returns only approved public hubs", () => {
    expect(publicHubs().every((hub) => hub.onboardingStatus === "approved")).toBe(true);
  });

  it("calculates profile stats", () => {
    expect(getProfileStats("user-001")).toEqual({
      activeListings: 1,
      favorites: 2,
      conversations: 1
    });
  });
});
