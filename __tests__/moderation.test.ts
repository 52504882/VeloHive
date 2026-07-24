import { getSupabaseClient } from "../src/lib/supabase";
import { submitListingReviewDecision } from "../src/services/moderation";

jest.mock("../src/lib/supabase", () => ({
  getSupabaseClient: jest.fn()
}));

describe("moderation service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("approves pending listings and writes an audit log", async () => {
    const rpc = jest.fn().mockResolvedValue({ error: null });
    jest.mocked(getSupabaseClient).mockReturnValue({ rpc } as never);

    await submitListingReviewDecision("listing-1", "approve", {
      actorId: "moderator-1",
      reason: "照片和来源说明完整"
    });

    expect(rpc).toHaveBeenCalledWith("submit_listing_review_decision", {
      p_actor_id: "moderator-1",
      p_decision: "approve",
      p_listing_id: "listing-1",
      p_reason: "照片和来源说明完整"
    });
  });

  it("rejects listings with a readable removal reason and writes an audit log", async () => {
    const rpc = jest.fn().mockResolvedValue({ error: null });
    jest.mocked(getSupabaseClient).mockReturnValue({ rpc } as never);

    await submitListingReviewDecision("listing-1", "reject", {
      actorId: "moderator-1",
      reason: "疑似假货"
    });

    expect(rpc).toHaveBeenCalledWith("submit_listing_review_decision", {
      p_actor_id: "moderator-1",
      p_decision: "reject",
      p_listing_id: "listing-1",
      p_reason: "疑似假货"
    });
  });

  it("requires a reason when rejecting or removing listings", async () => {
    const rpc = jest.fn();
    jest.mocked(getSupabaseClient).mockReturnValue({ rpc } as never);

    await expect(
      submitListingReviewDecision("listing-1", "remove", {
        actorId: "moderator-1",
        reason: " "
      })
    ).rejects.toThrow("拒绝或下架商品时必须填写原因");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("throws Supabase RPC errors without applying a second client-side write", async () => {
    const rpc = jest.fn().mockResolvedValue({ error: new Error("rpc failed") });
    jest.mocked(getSupabaseClient).mockReturnValue({ rpc } as never);

    await expect(
      submitListingReviewDecision("listing-1", "approve", {
        actorId: "moderator-1",
        reason: "ok"
      })
    ).rejects.toThrow("rpc failed");
    expect(rpc).toHaveBeenCalledTimes(1);
  });
});
