import { StyleSheet, Text } from "react-native";
import { currentUserId, users } from "../data/seed";
import { getProfileStats } from "../services/catalog";
import { PrimaryButton, Section } from "../ui/components";
import { colors, spacing } from "../ui/theme";

interface ProfileScreenProps {
  onOpenHubApply?: () => void;
}

export function ProfileScreen({ onOpenHubApply }: ProfileScreenProps) {
  const user = users.find((item) => item.id === currentUserId);
  const stats = getProfileStats(currentUserId);

  if (!user) {
    return (
      <>
        <Text style={styles.screenTitle}>我的</Text>
        <Section>
          <Text style={styles.item}>未找到用户资料</Text>
        </Section>
      </>
    );
  }

  return (
    <>
      <Text style={styles.screenTitle}>我的</Text>
      <Section>
        <Text style={styles.name}>{user.nickname}</Text>
        <Text style={styles.meta}>
          {user.city} · {user.riderTags.join(" · ")}
        </Text>
      </Section>
      <Section>
        <Text style={styles.item}>我的发布：{stats.activeListings}</Text>
        <Text style={styles.item}>我的收藏：{stats.favorites}</Text>
        <Text style={styles.item}>我的会话：{stats.conversations}</Text>
        <PrimaryButton label="据点入驻" onPress={() => onOpenHubApply?.()} />
        <Text style={styles.item}>举报和反馈</Text>
      </Section>
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
  name: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: spacing.xs
  },
  meta: {
    color: colors.muted
  },
  item: {
    color: colors.ink,
    fontSize: 15,
    marginBottom: spacing.sm
  }
});
