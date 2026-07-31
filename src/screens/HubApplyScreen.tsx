import { useState } from "react";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { submitHubApplication, validateHubApplication } from "../services/hubApplications";
import { Chip, PrimaryButton, Section } from "../ui/components";
import { colors, spacing } from "../ui/theme";

interface HubApplyScreenProps {
  ownerId: string;
  persist?: boolean;
  onBack: () => void;
}

const facilityOptions = ["咖啡", "停车", "厕所", "补水", "打气", "餐食"];

export function HubApplyScreen({ ownerId, persist = false, onBack }: HubApplyScreenProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [businessHours, setBusinessHours] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [facilityTags, setFacilityTags] = useState<string[]>([]);
  const [suitableForInspection, setSuitableForInspection] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleFacility = (facility: string) => {
    setFacilityTags((currentTags) =>
      currentTags.includes(facility)
        ? currentTags.filter((currentFacility) => currentFacility !== facility)
        : [...currentTags, facility]
    );
    setErrors([]);
    setMessage("");
  };

  const handleSubmit = async () => {
    const nextErrors = validateHubApplication({
      name,
      address,
      businessHours,
      contactMethod,
      facilityTags
    });
    setErrors(nextErrors);
    setMessage("");
    if (nextErrors.length > 0 || submitting) {
      return;
    }

    setSubmitting(true);
    try {
      await submitHubApplication({
        ownerId,
        name,
        type: "cafe",
        address,
        businessHours,
        contactMethod,
        facilityTags,
        suitableForInspection,
        persist
      });
      setMessage("已提交入驻申请，平台将在 3 个工作日内审核");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "入驻申请提交失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PrimaryButton label="返回" onPress={onBack} />
      <Section>
        <Text style={styles.title}>据点入驻</Text>
        <TextInput
          accessibilityLabel="据点名称"
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="据点名称"
        />
        <TextInput
          accessibilityLabel="据点地址"
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="据点地址"
        />
        <TextInput
          accessibilityLabel="营业时间"
          style={styles.input}
          value={businessHours}
          onChangeText={setBusinessHours}
          placeholder="营业时间"
        />
        <TextInput
          accessibilityLabel="联系方式"
          style={styles.input}
          value={contactMethod}
          onChangeText={setContactMethod}
          placeholder="联系方式"
        />
        <View style={styles.row}>
          <Text style={styles.label}>支持线下验货</Text>
          <Switch
            accessibilityLabel="据点支持线下验货"
            value={suitableForInspection}
            onValueChange={setSuitableForInspection}
          />
        </View>
        <View style={styles.facilities}>
          {facilityOptions.map((facility) => (
            <Chip
              key={facility}
              label={facility}
              selected={facilityTags.includes(facility)}
              onPress={() => toggleFacility(facility)}
            />
          ))}
        </View>
        {errors.map((error) => (
          <Text key={error} style={styles.error}>
            {error}
          </Text>
        ))}
        <PrimaryButton disabled={submitting} label={submitting ? "提交中" : "提交入驻申请"} onPress={handleSubmit} />
        {message ? <Text style={message.startsWith("已提交") ? styles.success : styles.error}>{message}</Text> : null}
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: spacing.md
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    color: colors.ink,
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md
  },
  label: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700"
  },
  facilities: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  error: {
    color: colors.coral,
    marginBottom: spacing.sm
  },
  success: {
    color: colors.forest,
    marginTop: spacing.sm
  }
});
