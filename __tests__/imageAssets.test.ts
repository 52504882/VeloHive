import { uploadListingImages, validateListingImages } from "../src/services/imageAssets";
import { getSupabaseClient } from "../src/lib/supabase";

jest.mock("../src/lib/supabase", () => ({
  getSupabaseClient: jest.fn()
}));

describe("listing image assets", () => {
  it("requires at least one listing image", () => {
    expect(validateListingImages([])).toEqual(["至少上传 1 张商品照片"]);
  });

  it("limits listing images to nine photos", () => {
    expect(validateListingImages(Array.from({ length: 10 }, (_, index) => `file://${index}.jpg`))).toEqual([
      "最多上传 9 张商品照片"
    ]);
  });

  it("accepts one to nine listing photos", () => {
    expect(validateListingImages(["file://bike.jpg"])).toEqual([]);
  });

  it("rejects upload assets without base64 data", async () => {
    await expect(uploadListingImages("user-1", [{ uri: "file://bike.jpg" }])).rejects.toThrow(
      "图片缺少上传数据，请重新选择照片"
    );
  });

  it("removes already uploaded images when a later upload fails", async () => {
    const upload = jest
      .fn()
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: new Error("upload failed") });
    const remove = jest.fn().mockResolvedValue({ error: null });
    const getPublicUrl = jest.fn((path: string) => ({ data: { publicUrl: `https://cdn.example.test/${path}` } }));
    jest.mocked(getSupabaseClient).mockReturnValue({
      storage: {
        from: jest.fn(() => ({
          getPublicUrl,
          remove,
          upload
        }))
      }
    } as never);

    await expect(
      uploadListingImages("user-1", [
        { uri: "file://bike-1.jpg", base64: "ZmFrZQ==" },
        { uri: "file://bike-2.jpg", base64: "ZmFrZQ==" }
      ])
    ).rejects.toThrow("upload failed");

    expect(remove).toHaveBeenCalledWith([expect.stringMatching(/^user-1\/.+\.jpg$/)]);
  });
});
