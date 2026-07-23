import { Image, StyleSheet, Text, View } from "react-native";
import { hubs, listings } from "../data/seed";
import { getListingVerification, getTrustLabel } from "../services/catalog";
import { Chip, Section } from "../ui/components";
import { colors, spacing } from "../ui/theme";

type HomeTab = "gear" | "hubs";

interface HomeScreenProps {
  activeTab: HomeTab;
  onChangeTab: (tab: HomeTab) => void;
}

export function HomeScreen({ activeTab, onChangeTab }: HomeScreenProps) {
  return (
    <>
      <View style={styles.tabRow}>
        <Chip label="淘装备" selected={activeTab === "gear"} onPress={() => onChangeTab("gear")} />
        <Chip label="找据点" selected={activeTab === "hubs"} onPress={() => onChangeTab("hubs")} />
      </View>
      {activeTab === "gear" ? <GearList /> : <HubList />}
    </>
  );
}

function GearList() {
  return (
    <>
      <Text style={styles.screenTitle}>支持线下验货的公路车闲置</Text>
      {listings.map((listing) => {
        const verification = getListingVerification(listing.id);
        const trustLabel = verification ? getTrustLabel(verification.selfVerificationScore) : "基础自证";

        return (
          <Section key={listing.id}>
            <Image source={{ uri: listing.imageUrls[0] }} style={styles.image} />
            <Text style={styles.cardTitle}>{listing.title}</Text>
            <Text style={styles.price}>￥{listing.price.toLocaleString("zh-CN")}</Text>
            <Text style={styles.meta}>
              {listing.brand} {listing.model} · {listing.condition}
            </Text>
            <Text style={styles.meta}>
              {listing.supportsOfflineInspection ? "支持线下验货" : "暂不支持线下验货"} · {trustLabel}
            </Text>
          </Section>
        );
      })}
    </>
  );
}

function HubList() {
  return (
    <>
      <Text style={styles.screenTitle}>骑友友好据点</Text>
      {hubs.map((hub) => (
        <Section key={hub.id}>
          <Image source={{ uri: hub.imageUrls[0] }} style={styles.image} />
          <Text style={styles.cardTitle}>{hub.name}</Text>
          <Text style={styles.meta}>{hub.address}</Text>
          <Text style={styles.meta}>{hub.facilityTags.join(" · ")}</Text>
        </Section>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  screenTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: spacing.md
  },
  image: {
    width: "100%",
    height: 140,
    borderRadius: 8,
    backgroundColor: colors.line,
    marginBottom: spacing.md
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.xs
  },
  price: {
    color: colors.coral,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: spacing.xs
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19
  }
});
