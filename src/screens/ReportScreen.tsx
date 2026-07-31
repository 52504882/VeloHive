import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { submitReport, validateReportInput, type ReportTargetType } from "../services/reporting";
import { Chip, PrimaryButton, Section } from "../ui/components";
import { colors, spacing } from "../ui/theme";

interface ReportScreenProps {
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  targetLabel: string;
  persist?: boolean;
  onSubmitted?: () => void;
}

const reportReasons = ["疑似假货", "欺诈或钓鱼", "禁售品", "骚扰或辱骂", "其他"];

export function ReportScreen({
  reporterId,
  targetType,
  targetId,
  targetLabel,
  persist = false,
  onSubmitted
}: ReportScreenProps) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const nextErrors = validateReportInput({ reason, details });
    setErrors(nextErrors);
    setMessage("");
    if (nextErrors.length > 0 || submitting) {
      return;
    }

    setSubmitting(true);
    try {
      await submitReport({
        reporterId,
        targetType,
        targetId,
        reason,
        details,
        persist
      });
      setMessage("举报已提交，平台会尽快处理。");
      onSubmitted?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "举报提交失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Section>
      <Text style={styles.title}>举报</Text>
      <Text style={styles.meta}>{targetLabel}</Text>
      <View style={styles.reasonGrid}>
        {reportReasons.map((reportReason) => (
          <Chip
            key={reportReason}
            label={reportReason}
            selected={reason === reportReason}
            onPress={() => {
              setReason(reportReason);
              setErrors([]);
              setMessage("");
            }}
          />
        ))}
      </View>
      <TextInput
        accessibilityLabel="举报补充说明"
        style={styles.input}
        value={details}
        onChangeText={setDetails}
        placeholder="补充说明"
        multiline
      />
      {errors.map((error) => (
        <Text key={error} style={styles.error}>
          {error}
        </Text>
      ))}
      <PrimaryButton disabled={submitting} label={submitting ? "提交中" : "提交举报"} onPress={handleSubmit} />
      {message ? <Text style={message.startsWith("举报已提交") ? styles.success : styles.error}>{message}</Text> : null}
    </Section>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: spacing.sm
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.md
  },
  reasonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    color: colors.ink,
    minHeight: 84,
    padding: spacing.md,
    textAlignVertical: "top",
    marginBottom: spacing.sm
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
