import { getPublishReviewWarnings, validatePublishDraft } from "../src/services/publishValidation";

const prohibitedRules = [
  { keyword: "假货", severity: "block" as const, explanation: "禁止发布假货或仿品" },
  { keyword: "来路不明", severity: "review" as const, explanation: "需人工复核来源" }
];

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

  it("blocks prohibited listing wording", () => {
    expect(
      validatePublishDraft(
        {
          title: "假货车架",
          brand: "Specialized",
          model: "Tarmac",
          price: "18800",
          condition: "9 成新",
          flawDescription: "无明显瑕疵",
          supportsOfflineInspection: false,
          recommendedHubIds: []
        },
        prohibitedRules
      )
    ).toContain("禁止发布假货或仿品");
  });

  it("does not block risky wording that should enter manual review", () => {
    expect(
      validatePublishDraft(
        {
          title: "碳纤维轮组",
          brand: "Shimano",
          model: "C50",
          price: "4200",
          condition: "8 成新",
          flawDescription: "来源来路不明，需要买家自行判断",
          supportsOfflineInspection: false,
          recommendedHubIds: []
        },
        prohibitedRules
      )
    ).toEqual([]);
  });

  it("returns manual review warnings for risky wording", () => {
    expect(
      getPublishReviewWarnings(
        {
          title: "碳纤维轮组",
          brand: "Shimano",
          model: "C50",
          price: "4200",
          condition: "8 成新",
          flawDescription: "来源来路不明，需要买家自行判断",
          supportsOfflineInspection: false,
          recommendedHubIds: []
        },
        prohibitedRules
      )
    ).toEqual(["需人工复核来源，将进入人工审核"]);
  });
});
