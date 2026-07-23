import { StyleSheet, Text } from "react-native";
import { conversations } from "../data/seed";
import { findListingById } from "../services/catalog";
import { Section } from "../ui/components";
import { colors, spacing } from "../ui/theme";

export function MessagesScreen() {
  return (
    <>
      <Text style={styles.screenTitle}>消息</Text>
      {conversations.map((conversation) => {
        const listing = findListingById(conversation.listingId);

        return (
          <Section key={conversation.id}>
            <Text style={styles.title}>{listing?.title ?? "关联商品"}</Text>
            <Text style={styles.preview}>{conversation.lastMessagePreview}</Text>
            <Text style={styles.meta}>状态：已约看</Text>
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
    color: colors.muted
  }
});
