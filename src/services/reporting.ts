import { getSupabaseClient } from "../lib/supabase";

export type ReportTargetType = "listing" | "user" | "hub" | "message";

export interface ReportInput {
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details: string;
  persist?: boolean;
}

export function validateReportInput(input: { reason: string; details: string }): string[] {
  const errors: string[] = [];
  if (!input.reason.trim()) {
    errors.push("请选择举报原因");
  }
  if (input.details.length > 500) {
    errors.push("补充说明不能超过 500 字");
  }
  return errors;
}

export async function submitReport(input: ReportInput): Promise<void> {
  const errors = validateReportInput(input);
  if (errors.length > 0) {
    throw new Error(errors[0]);
  }

  if (input.persist === false) {
    return;
  }

  const { error } = await getSupabaseClient().from("reports").insert({
    reporter_id: input.reporterId,
    target_type: input.targetType,
    target_id: input.targetId,
    reason: input.reason.trim(),
    details: input.details.trim(),
    status: "open"
  });

  if (error) {
    throw error;
  }
}
