import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { createConsentPatch } from "../services/policyConsent";
import { PrimaryButton, Section } from "../ui/components";
import { colors, spacing } from "../ui/theme";

interface LegalConsentScreenProps {
  onAccept: (consent: { acceptedTermsAt: string; acceptedPrivacyAt: string }) => Promise<void> | void;
}

export function LegalConsentScreen({ onAccept }: LegalConsentScreenProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const accept = async () => {
    if (!acceptedTerms || !acceptedPrivacy) {
      setErrorMessage("请先阅读并勾选用户协议和隐私政策");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await onAccept(createConsentPatch(new Date().toISOString()));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "协议确认保存失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Text style={styles.screenTitle}>开始前确认</Text>
      <Section>
        <Text style={styles.body}>使用 VeloHive 前，请确认你已阅读并同意平台规则。闲置交易以信息撮合为主，线下验货和付款需自行判断风险。</Text>
        <Checkbox label="我已阅读并同意《用户协议》" selected={acceptedTerms} onPress={() => setAcceptedTerms((value) => !value)} />
        <Checkbox label="我已阅读并同意《隐私政策》" selected={acceptedPrivacy} onPress={() => setAcceptedPrivacy((value) => !value)} />
        <PrimaryButton label={isSubmitting ? "保存中" : "同意并继续"} onPress={accept} />
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </Section>
    </>
  );
}

function Checkbox({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={onPress} style={styles.option}>
      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        <Text style={styles.checkmark}>{selected ? "✓" : ""}</Text>
      </View>
      <Text style={styles.optionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screenTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: spacing.md
  },
  body: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.lg
  },
  option: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
    minHeight: 44
  },
  checkbox: {
    alignItems: "center",
    borderColor: colors.line,
    borderRadius: 6,
    borderWidth: 1,
    height: 24,
    justifyContent: "center",
    width: 24
  },
  checkboxSelected: {
    backgroundColor: colors.forest,
    borderColor: colors.forest
  },
  checkmark: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "800"
  },
  optionText: {
    color: colors.ink,
    flex: 1,
    fontSize: 14,
    lineHeight: 20
  },
  error: {
    color: colors.coral,
    fontSize: 13,
    marginTop: spacing.md
  }
});
