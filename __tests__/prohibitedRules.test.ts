import { defaultProhibitedRules, findProhibitedMatches } from "../src/services/prohibitedRules";

describe("prohibited marketplace rules", () => {
  const rules = [
    { keyword: "假货", severity: "block" as const, explanation: "禁止发布假货或仿品" },
    { keyword: "来路不明", severity: "review" as const, explanation: "需人工复核来源" }
  ];

  it("blocks listings with forbidden keywords", () => {
    expect(findProhibitedMatches("假货车架", rules)).toEqual([rules[0]]);
  });

  it("marks risky wording for review", () => {
    expect(findProhibitedMatches("来路不明的轮组", rules)).toEqual([rules[1]]);
  });

  it("matches keywords across all submitted listing text", () => {
    expect(
      findProhibitedMatches(
        {
          title: "S-Works 车架",
          brand: "Specialized",
          model: "Tarmac",
          condition: "9 成新",
          flawDescription: "卖家说来源来路不明"
        },
        rules
      )
    ).toEqual([rules[1]]);
  });

  it("keeps local default block rules aligned with seeded database rules", () => {
    expect(findProhibitedMatches("这是一台改号车架", defaultProhibitedRules)).toEqual([
      { keyword: "改号", severity: "block", explanation: "禁止发布修改、遮盖或伪造车架号/序列号的商品" }
    ]);
  });
});
