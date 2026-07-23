import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Chip, Section } from "./src/ui/components";
import { colors, spacing } from "./src/ui/theme";

type MainTab = "home" | "map" | "publish" | "messages" | "profile";
type HomeTab = "gear" | "hubs";

const mainTabs: Array<{ id: MainTab; label: string }> = [
  { id: "home", label: "首页" },
  { id: "map", label: "地图" },
  { id: "publish", label: "发布" },
  { id: "messages", label: "消息" },
  { id: "profile", label: "我的" }
];

export default function App() {
  const [mainTab, setMainTab] = useState<MainTab>("home");
  const [homeTab, setHomeTab] = useState<HomeTab>("gear");

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.brand}>VeloHive</Text>
        <Text style={styles.region}>上海周边</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {mainTab === "home" ? (
          <>
            <View style={styles.tabRow}>
              <Chip label="淘装备" selected={homeTab === "gear"} onPress={() => setHomeTab("gear")} />
              <Chip label="找据点" selected={homeTab === "hubs"} onPress={() => setHomeTab("hubs")} />
            </View>
            <Section>
              <Text style={styles.title}>{homeTab === "gear" ? "支持线下验货的公路车闲置" : "骑友友好据点"}</Text>
              <Text style={styles.body}>
                {homeTab === "gear"
                  ? "整车、车架、轮组、套件、码表和高价值配件。"
                  : "咖啡吧、农家乐、车店、骑行驿站，适合休息、集合和验货。"}
              </Text>
            </Section>
          </>
        ) : (
          <Section>
            <Text style={styles.title}>{mainTabs.find((tab) => tab.id === mainTab)?.label}</Text>
            <Text style={styles.body}>该页面将在后续任务中接入具体内容。</Text>
          </Section>
        )}
      </ScrollView>
      <View style={styles.bottomTabs}>
        {mainTabs.map((tab) => (
          <Chip key={tab.id} label={tab.label} selected={mainTab === tab.id} onPress={() => setMainTab(tab.id)} />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.surface
  },
  brand: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "800"
  },
  region: {
    color: colors.muted,
    marginTop: spacing.xs
  },
  content: {
    padding: spacing.lg
  },
  tabRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.sm
  },
  body: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  bottomTabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.xs,
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface
  }
});
