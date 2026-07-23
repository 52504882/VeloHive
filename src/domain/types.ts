export type ListingCategory =
  | "complete_bike"
  | "frameset"
  | "wheelset"
  | "groupset"
  | "power_meter"
  | "computer"
  | "shoes"
  | "apparel"
  | "accessory";

export type ListingStatus = "active" | "chatting" | "viewing_scheduled" | "sold" | "unavailable";

export type HubType = "cafe" | "farm_stay" | "bike_shop" | "cycling_stop" | "other";

export type HubOnboardingStatus = "approved" | "pending" | "rejected";

export type FavoriteTargetType = "listing" | "hub";

export interface User {
  id: string;
  nickname: string;
  avatarUrl: string;
  city: string;
  riderTags: string[];
  listingCount: number;
  soldCount: number;
  status: "active" | "limited";
}

export interface ListingVerification {
  listingId: string;
  purchaseProofUrls: string[];
  maskedSerialOrFrameNumber?: string;
  selfVerificationScore: number;
  notes: string;
}

export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  category: ListingCategory;
  brand: string;
  model: string;
  price: number;
  condition: string;
  specs: string[];
  description: string;
  flawDescription: string;
  imageUrls: string[];
  status: ListingStatus;
  supportsOfflineInspection: boolean;
  recommendedHubIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Hub {
  id: string;
  name: string;
  type: HubType;
  address: string;
  latitude: number;
  longitude: number;
  businessHours: string;
  facilityTags: string[];
  imageUrls: string[];
  contactMethod: string;
  suitableForInspection: boolean;
  onboardingStatus: HubOnboardingStatus;
}

export interface Conversation {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  lastMessageAt: string;
  meetupStatus: ListingStatus;
  lastMessagePreview: string;
}

export interface Favorite {
  id: string;
  userId: string;
  targetType: FavoriteTargetType;
  targetId: string;
}
