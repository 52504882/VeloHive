import { getSupabaseClient } from "../lib/supabase";

export type ReviewAction = "approve" | "reject";
export type ListingReviewStatus = "active" | "removed";

export interface PendingListing {
  id: string;
  title: string;
  seller_id: string;
  image_urls: string[];
  price: number;
  created_at: string;
}

export interface OpenReport {
  id: string;
  target_type: string;
  target_id: string;
  reason: string;
  details: string;
  created_at: string;
}

export interface PendingHub {
  id: string;
  name: string;
  address: string;
  facility_tags: string[];
  contact_method: string;
  created_at: string;
}

export interface AdminUser {
  id: string;
  nickname: string;
  city: string;
  status: "active" | "limited" | "banned";
  created_at?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actor_id: string | null;
  target_type: string;
  target_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export function nextReviewStatus(action: ReviewAction): ListingReviewStatus {
  return action === "approve" ? "active" : "removed";
}

export async function fetchPendingListings(): Promise<PendingListing[]> {
  const { data, error } = await getSupabaseClient()
    .from("listings")
    .select("id, title, seller_id, image_urls, price, created_at")
    .eq("status", "pending_review")
    .order("created_at", { ascending: true })
    .returns<PendingListing[]>();

  if (error) throw error;
  return data ?? [];
}

export async function approveListing(listingId: string, actorId: string, reason: string): Promise<void> {
  const { error } = await getSupabaseClient().rpc("submit_listing_review_decision", {
    p_actor_id: actorId,
    p_decision: "approve",
    p_listing_id: listingId,
    p_reason: reason
  });
  if (error) throw error;
}

export async function rejectListing(listingId: string, actorId: string, reason: string): Promise<void> {
  const { error } = await getSupabaseClient().rpc("submit_listing_review_decision", {
    p_actor_id: actorId,
    p_decision: "reject",
    p_listing_id: listingId,
    p_reason: reason
  });
  if (error) throw error;
}

export async function fetchOpenReports(): Promise<OpenReport[]> {
  const { data, error } = await getSupabaseClient()
    .from("reports")
    .select("id, target_type, target_id, reason, details, created_at")
    .in("status", ["open", "reviewing"])
    .order("created_at", { ascending: true })
    .returns<OpenReport[]>();

  if (error) throw error;
  return data ?? [];
}

export async function resolveReport(reportId: string, resolutionNote: string, status: "resolved" | "rejected"): Promise<void> {
  const { error } = await getSupabaseClient()
    .from("reports")
    .update({ resolution_note: resolutionNote, status })
    .eq("id", reportId);
  if (error) throw error;
}

export async function fetchPendingHubs(): Promise<PendingHub[]> {
  const { data, error } = await getSupabaseClient()
    .from("hubs")
    .select("id, name, address, facility_tags, contact_method, created_at")
    .eq("onboarding_status", "pending")
    .order("created_at", { ascending: true })
    .returns<PendingHub[]>();

  if (error) throw error;
  return data ?? [];
}

export async function approveHub(hubId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from("hubs")
    .update({ onboarding_status: "approved", rejection_reason: null })
    .eq("id", hubId);
  if (error) throw error;
}

export async function rejectHub(hubId: string, reason: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from("hubs")
    .update({ onboarding_status: "rejected", rejection_reason: reason })
    .eq("id", hubId);
  if (error) throw error;
}

export async function searchUsers(query: string): Promise<AdminUser[]> {
  const normalizedQuery = query.trim();
  const request = getSupabaseClient()
    .from("profiles")
    .select("id, nickname, city, status, created_at")
    .order("created_at", { ascending: false })
    .limit(25);
  const { data, error } = normalizedQuery ? await request.ilike("nickname", `%${normalizedQuery}%`) : await request;
  if (error) throw error;
  return data ?? [];
}

export async function limitUser(userId: string, status: "active" | "limited" | "banned"): Promise<void> {
  const { error } = await getSupabaseClient().from("profiles").update({ status }).eq("id", userId);
  if (error) throw error;
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const { data, error } = await getSupabaseClient()
    .from("audit_logs")
    .select("id, action, actor_id, target_type, target_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<AuditLog[]>();

  if (error) throw error;
  return data ?? [];
}
