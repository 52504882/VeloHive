import { getSupabaseClient } from "../src/lib/supabase";
import { blockUser, canStartConversation } from "../src/services/blocks";

jest.mock("../src/lib/supabase", () => ({
  getSupabaseClient: jest.fn()
}));

describe("user blocks", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("prevents conversations when either user blocked the other", () => {
    expect(canStartConversation("buyer-1", "seller-1", [{ blockerId: "buyer-1", blockedId: "seller-1" }])).toBe(false);
    expect(canStartConversation("buyer-1", "seller-1", [{ blockerId: "seller-1", blockedId: "buyer-1" }])).toBe(false);
  });

  it("allows conversations when there is no block relationship", () => {
    expect(canStartConversation("buyer-1", "seller-1", [])).toBe(true);
  });

  it("creates a block relationship", async () => {
    const upsert = jest.fn().mockResolvedValue({ error: null });
    const from = jest.fn(() => ({ upsert }));
    jest.mocked(getSupabaseClient).mockReturnValue({ from } as never);

    await blockUser({ blockerId: "buyer-1", blockedId: "seller-1" });

    expect(from).toHaveBeenCalledWith("user_blocks");
    expect(upsert).toHaveBeenCalledWith({
      blocker_id: "buyer-1",
      blocked_id: "seller-1"
    });
  });

  it("does not allow blocking yourself", async () => {
    const from = jest.fn();
    jest.mocked(getSupabaseClient).mockReturnValue({ from } as never);

    await expect(blockUser({ blockerId: "user-1", blockedId: "user-1" })).rejects.toThrow("不能拉黑自己");
    expect(from).not.toHaveBeenCalled();
  });
});
