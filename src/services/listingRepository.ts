import type { Listing } from "../domain/types";
import { getSupabaseClient } from "../lib/supabase";
import { validateListingImages } from "./imageAssets";

export class ListingSubmissionError extends Error {
  constructor(
    message: string,
    readonly shouldCleanupUploadedImages: boolean
  ) {
    super(message);
    this.name = "ListingSubmissionError";
  }
}

export interface ListingCreateInput {
  sellerId: string;
  title: string;
  category: string;
  brand: string;
  model: string;
  price: number;
  condition: string;
  specs: string[];
  description: string;
  flawDescription: string;
  imageUrls: string[];
  supportsOfflineInspection: boolean;
  recommendedHubIds: string[];
  purchaseProofUrls?: string[];
  maskedSerialOrFrameNumber?: string;
  persist?: boolean;
}

interface ListingRow {
  id: string;
  seller_id: string;
  title: string;
  category: Listing["category"];
  brand: string;
  model: string;
  price: number;
  condition: string;
  specs: string[];
  description: string;
  flaw_description: string;
  image_urls: string[];
  status: Listing["status"];
  supports_offline_inspection: boolean;
  recommended_hub_ids: string[];
  created_at: string;
  updated_at: string;
}

export function mapListingRow(row: ListingRow): Listing {
  return {
    id: row.id,
    sellerId: row.seller_id,
    title: row.title,
    category: row.category,
    brand: row.brand,
    model: row.model,
    price: row.price,
    condition: row.condition,
    specs: row.specs,
    description: row.description,
    flawDescription: row.flaw_description,
    imageUrls: row.image_urls,
    status: row.status,
    supportsOfflineInspection: row.supports_offline_inspection,
    recommendedHubIds: row.recommended_hub_ids,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function createListingDraft(input: ListingCreateInput): Promise<Listing> {
  const imageErrors = validateListingImages(input.imageUrls);
  if (imageErrors.length > 0) {
    throw new Error(imageErrors[0]);
  }

  if (input.persist === false) {
    return createLocalReviewListing(input);
  }

  const { data, error } = await getSupabaseClient()
    .from("listings")
    .insert({
      seller_id: input.sellerId,
      title: input.title,
      category: input.category,
      brand: input.brand,
      model: input.model,
      price: input.price,
      condition: input.condition,
      specs: input.specs,
      description: input.description,
      flaw_description: input.flawDescription,
      image_urls: input.imageUrls,
      status: "pending_review",
      supports_offline_inspection: input.supportsOfflineInspection,
      recommended_hub_ids: input.recommendedHubIds
    })
    .select(
      "id, seller_id, title, category, brand, model, price, condition, specs, description, flaw_description, image_urls, status, supports_offline_inspection, recommended_hub_ids, created_at, updated_at"
    )
    .single<ListingRow>();

  if (error) {
    throw error;
  }

  const listing = mapListingRow(data);
  try {
    await createListingVerification(listing.id, input);
  } catch (error) {
    try {
      await markListingCreationFailed(listing.id);
    } catch (rollbackError) {
      const originalMessage = error instanceof Error ? error.message : "listing verification create failed";
      const rollbackMessage = rollbackError instanceof Error ? rollbackError.message : "listing cleanup failed";
      throw new ListingSubmissionError(`${originalMessage}; rollback failed: ${rollbackMessage}`, false);
    }
    throw new ListingSubmissionError(error instanceof Error ? error.message : "listing verification create failed", true);
  }
  return listing;
}

export async function submitListingForReview(input: ListingCreateInput): Promise<Listing> {
  return createListingDraft(input);
}

export async function fetchActiveListings(): Promise<Listing[]> {
  const { data, error } = await getSupabaseClient()
    .from("listings")
    .select(
      "id, seller_id, title, category, brand, model, price, condition, specs, description, flaw_description, image_urls, status, supports_offline_inspection, recommended_hub_ids, created_at, updated_at"
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .returns<ListingRow[]>();

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapListingRow);
}

export async function fetchListingById(id: string): Promise<Listing | null> {
  const { data, error } = await getSupabaseClient()
    .from("listings")
    .select(
      "id, seller_id, title, category, brand, model, price, condition, specs, description, flaw_description, image_urls, status, supports_offline_inspection, recommended_hub_ids, created_at, updated_at"
    )
    .eq("id", id)
    .maybeSingle<ListingRow>();

  if (error) {
    throw error;
  }

  return data ? mapListingRow(data) : null;
}

async function createListingVerification(listingId: string, input: ListingCreateInput): Promise<void> {
  const { error } = await getSupabaseClient().from("listing_verifications").insert({
    listing_id: listingId,
    purchase_proof_urls: input.purchaseProofUrls ?? [],
    masked_serial_or_frame_number: input.maskedSerialOrFrameNumber,
    self_verification_score: calculateSelfVerificationScore(input),
    notes: input.purchaseProofUrls?.length ? "已上传购买凭证，等待人工审核。" : "已提交基础照片和商品说明，等待人工审核。"
  });

  if (error) {
    throw error;
  }
}

async function markListingCreationFailed(listingId: string): Promise<void> {
  const { data, error } = await getSupabaseClient()
    .from("listings")
    .update({
      image_urls: [],
      status: "removed",
      removed_reason: "listing_verification_create_failed"
    })
    .eq("id", listingId)
    .select("id")
    .single<{ id: string }>();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("listing cleanup updated no rows");
  }
}

function calculateSelfVerificationScore(input: ListingCreateInput): number {
  let score = 50;

  if (input.imageUrls.length >= 3) {
    score += 20;
  } else if (input.imageUrls.length > 0) {
    score += 10;
  }

  if (input.purchaseProofUrls?.length) {
    score += 20;
  }

  if (input.maskedSerialOrFrameNumber) {
    score += 10;
  }

  return Math.min(score, 100);
}

function createLocalReviewListing(input: ListingCreateInput): Listing {
  const now = new Date().toISOString();

  return {
    id: `local-${Date.now()}`,
    sellerId: input.sellerId,
    title: input.title,
    category: "complete_bike",
    brand: input.brand,
    model: input.model,
    price: input.price,
    condition: input.condition,
    specs: input.specs,
    description: input.description,
    flawDescription: input.flawDescription,
    imageUrls: input.imageUrls,
    status: "pending_review",
    supportsOfflineInspection: input.supportsOfflineInspection,
    recommendedHubIds: input.recommendedHubIds,
    createdAt: now,
    updatedAt: now
  };
}
