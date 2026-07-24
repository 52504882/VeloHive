export type ProhibitedRuleSeverity = "block" | "review";

export interface ProhibitedRule {
  keyword: string;
  severity: ProhibitedRuleSeverity;
  explanation: string;
}

export type ProhibitedRuleText = string | object;

export const defaultProhibitedRules: ProhibitedRule[] = [
  { keyword: "假货", severity: "block", explanation: "禁止发布假货或仿品" },
  { keyword: "仿品", severity: "block", explanation: "禁止发布假货或仿品" },
  { keyword: "赃物", severity: "block", explanation: "禁止发布盗抢或非法来源商品" },
  { keyword: "改号", severity: "block", explanation: "禁止发布修改、遮盖或伪造车架号/序列号的商品" },
  { keyword: "来路不明", severity: "review", explanation: "需人工复核来源" },
  { keyword: "无发票无来源", severity: "review", explanation: "需人工复核来源" }
];

export function findProhibitedMatches(text: ProhibitedRuleText, rules: ProhibitedRule[]): ProhibitedRule[] {
  const normalizedText = normalizeRuleText(text);
  const seenKeywords = new Set<string>();

  return rules.filter((rule) => {
    const normalizedKeyword = rule.keyword.trim().toLowerCase();
    if (!normalizedKeyword || seenKeywords.has(normalizedKeyword)) {
      return false;
    }

    const matched = normalizedText.includes(normalizedKeyword);
    if (matched) {
      seenKeywords.add(normalizedKeyword);
    }
    return matched;
  });
}

function normalizeRuleText(text: ProhibitedRuleText): string {
  if (typeof text === "string") {
    return text.toLowerCase();
  }

  return Object.values(text as Record<string, unknown>)
    .filter((value) => value !== null && value !== undefined)
    .join(" ")
    .toLowerCase();
}
