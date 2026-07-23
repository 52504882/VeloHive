import { Image, StyleSheet, Text } from "react-native";
import { listings } from "../data/seed";
import { findHubById } from "../services/catalog";
import { PrimaryButton, Section } from "../ui/components";
import { colors, spacing } from "../ui/theme";

interface HubDetailScreenProps {
  hubId: string;
  onBack: () => void;
}

export function HubDetailScreen({ hubId, onBack }: HubDetailScreenProps) {
  const hub = findHubById(hubId);

  if (!hub) {
    return (
      <>
        <PrimaryButton label="返回" onPress={onBack} />
        <Section>
          <Text style={styles.screenTitle}>据点详情</Text>
          <Text style={styles.meta}>未找到据点</Text>
        </Section>
      </>
    );
  }

  const linkedListings = listings.filter((listing) => listing.recommendedHubIds.includes(hub.id));

  return (
    <>
      <PrimaryButton label="返回" onPress={onBack} />
      <Section>
        <Text style={styles.screenTitle}>据点详情</Text>
        <Image source={{ uri: hub.imageUrls[0] }} style={styles.image} />
        <Text style={styles.cardTitle}>{hub.name}</Text>
        <Text style={styles.meta}>{hub.address}</Text>
        <Text style={styles.meta}>{hub.businessHours}</Text>
      </Section>
      <Section>
        <Text style={styles.label}>设施与联系</Text>
        <Text style={styles.meta}>设施：{hub.facilityTags.join(" · ")}</Text>
        <Text style={styles.meta}>联系：{hub.contactMethod}</Text>
        <Text style={styles.meta}>{hub.suitableForInspection ? "适合线下验货" : "暂不适合线下验货"}</Text>
      </Section>
      <Section>
        <Text style={styles.label}>关联商品</Text>
        {linkedListings.length > 0 ? (
          linkedListings.map((listing) => (
            <Text key={listing.id} style={styles.meta}>
              {listing.title}
            </Text>
          ))
        ) : (
          <Text style={styles.meta}>暂无关联商品</Text>
        )}
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
  image: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    backgroundColor: colors.line,
    marginBottom: spacing.md
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: spacing.xs
  },
  label: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: spacing.sm
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20
  }
});
