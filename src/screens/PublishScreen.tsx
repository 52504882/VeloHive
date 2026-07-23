import { useMemo, useState } from "react";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { hubs } from "../data/seed";
import { validatePublishDraft } from "../services/publishValidation";
import { Chip, PrimaryButton, Section } from "../ui/components";
import { colors, spacing } from "../ui/theme";

export function PublishScreen() {
  const [supportsInspection, setSupportsInspection] = useState(true);
  const [selectedHubId, setSelectedHubId] = useState("hub-001");

  const draft = useMemo(
    () => ({
      title: "请输入标题",
      brand: "品牌",
      model: "型号",
      price: "0",
      condition: "成色",
      flawDescription: "",
      supportsOfflineInspection: supportsInspection,
      recommendedHubIds: supportsInspection && selectedHubId ? [selectedHubId] : []
    }),
    [selectedHubId, supportsInspection]
  );

  const errors = validatePublishDraft(draft);

  return (
    <>
      <Text style={styles.screenTitle}>发布闲置装备</Text>
      <Section>
        <Text style={styles.label}>基础信息</Text>
        <TextInput style={styles.input} value="Specialized Tarmac SL7 整车" editable={false} />
        <TextInput style={styles.input} value="品牌、型号、价格、成色、瑕疵说明" editable={false} />
      </Section>
      <Section>
        <View style={styles.row}>
          <Text style={styles.label}>支持线下验货</Text>
          <Switch value={supportsInspection} onValueChange={setSupportsInspection} />
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
        <PrimaryButton label="预览发布" onPress={() => undefined} />
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
  }
});
