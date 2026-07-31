import { getSupabaseClient } from "../src/lib/supabase";
import { submitHubApplication, validateHubApplication } from "../src/services/hubApplications";

jest.mock("../src/lib/supabase", () => ({
  getSupabaseClient: jest.fn()
}));

describe("hub onboarding", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("requires core hub application fields", () => {
    expect(
      validateHubApplication({
        name: "",
        address: "",
        businessHours: "",
        contactMethod: "",
        facilityTags: []
      })
    ).toEqual(["请填写据点名称", "请填写地址", "请填写营业时间", "请填写联系方式", "至少选择 1 个设施标签"]);
  });

  it("accepts a complete hub application", () => {
    expect(
      validateHubApplication({
        name: "青浦湖畔咖啡",
        address: "上海市青浦区淀山湖大道 168 号",
        businessHours: "09:00-20:00",
        contactMethod: "到店前电话确认",
        facilityTags: ["咖啡", "停车"]
      })
    ).toEqual([]);
  });

  it("creates pending hub applications", async () => {
    const insert = jest.fn().mockResolvedValue({ error: null });
    const from = jest.fn(() => ({ insert }));
    jest.mocked(getSupabaseClient).mockReturnValue({ from } as never);

    await submitHubApplication({
      ownerId: "user-1",
      name: "青浦湖畔咖啡",
      type: "cafe",
      address: "上海市青浦区淀山湖大道 168 号",
      businessHours: "09:00-20:00",
      contactMethod: "到店前电话确认",
      facilityTags: ["咖啡", "停车"],
      suitableForInspection: true
    });

    expect(from).toHaveBeenCalledWith("hubs");
    expect(insert).toHaveBeenCalledWith({
      owner_id: "user-1",
      name: "青浦湖畔咖啡",
      type: "cafe",
      address: "上海市青浦区淀山湖大道 168 号",
      business_hours: "09:00-20:00",
      contact_method: "到店前电话确认",
      facility_tags: ["咖啡", "停车"],
      image_urls: [],
      suitable_for_inspection: true,
      onboarding_status: "pending"
    });
  });
});
