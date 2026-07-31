import { getSupabaseClient } from "../lib/supabase";

export interface BlockRelationship {
  blockerId: string;
  blockedId: string;
}

export interface BlockUserInput extends BlockRelationship {
  persist?: boolean;
}

export function canStartConversation(buyerId: string, sellerId: string, blocks: BlockRelationship[]): boolean {
  return !blocks.some(
    (block) =>
      (block.blockerId === buyerId && block.blockedId === sellerId) ||
      (block.blockerId === sellerId && block.blockedId === buyerId)
  );
}

export async function blockUser(input: BlockUserInput): Promise<void> {
  if (input.blockerId === input.blockedId) {
    throw new Error("不能拉黑自己");
  }

  if (input.persist === false) {
    return;
  }

  const { error } = await getSupabaseClient().from("user_blocks").upsert({
    blocker_id: input.blockerId,
    blocked_id: input.blockedId
  });

  if (error) {
    throw error;
  }
}
