import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { conversations, currentUserId } from "../data/seed";
import type { ConversationMeetupStatus } from "../domain/types";
import { blockUser } from "../services/blocks";
import { findListingById, findUserById } from "../services/catalog";
import { PrimaryButton, Section } from "../ui/components";
import { colors, spacing } from "../ui/theme";

const meetupStatusLabels: Record<ConversationMeetupStatus, string> = {
  chatting: "沟通中",
  viewing_scheduled: "已约看",
  completed: "已完成",
  cancelled: "已取消"
};

interface MessagesScreenProps {
  authConfigured?: boolean;
  userId?: string | null;
}

export function MessagesScreen({ authConfigured = false, userId = null }: MessagesScreenProps) {
  const [message, setMessage] = useState("");
  const isDemoMode = !authConfigured || !userId || userId === "demo-user";
  const actorId = isDemoMode ? currentUserId : userId ?? currentUserId;

  const handleBlockUser = async (blockedId: string) => {
    try {
      await blockUser({
        blockerId: actorId,
        blockedId,
        persist: !isDemoMode
      });
      setMessage("已拉黑用户");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "拉黑失败，请稍后重试");
    }
  };

  return (
    <>
      <Text style={styles.screenTitle}>消息</Text>
      {message ? <Text style={message.startsWith("已") ? styles.success : styles.error}>{message}</Text> : null}
      {conversations.map((conversation) => {
        const listing = findListingById(conversation.listingId);
        const otherUserId = conversation.buyerId === actorId ? conversation.sellerId : conversation.buyerId;
        const otherUser = findUserById(otherUserId);

        return (
          <Section key={conversation.id}>
            <Text style={styles.title}>{listing?.title ?? "关联商品"}</Text>
            <Text style={styles.preview}>{conversation.lastMessagePreview}</Text>
            <Text style={styles.meta}>对方：{otherUser?.nickname ?? "未知用户"}</Text>
            <Text style={styles.meta}>状态：{meetupStatusLabels[conversation.meetupStatus]}</Text>
            <PrimaryButton label="拉黑用户" onPress={() => handleBlockUser(otherUserId)} />
          </Section>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  screenTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: spacing.md
  },
  title: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.xs
  },
  preview: {
    color: colors.ink,
    marginBottom: spacing.sm
  },
  meta: {
    color: colors.muted,
    marginBottom: spacing.sm
  },
  error: {
    color: colors.coral,
    marginBottom: spacing.sm
  },
  success: {
    color: colors.forest,
    marginBottom: spacing.sm
  }
});
