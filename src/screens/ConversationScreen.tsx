import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import {
  fetchMessages,
  sendTextMessage,
  sortMessagesAscending,
  subscribeToConversationMessages,
  type ConversationRecord,
  type MessageRecord
} from "../services/messageRepository";
import { PrimaryButton, Section } from "../ui/components";
import { colors, spacing } from "../ui/theme";

interface ConversationScreenProps {
  conversation: ConversationRecord;
  currentUserId: string;
  initialMessages?: MessageRecord[];
  persist?: boolean;
  title: string;
  onBack: () => void;
}

export function ConversationScreen({
  conversation,
  currentUserId,
  initialMessages = [],
  persist = false,
  title,
  onBack
}: ConversationScreenProps) {
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(persist);
  const [messages, setMessages] = useState<MessageRecord[]>(() => sortMessagesAscending(initialMessages));

  useEffect(() => {
    if (!persist) {
      return undefined;
    }

    let mounted = true;
    setLoading(true);
    fetchMessages(conversation.id)
      .then((nextMessages) => {
        if (mounted) {
          setMessages(nextMessages);
        }
      })
      .catch((fetchError: unknown) => {
        if (mounted) {
          setError(fetchError instanceof Error ? fetchError.message : "消息读取失败");
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    const subscription = subscribeToConversationMessages(conversation.id, (message) => {
      setMessages((currentMessages) => sortMessagesAscending([...currentMessages, message]));
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [conversation.id, persist]);

  const sortedMessages = useMemo(() => sortMessagesAscending(messages), [messages]);

  const handleSend = async () => {
    setError("");
    try {
      const message = await sendTextMessage({
        body,
        conversationId: conversation.id,
        persist,
        senderId: currentUserId
      });
      setMessages((currentMessages) => sortMessagesAscending([...currentMessages, message]));
      setBody("");
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "消息发送失败，请稍后重试");
    }
  };

  return (
    <>
      <PrimaryButton label="返回" onPress={onBack} />
      <Section>
        <Text style={styles.title}>私聊</Text>
        <Text style={styles.meta}>{title}</Text>
        {loading ? <Text style={styles.meta}>正在读取消息</Text> : null}
        {!loading && sortedMessages.length === 0 ? <Text style={styles.meta}>还没有消息</Text> : null}
        {sortedMessages.map((message) => (
          <View
            key={message.id}
            style={[styles.bubble, message.senderId === currentUserId ? styles.ownBubble : styles.otherBubble]}
          >
            <Text style={styles.body}>{message.body}</Text>
          </View>
        ))}
        <TextInput
          accessibilityLabel="输入消息"
          style={styles.input}
          value={body}
          onChangeText={setBody}
          placeholder="输入消息"
        />
        <PrimaryButton label="发送" onPress={handleSend} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </Section>
    </>
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
  bubble: {
    borderRadius: 8,
    marginBottom: spacing.sm,
    padding: spacing.md
  },
  ownBubble: {
    backgroundColor: colors.forest
  },
  otherBubble: {
    backgroundColor: colors.line
  },
  body: {
    color: colors.ink,
    lineHeight: 20
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    color: colors.ink,
    padding: spacing.md,
    marginBottom: spacing.sm,
    marginTop: spacing.md
  },
  error: {
    color: colors.coral,
    marginTop: spacing.sm
  }
});
