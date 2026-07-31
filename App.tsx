import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { hasPublicEnv } from "./src/config/env";
import { currentUserId } from "./src/data/seed";
import { ConversationScreen } from "./src/screens/ConversationScreen";
import { AuthScreen } from "./src/screens/AuthScreen";
import { HubDetailScreen } from "./src/screens/HubDetailScreen";
import { HubApplyScreen } from "./src/screens/HubApplyScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LegalConsentScreen } from "./src/screens/LegalConsentScreen";
import { ListingDetailScreen } from "./src/screens/ListingDetailScreen";
import { MessagesScreen } from "./src/screens/MessagesScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { PublishScreen } from "./src/screens/PublishScreen";
import { getCurrentSession } from "./src/services/auth";
import { resolveAppGateState } from "./src/services/appGate";
import type { ConversationRecord, MessageRecord } from "./src/services/messageRepository";
import { acceptCurrentProfilePolicies, fetchCurrentProfile, type AuthProfile } from "./src/services/profile";
import { Chip, Section } from "./src/ui/components";
import { colors, spacing } from "./src/ui/theme";

type MainTab = "home" | "map" | "publish" | "messages" | "profile";
type HomeTab = "gear" | "hubs";
type DetailRoute =
  | { type: "main" }
  | { type: "listing"; listingId: string }
  | { type: "hub"; hubId: string }
  | { type: "hubApply" }
  | { type: "conversation"; conversation: ConversationRecord; initialMessages?: MessageRecord[]; title: string };

const mainTabs: Array<{ id: MainTab; label: string }> = [
  { id: "home", label: "首页" },
  { id: "map", label: "地图" },
  { id: "publish", label: "发布" },
  { id: "messages", label: "消息" },
  { id: "profile", label: "我的" }
];

