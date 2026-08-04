import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Pressable, View } from 'react-native';

import { Avatar, Button, Divider, EmptyState, Input, Loading, ScreenContainer, ThemedText } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFetch } from '@/hooks/use-fetch';
import { routes } from '@/navigation/routes';
import { adminService, type AuditLog } from '@/services/admin';
import { chatService, subscribeConversationChanges } from '@/services/chat';
import { useActiveRole, useAppStore } from '@/store';
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

function formatAuditAction(action: string) {
  const labels: Record<string, string> = {
    'institution.approve': 'Instituição aprovada',
    'institution.reject': 'Instituição rejeitada',
  };

  return labels[action] ?? action;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function MessagesScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const router = useRouter();
  const authToken = useAppStore((state) => state.authToken);
  const activeRole = useActiveRole();

  const fetcher = useCallback(() => {
    if (activeRole === 'platform-admin') return Promise.resolve([]);
    return chatService.listConversations(authToken);
  }, [activeRole, authToken]);
  const { data: conversations, loading, error, refetch } = useFetch(fetcher);
  const auditLogs = useFetch(
    useCallback(() => {
      if (activeRole !== 'platform-admin') return Promise.resolve([]);
      return adminService.listAuditLogs(authToken);
    }, [activeRole, authToken])
  );

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch])
  );

  useEffect(() => subscribeConversationChanges(() => {
    void refetch();
  }), [refetch]);

  if (activeRole === 'platform-admin') {
    const logs = (auditLogs.data ?? []) as AuditLog[];

    return (
      <ScreenContainer scrollable>
        <View style={styles.container}>
          <ThemedText variant="title">Auditoria</ThemedText>
          <ThemedText variant="body" color={colors.textMuted}>
            Histórico recente de ações administrativas.
          </ThemedText>

          {auditLogs.loading && <Loading label="Carregando auditoria..." />}

          {auditLogs.error && (
            <EmptyState
              title="Não foi possível carregar"
              description={auditLogs.error}
              illustration={<Ionicons name="cloud-offline-outline" size={56} color={colors.border} />}
              action={<Button variant="secondary" onPress={auditLogs.refetch}>Tentar novamente</Button>}
            />
          )}

          {!auditLogs.loading && !auditLogs.error && logs.length === 0 && (
            <EmptyState
              title="Nenhum evento ainda"
              description="Ações administrativas aparecerão aqui."
              illustration={<Ionicons name="shield-outline" size={56} color={colors.border} />}
            />
          )}

          {!auditLogs.loading && !auditLogs.error && logs.length > 0 && (
            <View>
              {logs.map((item, index) => (
                <View key={item.id}>
                  <View style={styles.conversationItem}>
                    <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
                      <Ionicons name="shield-checkmark-outline" size={14} color={colors.primary} />
                    </View>
                    <View style={styles.conversationContent}>
                      <ThemedText variant="body" style={styles.bold}>
                        {formatAuditAction(item.action)}
                      </ThemedText>
                      <ThemedText variant="caption" color={colors.textMuted}>
                        {item.targetType} · {item.createdAt ? formatRelativeTime(item.createdAt) : 'Agora'}
                      </ThemedText>
                    </View>
                  </View>
                  {index < logs.length - 1 && <Divider />}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <ThemedText variant="title">Conversas</ThemedText>
          <Pressable style={styles.iconButton} accessibilityLabel="Nova conversa">
            <Ionicons name="add" size={22} color={colors.primary} />
          </Pressable>
        </View>

        <Input
          editable={false}
          placeholder="Buscar campanhas"
          leftSlot={
            <View style={styles.searchIcon}>
              <Ionicons name="search-outline" size={16} color={colors.icon} />
            </View>
          }
        />

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
                      {item.unreadCount === 0 ? (
                        <Ionicons name="checkmark-done" size={14} color={colors.primary} />
                      ) : null}
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
