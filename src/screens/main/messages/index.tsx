import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, View } from 'react-native';

import { Avatar, Button, Divider, EmptyState, Loading, ScreenContainer, ThemedText } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFetch } from '@/hooks/use-fetch';
import { routes } from '@/navigation/routes';
import { chatService } from '@/services/chat';
import { theme } from '@/theme';

import { styles } from './styles';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  if (date.toDateString() === yesterday.toDateString()) return 'Ontem';
  return date.toLocaleDateString('pt-BR', { weekday: 'short' });
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function MessagesScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const router = useRouter();

  const fetcher = useCallback(() => chatService.listConversations(), []);
  const { data: conversations, loading, error, refetch } = useFetch(fetcher);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch])
  );

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <ThemedText variant="title">Chat</ThemedText>

        {loading && <Loading label="Carregando conversas..." />}

        {error && (
          <EmptyState
            title="Não foi possível carregar"
            description={error}
            illustration={<Ionicons name="cloud-offline-outline" size={56} color={colors.border} />}
            action={<Button variant="secondary" onPress={refetch}>Tentar novamente</Button>}
          />
        )}

        {!loading && !error && (!conversations || conversations.length === 0) && (
          <EmptyState
            title="Nenhuma conversa ainda"
            description="Suas trocas de mensagens com instituições aparecerão aqui."
            illustration={
              <Ionicons name="chatbubbles-outline" size={56} color={colors.border} />
            }
          />
        )}

        {!loading && !error && conversations && conversations.length > 0 && (
          <View>
            {conversations.map((item, index) => (
              <Pressable
                key={item.id}
                onPress={() => router.push(routes.appChat(item.id))}>
                <View style={styles.conversationItem}>
                  <Avatar name={item.institutionName} size="md" />
                  <View style={styles.conversationContent}>
                    <View style={styles.conversationHeader}>
                      <ThemedText variant="body" style={styles.bold}>
                        {item.institutionName}
                      </ThemedText>
                      <ThemedText variant="caption" color={colors.textMuted}>
                        {formatRelativeTime(item.lastMessageAt)}
                      </ThemedText>
                    </View>
                    <View style={styles.conversationFooter}>
                      <ThemedText
                        variant="caption"
                        color={item.unreadCount > 0 ? colors.text : colors.textMuted}
                        style={[styles.preview, item.unreadCount > 0 && styles.bold]}
                        numberOfLines={1}>
                        {item.lastMessage}
                      </ThemedText>
                      {item.unreadCount > 0 && (
                        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                          <ThemedText
                            variant="caption"
                            color={colors.surface}
                            style={styles.badgeText}>
                            {item.unreadCount}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                {index < conversations.length - 1 && <Divider />}
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
