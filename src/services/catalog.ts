import { conversations, favorites, hubs, listings, users, verifications } from "../data/seed";
import type { Hub, Listing, ListingCategory, ListingVerification, User } from "../domain/types";

interface ListingFilters {
  category?: ListingCategory;
  supportsOfflineInspection?: boolean;
  maxPrice?: number;
}

export function findListingById(id: string): Listing | undefined {
  return listings.find((listing) => listing.id === id);
}

export function findHubById(id: string): Hub | undefined {
  return hubs.find((hub) => hub.id === id);
}

export function findUserById(id: string): User | undefined {
  return users.find((user) => user.id === id);
}

export function getListingSeller(listingId: string): User | undefined {
  const listing = findListingById(listingId);
  return listing ? findUserById(listing.sellerId) : undefined;
}

export function getListingVerification(listingId: string): ListingVerification | undefined {
  return verifications.find((verification) => verification.listingId === listingId);
}

export function searchListings(query: string, filters: ListingFilters = {}): Listing[] {
  const normalizedQuery = query.trim().toLowerCase();

  return listings.filter((listing) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      [listing.title, listing.brand, listing.model, listing.description].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      );
    const matchesCategory = filters.category === undefined || listing.category === filters.category;
    const matchesInspection =
      filters.supportsOfflineInspection === undefined ||
      listing.supportsOfflineInspection === filters.supportsOfflineInspection;
    const matchesPrice = filters.maxPrice === undefined || listing.price <= filters.maxPrice;

    return matchesQuery && matchesCategory && matchesInspection && matchesPrice && listing.status === "active";
  });
}

export function suitableInspectionHubs(): Hub[] {
  return hubs.filter((hub) => hub.onboardingStatus === "approved" && hub.suitableForInspection);
}

export function getTrustLabel(score: number): "自证完整" | "自证较完整" | "基础自证" {
  if (score >= 85) {
    return "自证完整";
  }
  if (score >= 70) {
    return "自证较完整";
  }
  return "基础自证";
}

export function getProfileStats(userId: string): { activeListings: number; favorites: number; conversations: number } {
  return {
    activeListings: listings.filter((listing) => listing.sellerId === userId && listing.status === "active").length,
    favorites: favorites.filter((favorite) => favorite.userId === userId).length,
    conversations: conversations.filter(
      (conversation) => conversation.buyerId === userId || conversation.sellerId === userId
    ).length
  };
}
