import { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { hubs } from "../data/seed";
import type { LocalImageAsset, UploadedListingImage } from "../services/imageAssets";
import { removeUploadedListingImages, uploadListingImages, validateListingImages } from "../services/imageAssets";
import { ListingSubmissionError, submitListingForReview } from "../services/listingRepository";
import { defaultProhibitedRules } from "../services/prohibitedRules";
import { getPublishReviewWarnings, validatePublishDraft } from "../services/publishValidation";
import { Chip, PrimaryButton, Section } from "../ui/components";
import { colors, spacing } from "../ui/theme";

interface PublishScreenProps {
  authConfigured?: boolean;
  userId?: string | null;
}

const demoImage: LocalImageAsset = {
  uri: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=900&q=80"
};

export function PublishScreen({ authConfigured = false, userId = null }: PublishScreenProps) {
  const isDemoMode = !authConfigured || userId === "demo-user";
  const [title, setTitle] = useState("Specialized Tarmac SL7 整车");
  const [brand, setBrand] = useState("Specialized");
  const [model, setModel] = useState("Tarmac SL7");
  const [price, setPrice] = useState("32800");
  const [condition, setCondition] = useState("9 成新");
  const [flawDescription, setFlawDescription] = useState("右侧手变有轻微擦痕，已拍照标注。");
  const [images, setImages] = useState<LocalImageAsset[]>(() => (isDemoMode ? [demoImage] : []));
  const [supportsInspection, setSupportsInspection] = useState(true);
  const [selectedHubId, setSelectedHubId] = useState("hub-001");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewBlocked, setPreviewBlocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const selectedHub = hubs.find((hub) => hub.id === selectedHubId);
  const recommendedHubIds = useMemo(
    () =>
      supportsInspection && selectedHub
        ? isDemoMode
          ? [selectedHub.id]
          : selectedHub.databaseId
            ? [selectedHub.databaseId]
            : []
        : [],
    [isDemoMode, selectedHub, supportsInspection]
  );

  const draft = useMemo(
    () => ({
      title,
      brand,
      model,
      price,
      condition,
      flawDescription,
      supportsOfflineInspection: supportsInspection,
      recommendedHubIds
    }),
    [brand, condition, flawDescription, model, price, recommendedHubIds, supportsInspection, title]
  );

  const errors = [
    ...validatePublishDraft(draft, defaultProhibitedRules),
    ...validateListingImages(images.map((image) => image.uri))
  ];
  const warnings = getPublishReviewWarnings(draft, defaultProhibitedRules);

  useEffect(() => {
    if (errors.length > 0 && previewVisible) {
      setPreviewVisible(false);
    }
  }, [errors.length, previewVisible]);

  const handlePreview = () => {
    if (errors.length > 0) {
      setPreviewVisible(false);
      setPreviewBlocked(true);
      return;
    }

    setPreviewBlocked(false);
    setPreviewVisible(true);
  };

  const handlePickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      base64: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      selectionLimit: 9
    });

    if (result.canceled) {
      return;
    }

    setImages(
      result.assets.map((asset) => ({
        uri: asset.uri,
        base64: asset.base64
      }))
    );
    setPreviewVisible(false);
    setPreviewBlocked(false);
    setSubmitMessage("");
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    if (errors.length > 0) {
      setPreviewBlocked(true);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");
    let uploadedImages: UploadedListingImage[] = [];
    try {
      const sellerId = userId ?? "demo-user";

      if (!isDemoMode && !userId) {
        throw new Error("请先登录后再提交审核");
      }

      uploadedImages = isDemoMode ? [] : await uploadListingImages(sellerId, images);
      const imageUrls = isDemoMode ? images.map((image) => image.uri) : uploadedImages.map((image) => image.publicUrl);

      await submitListingForReview({
        sellerId,
        title,
        category: "complete_bike",
        brand,
        model,
        price: Number(price),
        condition,
        specs: ["尺码/规格待补充"],
        description: "移动端发布提交，等待卖家补充更完整说明。",
        flawDescription,
        imageUrls,
        supportsOfflineInspection: supportsInspection,
        recommendedHubIds,
        persist: !isDemoMode
      });

      setSubmitMessage("已提交审核");
      setPreviewVisible(false);
    } catch (error) {
      const shouldCleanupUploadedImages =
        !(error instanceof ListingSubmissionError) || error.shouldCleanupUploadedImages;
      if (uploadedImages.length > 0 && shouldCleanupUploadedImages) {
        await removeUploadedListingImages(uploadedImages).catch(() => undefined);
      }
      setSubmitMessage(error instanceof Error ? error.message : "提交失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Text style={styles.screenTitle}>发布闲置装备</Text>
      <Section>
        <Text style={styles.label}>基础信息</Text>
        <TextInput
          accessibilityLabel="标题"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="标题"
        />
        <TextInput
          accessibilityLabel="品牌"
          style={styles.input}
          value={brand}
          onChangeText={setBrand}
          placeholder="品牌"
        />
        <TextInput
          accessibilityLabel="型号"
          style={styles.input}
          value={model}
          onChangeText={setModel}
          placeholder="型号"
        />
        <TextInput
          accessibilityLabel="价格"
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="价格"
          keyboardType="numeric"
        />
        <TextInput
          accessibilityLabel="成色"
          style={styles.input}
          value={condition}
          onChangeText={setCondition}
          placeholder="成色"
        />
        <TextInput
          accessibilityLabel="瑕疵说明"
          style={[styles.input, styles.multilineInput]}
          value={flawDescription}
          onChangeText={setFlawDescription}
          placeholder="瑕疵说明"
          multiline
        />
      </Section>
      <Section>
        <Text style={styles.label}>商品照片</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageStrip}>
          {images.map((image) => (
            <Image key={image.uri} resizeMode="cover" source={{ uri: image.uri }} style={styles.previewImage} />
          ))}
        </ScrollView>
        <Text style={styles.helper}>已选择 {images.length} 张，最多 9 张</Text>
        <PrimaryButton label="选择照片" accessibilityLabel="选择商品照片" onPress={handlePickImages} />
      </Section>
      <Section>
        <View style={styles.row}>
          <Text style={styles.label}>支持线下验货</Text>
          <Switch
            accessibilityLabel="支持线下验货"
            value={supportsInspection}
            onValueChange={setSupportsInspection}
          />
        </View>
        <View style={styles.chips}>
          {hubs
            .filter((hub) => hub.suitableForInspection)
            .map((hub) => (
              <Chip
                key={hub.id}
                label={hub.name}
                selected={hub.id === selectedHubId}
                onPress={() => setSelectedHubId(hub.id)}
              />
            ))}
        </View>
      </Section>
      <Section>
        <Text style={styles.label}>发布检查</Text>
        {errors.map((error) => (
          <Text key={error} style={styles.error}>
            {error}
          </Text>
        ))}
        {warnings.map((warning) => (
          <Text key={warning} style={styles.warning}>
            {warning}
          </Text>
        ))}
        {previewBlocked ? <Text style={styles.error}>请先修正发布检查中的问题</Text> : null}
        <PrimaryButton label="预览发布" onPress={handlePreview} />
        <View style={styles.submitButton}>
          <PrimaryButton disabled={isSubmitting} label={isSubmitting ? "提交中" : "提交审核"} onPress={handleSubmit} />
        </View>
        {submitMessage ? <Text style={submitMessage === "已提交审核" ? styles.success : styles.error}>{submitMessage}</Text> : null}
      </Section>
      {previewVisible ? (
        <Section>
          <Text style={styles.label}>发布预览</Text>
          <Image resizeMode="cover" source={{ uri: images[0]?.uri }} style={styles.previewHero} />
          <Text style={styles.previewTitle}>{title}</Text>
          <Text style={styles.previewMeta}>价格：￥{Number(price).toLocaleString("zh-CN")}</Text>
          <Text style={styles.previewMeta}>照片：{images.length} 张</Text>
          <Text style={styles.previewMeta}>
            验货据点：{supportsInspection ? selectedHub?.name ?? "待选择" : "不启用线下验货"}
          </Text>
          <Text style={styles.previewMeta}>{supportsInspection ? "已启用线下验货" : "未启用线下验货"}</Text>
        </Section>
      ) : null}
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
  label: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: spacing.sm
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    color: colors.muted
  },
  multilineInput: {
    minHeight: 72,
    textAlignVertical: "top"
  },
  imageStrip: {
    marginBottom: spacing.sm
  },
  previewImage: {
    width: 96,
    height: 72,
    borderRadius: 8,
    backgroundColor: colors.line,
    marginRight: spacing.sm
  },
  helper: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.md
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md
  },
  error: {
    color: colors.coral,
    marginBottom: spacing.sm
  },
  warning: {
    color: colors.honey,
    marginBottom: spacing.sm
  },
  success: {
    color: colors.forest,
    marginTop: spacing.sm
  },
  submitButton: {
    marginTop: spacing.sm
  },
  previewHero: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    backgroundColor: colors.line,
    marginBottom: spacing.md
  },
  previewTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: spacing.xs
  },
  previewMeta: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20
  }
});