export default function App() {
  const authConfigured = hasPublicEnv();
  const [loadingAuth, setLoadingAuth] = useState(authConfigured);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [authError, setAuthError] = useState("");
  const [mainTab, setMainTab] = useState<MainTab>("home");
  const [homeTab, setHomeTab] = useState<HomeTab>("gear");
  const [detailRoute, setDetailRoute] = useState<DetailRoute>({ type: "main" });
  const resetDetailRoute = () => setDetailRoute({ type: "main" });
  const gateState = resolveAppGateState({
    authenticated: Boolean(userId),
    loading: loadingAuth,
    profile
  });

  useEffect(() => {
    if (!authConfigured) {
      setLoadingAuth(false);
      return;
    }

    let mounted = true;
    refreshSessionProfile()
      .catch((error: unknown) => {
        if (mounted) {
          setAuthError(error instanceof Error ? error.message : "登录状态读取失败");
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingAuth(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [authConfigured]);

  const refreshSessionProfile = async () => {
    const { data, error } = await getCurrentSession();

    if (error) {
      throw error;
    }

    const sessionUserId = data.session?.user.id ?? null;
    setUserId(sessionUserId);
    setProfile(sessionUserId ? await fetchCurrentProfile(sessionUserId) : null);
  };

  const enterDemo = () => {
    setUserId("demo-user");
    setProfile(null);
  };

  const acceptPolicies = async (acceptedConsent: { acceptedTermsAt: string; acceptedPrivacyAt: string }) => {
    if (!authConfigured || userId === "demo-user") {
      setProfile({
        id: "demo-user",
        acceptedTermsAt: acceptedConsent.acceptedTermsAt,
        acceptedPrivacyAt: acceptedConsent.acceptedPrivacyAt,
        status: "active"
      });
      return;
    }

    if (userId) {
      setProfile(await acceptCurrentProfilePolicies(userId, acceptedConsent));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.brand}>VeloHive</Text>
        <Text style={styles.region}>上海周边</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {gateState === "loading" ? (
          <Section>
            <Text style={styles.title}>正在读取登录状态</Text>
            <Text style={styles.body}>请稍候。</Text>
          </Section>
        ) : gateState === "auth" ? (
          <AuthScreen
            authConfigured={authConfigured}
            onAuthenticated={refreshSessionProfile}
            onEnterDemo={enterDemo}
          />
        ) : gateState === "consent" ? (
          <LegalConsentScreen onAccept={acceptPolicies} />
        ) : gateState === "blocked" ? (
          <Section>
            <Text style={styles.title}>账号已被限制</Text>
            <Text style={styles.body}>该账号暂时无法使用 VeloHive。如需申诉，请联系平台客服。</Text>
          </Section>
        ) : (
          renderScreen(mainTab, homeTab, setHomeTab, detailRoute, setDetailRoute, resetDetailRoute, authConfigured, userId)
        )}
        {authError ? <Text style={styles.error}>{authError}</Text> : null}
      </ScrollView>
      {gateState === "ready" ? (
        <View style={styles.bottomTabs}>
          {mainTabs.map((tab) => (
            <Chip
              key={tab.id}
              label={tab.label}
              selected={mainTab === tab.id && detailRoute.type === "main"}
              onPress={() => {
                setMainTab(tab.id);
                resetDetailRoute();
              }}
            />
          ))}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function renderScreen(
  mainTab: MainTab,
  homeTab: HomeTab,
  setHomeTab: (tab: HomeTab) => void,
  detailRoute: DetailRoute,
  setDetailRoute: (route: DetailRoute) => void,
  onBack: () => void,
  authConfigured = false,
  userId: string | null = null
) {
  if (detailRoute.type === "listing") {
    return (
      <ListingDetailScreen
        authConfigured={authConfigured}
        listingId={detailRoute.listingId}
        onBack={onBack}
        onOpenConversation={(conversation, initialMessages, title) =>
          setDetailRoute({ type: "conversation", conversation, initialMessages, title })
        }
        userId={userId}
      />
    );
  }
  if (detailRoute.type === "hub") {
    return <HubDetailScreen hubId={detailRoute.hubId} onBack={onBack} />;
  }
  if (detailRoute.type === "hubApply") {
    const isDemoMode = !authConfigured || !userId || userId === "demo-user";
    return (
      <HubApplyScreen
        ownerId={isDemoMode ? currentUserId : userId ?? currentUserId}
        onBack={onBack}
        persist={!isDemoMode}
      />
    );
  }
  if (detailRoute.type === "conversation") {
    const isDemoMode = !authConfigured || !userId || userId === "demo-user";
    return (
      <ConversationScreen
        conversation={detailRoute.conversation}
        currentUserId={isDemoMode ? currentUserId : userId ?? currentUserId}
        initialMessages={detailRoute.initialMessages}
        onBack={onBack}
        persist={!isDemoMode}
        title={detailRoute.title}
      />
    );
  }
  if (mainTab === "home") {
    return (
      <HomeScreen
        activeTab={homeTab}
        onChangeTab={setHomeTab}
        onOpenListing={(listingId) => setDetailRoute({ type: "listing", listingId })}
        onOpenHub={(hubId) => setDetailRoute({ type: "hub", hubId })}
      />
    );
  }
  if (mainTab === "publish") {
    return <PublishScreen authConfigured={authConfigured} userId={userId} />;
  }
  if (mainTab === "messages") {
    return (
      <MessagesScreen
        authConfigured={authConfigured}
        onOpenConversation={(conversation, initialMessages, title) =>
          setDetailRoute({ type: "conversation", conversation, initialMessages, title })
        }
        userId={userId}
      />
    );
  }
  if (mainTab === "profile") {
    return <ProfileScreen onOpenHubApply={() => setDetailRoute({ type: "hubApply" })} />;
  }

  return (
    <Section>
      <Text style={styles.title}>地图</Text>
      <Text style={styles.body}>展示上海周边商品和据点的地图视图。</Text>
    </Section>
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
  error: {
    color: colors.coral,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.md
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
