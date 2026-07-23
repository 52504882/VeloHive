import { validatePublishDraft } from "../src/services/publishValidation";

describe("validatePublishDraft", () => {
  it("accepts a complete listing draft", () => {
    expect(
      validatePublishDraft({
        title: "Cervelo R5 车架组",
        brand: "Cervelo",
        model: "R5",
        price: "16800",
        condition: "9 成新",
        flawDescription: "五通附近有轻微使用痕迹",
        supportsOfflineInspection: true,
        recommendedHubIds: ["hub-001"]
      })
    ).toEqual([]);
  });

  it("requires core marketplace fields", () => {
    expect(
      validatePublishDraft({
        title: "",
        brand: "",
        model: "",
        price: "",
        condition: "",
        flawDescription: "",
        supportsOfflineInspection: false,
        recommendedHubIds: []
      })
    ).toEqual(["请填写标题", "请填写品牌", "请填写型号", "请填写价格", "请填写成色", "请说明瑕疵或写明无明显瑕疵"]);
  });

  it("requires core marketplace fields when they only contain whitespace", () => {
    expect(
      validatePublishDraft({
        title: " ",
        brand: "  ",
        model: "\t",
        price: " ",
        condition: "\n",
        flawDescription: "   ",
        supportsOfflineInspection: false,
        recommendedHubIds: []
      })
    ).toEqual(["请填写标题", "请填写品牌", "请填写型号", "请填写价格", "请填写成色", "请说明瑕疵或写明无明显瑕疵"]);
  });

  it("requires a hub when offline inspection is enabled", () => {
    expect(
      validatePublishDraft({
        title: "轮组",
        brand: "Shimano",
        model: "C50",
        price: "4200",
        condition: "8 成新",
        flawDescription: "正常使用痕迹",
        supportsOfflineInspection: true,
        recommendedHubIds: []
      })
    ).toContain("支持线下验货时至少选择一个推荐据点");
  });

  it("requires a non-blank hub when offline inspection is enabled", () => {
    expect(
      validatePublishDraft({
        title: "轮组",
        brand: "Shimano",
        model: "C50",
        price: "4200",
        condition: "8 成新",
        flawDescription: "正常使用痕迹",
        supportsOfflineInspection: true,
        recommendedHubIds: ["   "]
      })
    ).toContain("支持线下验货时至少选择一个推荐据点");
  });

  it("rejects non-positive prices", () => {
    expect(
      validatePublishDraft({
        title: "码表",
        brand: "Garmin",
        model: "Edge 840",
        price: "0",
        condition: "95 新",
        flawDescription: "无明显瑕疵",
        supportsOfflineInspection: false,
        recommendedHubIds: []
      })
    ).toContain("价格必须大于 0");
  });

  it("rejects malformed prices", () => {
    expect(
      validatePublishDraft({
        title: "码表",
        brand: "Garmin",
        model: "Edge 840",
        price: "abc",
        condition: "95 新",
        flawDescription: "无明显瑕疵",
        supportsOfflineInspection: false,
        recommendedHubIds: []
      })
    ).toContain("价格必须大于 0");
  });
});
