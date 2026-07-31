import type { ConversationMeetupStatus } from "../domain/types";
import { getSupabaseClient } from "../lib/supabase";

interface MessageLike {
  id: string;
  createdAt: string;
}

export interface ConversationRecord {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  meetupStatus: ConversationMeetupStatus;
  lastMessageAt: string;
  createdAt: string;
}

export interface MessageRecord {
  id: string;
  conversationId: string;
  senderId: string;
  kind: "text" | "image" | "meetup_request" | "system";
  body: string;
  imageUrl?: string | null;
  createdAt: string;
}

interface ConversationRow {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  meetup_status: ConversationMeetupStatus;
  last_message_at: string;
  created_at: string;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  kind: MessageRecord["kind"];
  body: string;
  image_url: string | null;
  created_at: string;
}

export function sortMessagesAscending<T extends MessageLike>(messages: T[]): T[] {
  return [...messages].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

export function createLocalConversation(input: {
  buyerId: string;
  listingId: string;
  sellerId: string;
}): ConversationRecord {
  const now = new Date().toISOString();
  return {
    id: `local-conversation-${Date.now()}`,
    buyerId: input.buyerId,
    sellerId: input.sellerId,
    listingId: input.listingId,
    meetupStatus: "chatting",
    lastMessageAt: now,
    createdAt: now
  };
}

export function createLocalTextMessage(conversationId: string, senderId: string, body: string): MessageRecord {
  return {
    id: `local-message-${Date.now()}`,
    conversationId,
    senderId,
    kind: "text",
    body: body.trim(),
    imageUrl: null,
    createdAt: new Date().toISOString()
  };
}

export async function startConversation(input: {
  buyerId: string;
  listingId: string;
  sellerId: string;
  persist?: boolean;
}): Promise<ConversationRecord> {
  if (input.persist === false) {
    return createLocalConversation(input);
  }

  const { data, error } = await getSupabaseClient()
    .from("conversations")
    .upsert(
      {
        buyer_id: input.buyerId,
        listing_id: input.listingId,
        seller_id: input.sellerId,
        meetup_status: "chatting"
      },
      { onConflict: "listing_id,buyer_id,seller_id" }
    )
    .select("id, listing_id, buyer_id, seller_id, meetup_status, last_message_at, created_at")
    .single<ConversationRow>();

  if (error) {
    throw error;
  }

  return mapConversationRow(data);
}

export async function fetchConversations(userId: string): Promise<ConversationRecord[]> {
  const { data, error } = await getSupabaseClient()
    .from("conversations")
    .select("id, listing_id, buyer_id, seller_id, meetup_status, last_message_at, created_at")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("last_message_at", { ascending: false })
    .returns<ConversationRow[]>();

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapConversationRow);
}

export async function fetchMessages(conversationId: string): Promise<MessageRecord[]> {
  const { data, error } = await getSupabaseClient()
    .from("messages")
    .select("id, conversation_id, sender_id, kind, body, image_url, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .returns<MessageRow[]>();

  if (error) {
    throw error;
  }

  return sortMessagesAscending((data ?? []).map(mapMessageRow));
}

export async function sendTextMessage(input: {
  body: string;
  conversationId: string;
  persist?: boolean;
  senderId: string;
}): Promise<MessageRecord> {
  const body = input.body.trim();
  if (!body) {
    throw new Error("请输入消息内容");
  }

  if (input.persist === false) {
    return createLocalTextMessage(input.conversationId, input.senderId, body);
  }

  const { data, error } = await getSupabaseClient()
    .from("messages")
    .insert({
      body,
      conversation_id: input.conversationId,
      kind: "text",
      sender_id: input.senderId
    })
    .select("id, conversation_id, sender_id, kind, body, image_url, created_at")
    .single<MessageRow>();

  if (error) {
    throw error;
  }

  return mapMessageRow(data);
}

export function subscribeToConversationMessages(
  conversationId: string,
  onMessage: (message: MessageRecord) => void
): { unsubscribe: () => void } {
  const channel = getSupabaseClient()
    .channel(`conversation:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        filter: `conversation_id=eq.${conversationId}`,
        schema: "public",
        table: "messages"
      },
      (payload) => onMessage(mapMessageRow(payload.new as MessageRow))
    )
    .subscribe();

  return {
    unsubscribe: () => {
      getSupabaseClient().removeChannel(channel);
    }
  };
}

function mapConversationRow(row: ConversationRow): ConversationRecord {
  return {
    id: row.id,
    listingId: row.listing_id,
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    meetupStatus: row.meetup_status,
    lastMessageAt: row.last_message_at,
    createdAt: row.created_at
  };
}

function mapMessageRow(row: MessageRow): MessageRecord {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    kind: row.kind,
    body: row.body,
    imageUrl: row.image_url,
    createdAt: row.created_at
  };
}
