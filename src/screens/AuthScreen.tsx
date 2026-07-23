import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { signInWithOtp, verifyOtp } from "../services/auth";
import { PrimaryButton, Section } from "../ui/components";
import { colors, spacing } from "../ui/theme";

interface AuthScreenProps {
  authConfigured: boolean;
  onAuthenticated: () => Promise<void> | void;
  onEnterDemo: () => void;
}

export function AuthScreen({ authConfigured, onAuthenticated, onEnterDemo }: AuthScreenProps) {
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sendCode = async () => {
    if (!authConfigured) {
      setStatusMessage("请先配置 Supabase 环境变量，或进入演示模式。");
      return;
    }

    setIsSubmitting(true);
    const { error } = await signInWithOtp(phone);
    setIsSubmitting(false);
    setStatusMessage(error ? error.message : "验证码已发送");
  };

  const confirmCode = async () => {
    if (!authConfigured) {
      setStatusMessage("请先配置 Supabase 环境变量，或进入演示模式。");
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await verifyOtp(phone, token);
      if (error) {
        setStatusMessage(error.message);
        return;
      }
      await onAuthenticated();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "登录状态刷新失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Text style={styles.screenTitle}>登录 VeloHive</Text>
      <Section>
        <Text style={styles.label}>手机号</Text>
        <TextInput
          accessibilityLabel="手机号"
          keyboardType="phone-pad"
          onChangeText={setPhone}
          placeholder="+86 138 0000 0000"
          style={styles.input}
          value={phone}
        />
        <Text style={styles.label}>验证码</Text>
        <TextInput
          accessibilityLabel="验证码"
          keyboardType="number-pad"
          onChangeText={setToken}
          placeholder="输入短信验证码"
          style={styles.input}
          value={token}
        />
        <View style={styles.actions}>
          <PrimaryButton label={isSubmitting ? "处理中" : "发送验证码"} onPress={sendCode} />
          <PrimaryButton label="登录" onPress={confirmCode} />
        </View>
        {statusMessage ? <Text style={styles.status}>{statusMessage}</Text> : null}
      </Section>
      {!authConfigured ? (
        <Section>
          <Text style={styles.label}>开发环境未连接 Supabase</Text>
          <Text style={styles.body}>配置 `.env` 后可使用真实登录。现在可以先进入演示模式继续试用商品和据点流程。</Text>
          <PrimaryButton label="进入演示模式" accessibilityLabel="进入演示模式" onPress={onEnterDemo} />
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
    fontSize: 14,
    fontWeight: "700",
    marginBottom: spacing.sm
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    color: colors.ink,
    marginBottom: spacing.md,
    padding: spacing.md
  },
  actions: {
    gap: spacing.sm
  },
  status: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.md
  },
  body: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.md
  }
});
