import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { currentUserId } from "../data/seed";
import { ReportScreen } from "./ReportScreen";
import {
  findHubById,
  findListingById,
  getListingSeller,
  getListingVerification,
  getTrustLabel
} from "../services/catalog";
import { blockUser } from "../services/blocks";
import { PrimaryButton, Section } from "../ui/components";
import { colors, spacing } from "../ui/theme";

interface ListingDetailScreenProps {
  authConfigured?: boolean;
  listingId: string;
  onBack: () => void;
  userId?: string | null;
}

export function ListingDetailScreen({
  authConfigured = false,
  listingId,
  onBack,
  userId = null
}: ListingDetailScreenProps) {
  const [reportVisible, setReportVisible] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const isDemoMode = !authConfigured || !userId || userId === "demo-user";
  const actorId = isDemoMode ? currentUserId : userId ?? currentUserId;
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
  const handleBlockSeller = async () => {
    if (!seller) {
      setActionMessage("未找到卖家，暂时无法拉黑");
      return;
    }

    try {
      await blockUser({
        blockerId: actorId,
        blockedId: seller.id,
        persist: !isDemoMode
      });
      setActionMessage("已拉黑卖家");
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : "拉黑失败，请稍后重试");
    }
  };

  return (
    <>
      <PrimaryButton label="返回" onPress={onBack} />
      {reportVisible ? (
        <ReportScreen
          reporterId={actorId}
          targetType="listing"
          targetId={listing.id}
          targetLabel={listing.title}
          persist={!isDemoMode}
        />
      ) : null}
      <Section>
        <Text style={styles.screenTitle}>商品详情</Text>
        <Image resizeMode="cover" source={{ uri: listing.imageUrls[0] }} style={styles.image} />
        <Text style={styles.cardTitle}>{listing.title}</Text>
        <Text style={styles.price}>￥{listing.price.toLocaleString("zh-CN")}</Text>
        <Text style={styles.meta}>
          {listing.brand} {listing.model} · {listing.condition}
        </Text>
        <Text style={styles.meta}>规格：{listing.specs.join(" · ")}</Text>
        <Text style={styles.meta}>卖家：{seller?.nickname ?? "未知卖家"}</Text>
        <View style={styles.actionStack}>
          <PrimaryButton
            label={reportVisible ? "收起举报" : "举报商品"}
            onPress={() => {
              setReportVisible((visible) => !visible);
              setActionMessage("");
            }}
          />
          <PrimaryButton label="拉黑卖家" onPress={handleBlockSeller} />
        </View>
        {actionMessage ? <Text style={actionMessage.startsWith("已") ? styles.success : styles.error}>{actionMessage}</Text> : null}
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
  },
  actionStack: {
    gap: spacing.sm,
    marginTop: spacing.md
  },
  error: {
    color: colors.coral,
    marginTop: spacing.sm
  },
  success: {
    color: colors.forest,
    marginTop: spacing.sm
  }
});
