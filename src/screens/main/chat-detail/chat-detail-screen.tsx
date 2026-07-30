import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, ThemedText } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { chatService, type Conversation, type Message } from '@/services/chat';
import { useAppStore } from '@/store';
import { theme } from '@/theme';

import { styles } from './styles';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Hoje';
  if (date.toDateString() === yesterday.toDateString()) return 'Ontem';
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function sameDay(isoA: string, isoB: string): boolean {
  return new Date(isoA).toDateString() === new Date(isoB).toDateString();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type DateSeparatorProps = { label: string };

function DateSeparator({ label }: DateSeparatorProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  return (
    <View style={styles.dateSeparator}>
      <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
      <ThemedText variant="caption" color={colors.textMuted} style={styles.dateLabel}>
        {label}
      </ThemedText>
      <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
    </View>
  );
}

type TypingIndicatorProps = { name: string };

function TypingIndicator({ name }: TypingIndicatorProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  return (
    <View style={styles.typingRow}>
      <View style={styles.avatarSlot}>
        <Avatar name={name} size="sm" />
      </View>
      <View
        style={[
          styles.typingBubble,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}>
        <View style={[styles.typingDot, { backgroundColor: colors.textMuted }]} />
        <View style={[styles.typingDot, { backgroundColor: colors.textMuted, opacity: 0.7 }]} />
        <View style={[styles.typingDot, { backgroundColor: colors.textMuted, opacity: 0.4 }]} />
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function ChatDetailScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const user = useAppStore((state) => state.user);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);

  const listRef = useRef<FlatList<Message>>(null);

  // Load on mount
  useEffect(() => {
    const conv = chatService.getConversation(conversationId);
    if (conv) setConversation(conv);
    setMessages(chatService.getMessages(conversationId));
    chatService.markAsRead(conversationId);
  }, [conversationId]);

  // Auto-scroll to bottom when messages change
  const scrollToEnd = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  useEffect(() => {
    if (messages.length > 0) scrollToEnd();
  }, [messages.length, scrollToEnd]);

  function handleSend() {
    const text = inputText.trim();
    if (!text || typing) return;

    setInputText('');
    const newMsg = chatService.sendMessage(conversationId, text, user?.id ?? 'me');
    setMessages((prev) => [...prev, newMsg]);

    // Show typing indicator then deliver a reply
    setTyping(true);
    const replyDelay = 1000 + Math.random() * 800;
    setTimeout(() => {
      const reply = chatService.simulateReply(conversationId);
      setTyping(false);
      if (reply) setMessages((prev) => [...prev, reply]);
    }, replyDelay);
  }

  // ─── Render helpers ───────────────────────────────────────────────────────

  function renderMessage({ item, index }: { item: Message; index: number }) {
    const isMe = item.senderId === 'me' || item.senderId === user?.id;
    const prevMsg = messages[index - 1];
    const nextMsg = messages[index + 1];

    const showDate = !prevMsg || !sameDay(item.createdAt, prevMsg.createdAt);
    // Only show the avatar at the bottom of a cluster of messages from the same sender
    const showAvatar =
      !isMe &&
      (!nextMsg || nextMsg.senderId !== item.senderId || !sameDay(item.createdAt, nextMsg.createdAt));

    return (
      <View>
        {showDate && <DateSeparator label={formatDateLabel(item.createdAt)} />}

        <View style={[styles.messageRow, isMe && styles.messageRowReverse]}>
          {/* Avatar placeholder (left side only) */}
          {!isMe && (
            <View style={styles.avatarSlot}>
              {showAvatar ? (
                <Avatar name={conversation?.institutionName} size="sm" />
              ) : (
                <View style={{ width: 32 }} />
              )}
            </View>
          )}

          {/* Bubble */}
          <View
            style={[
              styles.bubble,
              isMe
                ? [styles.bubbleMe, { backgroundColor: colors.primary }]
                : [
                    styles.bubbleThem,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ],
            ]}>
            <ThemedText
              variant="body"
              color={isMe ? colors.surface : colors.text}
              style={styles.bubbleText}>
              {item.content}
            </ThemedText>
            <ThemedText
              variant="caption"
              color={isMe ? 'rgba(255,255,255,0.65)' : colors.textMuted}
              style={styles.timestamp}>
              {formatTime(item.createdAt)}
            </ThemedText>
          </View>
        </View>
      </View>
    );
  }

  // ─── JSX ─────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 56 : 0}>

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Avatar name={conversation?.institutionName} size="sm" />
          <ThemedText variant="subtitle" numberOfLines={1} style={styles.headerName}>
            {conversation?.institutionName ?? '…'}
          </ThemedText>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      {/* Message list */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onLayout={scrollToEnd}
        ListFooterComponent={
          typing ? (
            <TypingIndicator name={conversation?.institutionName ?? ''} />
          ) : null
        }
      />

      {/* Input bar */}
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surfaceMuted,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Mensagem..."
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={500}
          returnKeyType="default"
          blurOnSubmit={false}
        />
        <Pressable
          onPress={handleSend}
          disabled={!inputText.trim() || typing}
          style={[
            styles.sendButton,
            {
              backgroundColor:
                inputText.trim() && !typing ? colors.primary : colors.border,
            },
          ]}>
          <Ionicons name="send" size={16} color={colors.surface} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
