import { getSupabaseClient } from "../lib/supabase";

export type ListingReviewDecisionType = "approve" | "reject" | "remove";

export interface ListingReviewOptions {
  actorId: string;
  reason: string;
}

export async function submitListingReviewDecision(
  listingId: string,
  decision: ListingReviewDecisionType,
  options: ListingReviewOptions
): Promise<void> {
  const reason = options.reason.trim();
  if ((decision === "reject" || decision === "remove") && reason.length === 0) {
    throw new Error("拒绝或下架商品时必须填写原因");
  }

  const { error } = await getSupabaseClient().rpc("submit_listing_review_decision", {
    p_actor_id: options.actorId,
    p_decision: decision,
    p_listing_id: listingId,
    p_reason: reason
  });

  if (error) {
    throw error;
  }
}
