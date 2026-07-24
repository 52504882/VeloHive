import { getSupabaseClient } from "../src/lib/supabase";
import { ListingSubmissionError, submitListingForReview } from "../src/services/listingRepository";

jest.mock("../src/lib/supabase", () => ({
  getSupabaseClient: jest.fn()
}));

const baseInput = {
  sellerId: "user-1",
  title: "Specialized Tarmac SL7 整车",
  category: "complete_bike",
  brand: "Specialized",
  model: "Tarmac SL7",
  price: 32800,
  condition: "9 成新",
  specs: ["52 码"],
  description: "移动端发布提交，等待卖家补充更完整说明。",
  flawDescription: "右侧手变有轻微擦痕",
  imageUrls: ["https://cdn.example.test/user-1/bike.jpg"],
  supportsOfflineInspection: true,
  recommendedHubIds: ["10000000-0000-0000-0000-000000000001"]
};

const listingRow = {
  id: "listing-1",
  seller_id: "user-1",
  title: baseInput.title,
  category: "complete_bike",
  brand: baseInput.brand,
  model: baseInput.model,
  price: baseInput.price,
  condition: baseInput.condition,
  specs: baseInput.specs,
  description: baseInput.description,
  flaw_description: baseInput.flawDescription,
  image_urls: baseInput.imageUrls,
  status: "pending_review",
  supports_offline_inspection: true,
  recommended_hub_ids: baseInput.recommendedHubIds,
  created_at: "2026-07-24T00:00:00.000Z",
  updated_at: "2026-07-24T00:00:00.000Z"
};

function mockPersistedListingSubmission(rollbackError: Error | null, rollbackData: { id: string } | null = { id: "listing-1" }) {
  const rollbackSingle = jest.fn().mockResolvedValue({ data: rollbackData, error: rollbackError });
  const rollbackSelect = jest.fn(() => ({ single: rollbackSingle }));
  const updateEq = jest.fn(() => ({ select: rollbackSelect }));
  const update = jest.fn(() => ({ eq: updateEq }));
  const verificationInsert = jest.fn().mockResolvedValue({ error: new Error("verification failed") });
  const listingSingle = jest.fn().mockResolvedValue({ data: listingRow, error: null });
  const select = jest.fn(() => ({ single: listingSingle }));
  const insert = jest.fn(() => ({ select }));
  let listingTableCalls = 0;
  const from = jest.fn((table: string) => {
    if (table === "listings") {
      listingTableCalls += 1;
      return listingTableCalls === 1 ? { insert } : { update };
    }

    if (table === "listing_verifications") {
      return { insert: verificationInsert };
    }

    throw new Error(`Unexpected table ${table}`);
  });

  jest.mocked(getSupabaseClient).mockReturnValue({ from } as never);

  return { rollbackSelect, rollbackSingle, update, updateEq, verificationInsert };
}

describe("listing repository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns pending review listings for non-persisted demo submissions", async () => {
    await expect(
      submitListingForReview({
        ...baseInput,
        sellerId: "demo-user",
        imageUrls: ["https://example.com/bike.jpg"],
        recommendedHubIds: ["hub-001"],
        persist: false
      })
    ).resolves.toMatchObject({
      sellerId: "demo-user",
      status: "pending_review",
      title: "Specialized Tarmac SL7 整车"
    });
  });

  it("marks submitted listing removed, clears images, and allows uploaded image cleanup when verification creation fails", async () => {
    const { rollbackSelect, rollbackSingle, update, updateEq } = mockPersistedListingSubmission(null);

    await expect(submitListingForReview(baseInput)).rejects.toMatchObject({
      name: "ListingSubmissionError",
      message: "verification failed",
      shouldCleanupUploadedImages: true
    });

    expect(update).toHaveBeenCalledWith({
      image_urls: [],
      status: "removed",
      removed_reason: "listing_verification_create_failed"
    });
    expect(updateEq).toHaveBeenCalledWith("id", "listing-1");
    expect(rollbackSelect).toHaveBeenCalledWith("id");
    expect(rollbackSingle).toHaveBeenCalled();
  });

  it("prevents uploaded image cleanup when verification and rollback both fail", async () => {
    mockPersistedListingSubmission(new Error("rollback failed"));

    await expect(submitListingForReview(baseInput)).rejects.toMatchObject({
      name: "ListingSubmissionError",
      message: "verification failed; rollback failed: rollback failed",
      shouldCleanupUploadedImages: false
    });
  });

  it("prevents uploaded image cleanup when rollback updates no listing", async () => {
    mockPersistedListingSubmission(null, null);

    await expect(submitListingForReview(baseInput)).rejects.toMatchObject({
      name: "ListingSubmissionError",
      message: "verification failed; rollback failed: listing cleanup updated no rows",
      shouldCleanupUploadedImages: false
    });
  });

  it("rejects persisted submissions with no images before writing to Supabase", async () => {
    const from = jest.fn();
    jest.mocked(getSupabaseClient).mockReturnValue({ from } as never);

    await expect(
      submitListingForReview({
        ...baseInput,
        imageUrls: []
      })
    ).rejects.toThrow("至少上传 1 张商品照片");
    expect(from).not.toHaveBeenCalled();
  });

  it("rejects persisted submissions with more than nine images before writing to Supabase", async () => {
    const from = jest.fn();
    jest.mocked(getSupabaseClient).mockReturnValue({ from } as never);

    await expect(
      submitListingForReview({
        ...baseInput,
        imageUrls: Array.from({ length: 10 }, (_, index) => `https://cdn.example.test/user-1/bike-${index}.jpg`)
      })
    ).rejects.toThrow("最多上传 9 张商品照片");
    expect(from).not.toHaveBeenCalled();
  });

  it("exposes whether callers should cleanup uploaded images on submission errors", () => {
    expect(new ListingSubmissionError("failed", false).shouldCleanupUploadedImages).toBe(false);
    expect(new ListingSubmissionError("failed", true).shouldCleanupUploadedImages).toBe(true);
  });
});
