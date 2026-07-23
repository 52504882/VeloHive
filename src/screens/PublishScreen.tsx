import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { hubs } from "../data/seed";
import { validatePublishDraft } from "../services/publishValidation";
import { Chip, PrimaryButton, Section } from "../ui/components";
import { colors, spacing } from "../ui/theme";

export function PublishScreen() {
  const [title, setTitle] = useState("Specialized Tarmac SL7 整车");
  const [brand, setBrand] = useState("Specialized");
  const [model, setModel] = useState("Tarmac SL7");
  const [price, setPrice] = useState("32800");
  const [condition, setCondition] = useState("9 成新");
  const [flawDescription, setFlawDescription] = useState("右侧手变有轻微擦痕，已拍照标注。");
  const [supportsInspection, setSupportsInspection] = useState(true);
  const [selectedHubId, setSelectedHubId] = useState("hub-001");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewBlocked, setPreviewBlocked] = useState(false);

  const draft = useMemo(
    () => ({
      title,
      brand,
      model,
      price,
      condition,
      flawDescription,
      supportsOfflineInspection: supportsInspection,
      recommendedHubIds: supportsInspection && selectedHubId ? [selectedHubId] : []
    }),
    [brand, condition, flawDescription, model, price, selectedHubId, supportsInspection, title]
  );

  const errors = validatePublishDraft(draft);
  const selectedHub = hubs.find((hub) => hub.id === selectedHubId);

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
        {previewBlocked ? <Text style={styles.error}>请先修正发布检查中的问题</Text> : null}
        <PrimaryButton label="预览发布" onPress={handlePreview} />
      </Section>
      {previewVisible ? (
        <Section>
          <Text style={styles.label}>发布预览</Text>
          <Text style={styles.previewTitle}>{title}</Text>
          <Text style={styles.previewMeta}>价格：￥{Number(price).toLocaleString("zh-CN")}</Text>
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
