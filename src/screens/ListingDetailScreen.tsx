import { Image, StyleSheet, Text } from "react-native";
import {
  findHubById,
  findListingById,
  getListingSeller,
  getListingVerification,
  getTrustLabel
} from "../services/catalog";
import { PrimaryButton, Section } from "../ui/components";
import { colors, spacing } from "../ui/theme";

interface ListingDetailScreenProps {
  listingId: string;
  onBack: () => void;
}

export function ListingDetailScreen({ listingId, onBack }: ListingDetailScreenProps) {
  const listing = findListingById(listingId);

  if (!listing) {
    return (
      <>
        <PrimaryButton label="返回" onPress={onBack} />
        <Section>
          <Text style={styles.screenTitle}>商品详情</Text>
          <Text style={styles.meta}>未找到商品</Text>
        </Section>
      </>
    );
  }

  const seller = getListingSeller(listing.id);
  const verification = getListingVerification(listing.id);
  const trustLabel = verification ? getTrustLabel(verification.selfVerificationScore) : "基础自证";
  const recommendedHubNames = listing.recommendedHubIds
    .map((hubId) => findHubById(hubId)?.name)
    .filter((hubName): hubName is string => Boolean(hubName));

  return (
    <>
      <PrimaryButton label="返回" onPress={onBack} />
      <Section>
        <Text style={styles.screenTitle}>商品详情</Text>
        <Image source={{ uri: listing.imageUrls[0] }} style={styles.image} />
        <Text style={styles.cardTitle}>{listing.title}</Text>
        <Text style={styles.price}>￥{listing.price.toLocaleString("zh-CN")}</Text>
        <Text style={styles.meta}>
          {listing.brand} {listing.model} · {listing.condition}
        </Text>
        <Text style={styles.meta}>规格：{listing.specs.join(" · ")}</Text>
        <Text style={styles.meta}>卖家：{seller?.nickname ?? "未知卖家"}</Text>
      </Section>
      <Section>
        <Text style={styles.label}>商品说明</Text>
        <Text style={styles.body}>{listing.description}</Text>
        <Text style={styles.label}>瑕疵说明</Text>
        <Text style={styles.body}>{listing.flawDescription}</Text>
      </Section>
      <Section>
        <Text style={styles.label}>验真自证</Text>
        <Text style={styles.meta}>信任标签：{trustLabel}</Text>
        <Text style={styles.meta}>自证分：{verification ? verification.selfVerificationScore : "暂无"}</Text>
        <Text style={styles.meta}>说明：{verification?.notes ?? "暂无自证说明"}</Text>
        {verification?.maskedSerialOrFrameNumber ? (
          <Text style={styles.meta}>序列号/车架号：{verification.maskedSerialOrFrameNumber}</Text>
        ) : null}
      </Section>
      <Section>
        <Text style={styles.label}>推荐据点</Text>
        <Text style={styles.meta}>
          {recommendedHubNames.length > 0 ? recommendedHubNames.join(" · ") : "暂无推荐据点"}
        </Text>
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
  price: {
    color: colors.coral,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: spacing.xs
  },
  label: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: spacing.sm
  },
  body: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.md
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20
  }
});
