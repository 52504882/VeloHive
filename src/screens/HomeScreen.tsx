import { useState } from "react";
import { Image, StyleSheet, Text, TextInput, View } from "react-native";
import { hubs } from "../data/seed";
import { getListingVerification, getTrustLabel, searchListings } from "../services/catalog";
import { Chip, PrimaryButton, Section } from "../ui/components";
import { colors, spacing } from "../ui/theme";

type HomeTab = "gear" | "hubs";

interface HomeScreenProps {
  activeTab: HomeTab;
  onChangeTab: (tab: HomeTab) => void;
  onOpenListing: (listingId: string) => void;
  onOpenHub: (hubId: string) => void;
}

export function HomeScreen({ activeTab, onChangeTab, onOpenListing, onOpenHub }: HomeScreenProps) {
  return (
    <>
      <View style={styles.tabRow}>
        <Chip label="淘装备" selected={activeTab === "gear"} onPress={() => onChangeTab("gear")} />
        <Chip label="找据点" selected={activeTab === "hubs"} onPress={() => onChangeTab("hubs")} />
      </View>
      {activeTab === "gear" ? (
        <GearList onOpenListing={onOpenListing} />
      ) : (
        <HubList onOpenHub={onOpenHub} />
      )}
    </>
  );
}

function GearList({ onOpenListing }: { onOpenListing: (listingId: string) => void }) {
  const [query, setQuery] = useState("");
  const [inspectionOnly, setInspectionOnly] = useState(false);
  const listingResults = searchListings(query, {
    supportsOfflineInspection: inspectionOnly ? true : undefined
  });

  return (
    <>
      <Text style={styles.screenTitle}>支持线下验货的公路车闲置</Text>
      <Section>
        <TextInput
          accessibilityLabel="搜索装备"
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="搜索品牌、型号或关键词"
        />
        <View style={styles.filterRow}>
          <Chip label="只看可验货" selected={inspectionOnly} onPress={() => setInspectionOnly((value) => !value)} />
          <Text style={styles.count}>找到 {listingResults.length} 件装备</Text>
        </View>
      </Section>
      {listingResults.map((listing) => {
        const verification = getListingVerification(listing.id);
        const trustLabel = verification ? getTrustLabel(verification.selfVerificationScore) : "基础自证";

        return (
          <Section key={listing.id}>
            <Image resizeMode="cover" source={{ uri: listing.imageUrls[0] }} style={styles.image} />
            <Text style={styles.cardTitle}>{listing.title}</Text>
            <Text style={styles.price}>￥{listing.price.toLocaleString("zh-CN")}</Text>
            <Text style={styles.meta}>
              {listing.brand} {listing.model} · {listing.condition}
            </Text>
            <Text style={styles.meta}>
              {listing.supportsOfflineInspection ? "支持线下验货" : "暂不支持线下验货"} · {trustLabel}
            </Text>
            <View style={styles.actionRow}>
              <PrimaryButton
                label="查看详情"
                accessibilityLabel={`查看商品 ${listing.title}`}
                onPress={() => onOpenListing(listing.id)}
              />
            </View>
          </Section>
        );
      })}
    </>
  );
}

function HubList({ onOpenHub }: { onOpenHub: (hubId: string) => void }) {
  return (
    <>
      <Text style={styles.screenTitle}>骑友友好据点</Text>
      {hubs.map((hub) => (
        <Section key={hub.id}>
          <Image resizeMode="cover" source={{ uri: hub.imageUrls[0] }} style={styles.image} />
          <Text style={styles.cardTitle}>{hub.name}</Text>
          <Text style={styles.meta}>{hub.address}</Text>
          <Text style={styles.meta}>{hub.facilityTags.join(" · ")}</Text>
          <View style={styles.actionRow}>
            <PrimaryButton
              label="查看详情"
              accessibilityLabel={`查看据点 ${hub.name}`}
              onPress={() => onOpenHub(hub.id)}
            />
          </View>
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
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    padding: spacing.md,
    color: colors.ink,
    marginBottom: spacing.sm
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  count: {
    color: colors.muted,
    fontSize: 13
  },
  actionRow: {
    marginTop: spacing.md
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19
  }
});
