import type { HubType } from "../domain/types";
import { getSupabaseClient } from "../lib/supabase";

export interface HubApplicationInput {
  ownerId: string;
  name: string;
  type: HubType;
  address: string;
  businessHours: string;
  contactMethod: string;
  facilityTags: string[];
  suitableForInspection: boolean;
  imageUrls?: string[];
  persist?: boolean;
}

export function validateHubApplication(input: {
  address: string;
  businessHours: string;
  contactMethod: string;
  facilityTags: string[];
  name: string;
}): string[] {
  const errors: string[] = [];
  if (!input.name.trim()) {
    errors.push("请填写据点名称");
  }
  if (!input.address.trim()) {
    errors.push("请填写地址");
  }
  if (!input.businessHours.trim()) {
    errors.push("请填写营业时间");
  }
  if (!input.contactMethod.trim()) {
    errors.push("请填写联系方式");
  }
  if (input.facilityTags.length === 0) {
    errors.push("至少选择 1 个设施标签");
  }
  return errors;
}

export async function submitHubApplication(input: HubApplicationInput): Promise<void> {
  const errors = validateHubApplication(input);
  if (errors.length > 0) {
    throw new Error(errors[0]);
  }

  if (input.persist === false) {
    return;
  }

  const { error } = await getSupabaseClient().from("hubs").insert({
    owner_id: input.ownerId,
    name: input.name.trim(),
    type: input.type,
    address: input.address.trim(),
    business_hours: input.businessHours.trim(),
    contact_method: input.contactMethod.trim(),
    facility_tags: input.facilityTags,
    image_urls: input.imageUrls ?? [],
    suitable_for_inspection: input.suitableForInspection,
    onboarding_status: "pending"
  });

  if (error) {
    throw error;
  }
}
