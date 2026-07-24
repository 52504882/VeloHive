import { findProhibitedMatches, type ProhibitedRule } from "./prohibitedRules";

export interface PublishDraft {
  title: string;
  brand: string;
  model: string;
  price: string;
  condition: string;
  flawDescription: string;
  supportsOfflineInspection: boolean;
  recommendedHubIds: string[];
}

export function validatePublishDraft(draft: PublishDraft, prohibitedRules: ProhibitedRule[] = []): string[] {
  const errors: string[] = [];

  if (draft.title.trim().length === 0) {
    errors.push("请填写标题");
  }
  if (draft.brand.trim().length === 0) {
    errors.push("请填写品牌");
  }
  if (draft.model.trim().length === 0) {
    errors.push("请填写型号");
  }
  if (draft.price.trim().length === 0) {
    errors.push("请填写价格");
  }
  if (draft.condition.trim().length === 0) {
    errors.push("请填写成色");
  }
  if (draft.flawDescription.trim().length === 0) {
    errors.push("请说明瑕疵或写明无明显瑕疵");
  }

  const parsedPrice = Number(draft.price);
  if (draft.price.trim().length > 0 && (!Number.isFinite(parsedPrice) || parsedPrice <= 0)) {
    errors.push("价格必须大于 0");
  }

  const hasRecommendedHub = draft.recommendedHubIds.some((hubId) => hubId.trim().length > 0);
  if (draft.supportsOfflineInspection && !hasRecommendedHub) {
    errors.push("支持线下验货时至少选择一个推荐据点");
  }

  const blockedMatches = findProhibitedMatches(draft, prohibitedRules).filter((match) => match.severity === "block");
  for (const match of blockedMatches) {
    if (!errors.includes(match.explanation)) {
      errors.push(match.explanation);
    }
  }

  return errors;
}

export function getPublishReviewWarnings(draft: PublishDraft, prohibitedRules: ProhibitedRule[] = []): string[] {
  return findProhibitedMatches(draft, prohibitedRules)
    .filter((match) => match.severity === "review")
    .map((match) => `${match.explanation}，将进入人工审核`);
}
