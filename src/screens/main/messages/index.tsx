import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import { Avatar, Button, Card, Divider, EmptyState, Input, Loading, ScreenContainer, ThemedText } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFetch } from '@/hooks/use-fetch';
import { routes } from '@/navigation/routes';
import { adminService, type AuditLog, type AuditLogCategory, type AuditLogsPage } from '@/services/admin';
import { chatService, subscribeConversationChanges } from '@/services/chat';
import { campaignsService } from '@/services/campaigns';
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

const auditFilters: { key: AuditLogCategory; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'login', label: 'Login' },
  { key: 'institutions', label: 'Instituições' },
  { key: 'users', label: 'Usuários' },
];

function getAuditActorLabel(item: AuditLog) {
  const actor = item.metadata?.actorEmail ?? item.metadata?.email ?? item.metadata?.userEmail;

  if (typeof actor === 'string' && actor.trim()) {
    return actor;
  }

  if (item.action.startsWith('auth.')) return 'user';
  if (item.targetType?.toLowerCase().includes('institution')) return 'instituição';
  if (item.targetType?.toLowerCase().includes('user')) return 'user';
  return item.targetType?.toLowerCase() || 'admin';
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function MessagesScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const router = useRouter();
  const authToken = useAppStore((state) => state.authToken);
  const activeRole = useActiveRole();
  const [search, setSearch] = useState('');
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [creatingConversationId, setCreatingConversationId] = useState<string | null>(null);
  const [createConversationError, setCreateConversationError] = useState('');
  const [auditCategory, setAuditCategory] = useState<AuditLogCategory>('all');
  const [auditPage, setAuditPage] = useState(1);

  const fetcher = useCallback(() => {
    if (activeRole === 'platform-admin') return Promise.resolve([]);
    return chatService.listConversations(authToken);
  }, [activeRole, authToken]);
  const { data: conversations, loading, error, refetch } = useFetch(fetcher);
  const institutions = useFetch(
    useCallback(() => {
      if (activeRole === 'platform-admin') return Promise.resolve([]);
      return campaignsService.listInstitutions();
    }, [activeRole])
  );
  const auditLogs = useFetch(
    useCallback(() => {
      if (activeRole !== 'platform-admin') return Promise.resolve(null);
      return adminService.listAuditLogsPage(authToken, {
        category: auditCategory,
        limit: 30,
        page: auditPage,
        search,
      });
    }, [activeRole, auditCategory, auditPage, authToken, search])
  );

  useEffect(() => {
    setAuditPage(1);
  }, [auditCategory, search]);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch])
  );

  useEffect(() => subscribeConversationChanges(() => {
    void refetch();
  }), [refetch]);

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    const items = conversations ?? [];

    if (!query) return items;

    return items.filter((item) =>
      [item.displayName ?? item.counterpartName ?? item.institutionName, item.institutionName, item.lastMessage]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(query)),
    );
  }, [conversations, search]);

  const filteredInstitutions = useMemo(() => {
    const query = institutionSearch.trim().toLowerCase();
    const existingInstitutionIds = new Set((conversations ?? []).map((item) => item.institutionId));
    const items = institutions.data ?? [];

    return items
      .filter((item) => !existingInstitutionIds.has(item.id))
      .filter((item) => {
        if (!query) return true;

        return [item.name, item.city, item.state, item.category, item.description]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(query));
      });
  }, [conversations, institutionSearch, institutions.data]);

  async function handleCreateConversation(institutionId: string, institutionName: string) {
    setCreatingConversationId(institutionId);
    setCreateConversationError('');

    try {
      const conversationId = await chatService.ensureConversation(institutionId, institutionName, authToken);
      setNewConversationOpen(false);
      setInstitutionSearch('');
      await refetch();
      router.push(routes.appChat(conversationId));
    } catch (err) {
      setCreateConversationError(err instanceof Error ? err.message : 'Não foi possível iniciar a conversa.');
    } finally {
      setCreatingConversationId(null);
    }
  }

  if (activeRole === 'platform-admin') {
    const logsPage = auditLogs.data as AuditLogsPage | null;
    const logs = logsPage?.items ?? [];
    const todayCount = logsPage?.summary?.todayCount ?? logs.filter((item) => item.createdAt && new Date(item.createdAt).toDateString() === new Date().toDateString()).length;

    return (
      <ScreenContainer scrollable>
        <View style={styles.adminAuditContainer}>
          <View style={styles.adminHeader}>
            <View style={styles.adminHeaderText}>
              <ThemedText variant="caption" color={colors.textMuted}>Bem-vindo(a) de volta 👋</ThemedText>
              <ThemedText variant="title">Auditoria</ThemedText>
              <ThemedText variant="caption" color={colors.textMuted}>
                Histórico recente de ações administrativas.
              </ThemedText>
            </View>
            <Avatar name="Admin" size="md" />
          </View>

          <View style={styles.auditToolbar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {auditFilters.map((item) => {
                const selected = item.key === auditCategory;

                return (
                  <Pressable
                    key={item.key}
                    accessibilityRole="button"
                    onPress={() => setAuditCategory(item.key)}
                    style={[
                      styles.auditChip,
                      {
                        backgroundColor: selected ? colors.primary : colors.surface,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                    ]}>
                    <ThemedText
                      variant="caption"
                      color={selected ? '#FFFFFF' : colors.textMuted}
                      style={selected ? styles.bold : undefined}>
                      {item.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={[styles.auditTodayBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.auditTodayIcon, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary} />
              </View>
              <View>
                <ThemedText variant="caption" color={colors.textMuted}>Total hoje</ThemedText>
                <ThemedText variant="subtitle">{todayCount}</ThemedText>
              </View>
            </View>
          </View>

          <Input
            onChangeText={setSearch}
            placeholder="Buscar evento"
            value={search}
            leftSlot={
              <View style={styles.searchIcon}>
                <Ionicons name="search-outline" size={16} color={colors.icon} />
              </View>
            }
          />

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
            <Card padding="none" style={styles.auditListCard}>
              {logs.map((item, index) => (
                <View key={item.id ?? `${item.action}-${item.createdAt ?? index}`}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push(routes.adminAuditDetail(item.id))}
                    style={styles.auditItem}>
                    <View style={styles.auditIconColumn}>
                      {index > 0 ? <View style={[styles.auditLine, { backgroundColor: colors.border }]} /> : <View style={styles.auditLineSpacer} />}
                      <View style={[styles.auditIcon, { backgroundColor: colors.primarySoft }]}>
                        <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary} />
                      </View>
                      {index < logs.length - 1 ? <View style={[styles.auditLine, { backgroundColor: colors.border }]} /> : <View style={styles.auditLineSpacer} />}
                    </View>
                    <View style={styles.conversationContent}>
                      <ThemedText variant="body" style={styles.bold}>
                        {formatAuditAction(item.action)}
                      </ThemedText>
                      <ThemedText variant="caption" color={colors.textMuted}>
                        {getAuditActorLabel(item)} · {item.createdAt ? formatRelativeTime(item.createdAt) : 'Agora'}
                      </ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.icon} />
                  </Pressable>
                  {index < logs.length - 1 && <Divider />}
                </View>
              ))}
            </Card>
          )}

          {!auditLogs.loading && !auditLogs.error && logsPage ? (
            <View style={styles.paginationRow}>
              <Button
                size="sm"
                variant="ghost"
                disabled={!logsPage.meta.hasPreviousPage}
                onPress={() => setAuditPage((page) => Math.max(1, page - 1))}>
                Anterior
              </Button>
              <ThemedText variant="caption" color={colors.textMuted}>
                Página {logsPage.meta.page} de {logsPage.meta.totalPages}
              </ThemedText>
              <Button
                size="sm"
                variant="ghost"
                disabled={!logsPage.meta.hasNextPage}
                onPress={() => setAuditPage((page) => page + 1)}>
                Próxima
              </Button>
            </View>
          ) : null}
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <ThemedText variant="title">Conversas</ThemedText>
          <Pressable
            style={styles.iconButton}
            accessibilityLabel="Nova conversa"
            onPress={() => {
              setCreateConversationError('');
              setNewConversationOpen(true);
            }}>
            <Ionicons name="add" size={22} color={colors.primary} />
          </Pressable>
        </View>

        <Input
          onChangeText={setSearch}
          placeholder="Buscar conversas"
          value={search}
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

        {!loading && !error && conversations && conversations.length > 0 && filteredConversations.length === 0 && (
          <EmptyState
            title="Nenhuma conversa encontrada"
            description="Tente buscar pelo nome da instituição ou pelo conteúdo da última mensagem."
            illustration={
              <Ionicons name="search-outline" size={56} color={colors.border} />
            }
          />
        )}

        {!loading && !error && filteredConversations.length > 0 && (
          <View>
            {filteredConversations.map((item, index) => (
              <Pressable
                key={item.id}
                onPress={() => router.push(routes.appChat(item.id))}>
                <View style={styles.conversationItem}>
                  <Avatar name={item.displayName ?? item.counterpartName ?? item.institutionName} size="md" />
                  <View style={styles.conversationContent}>
                    <View style={styles.conversationHeader}>
                      <ThemedText variant="body" style={styles.bold}>
                        {item.displayName ?? item.counterpartName ?? item.institutionName}
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
                {index < filteredConversations.length - 1 && <Divider />}
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <Modal
        transparent
        animationType="slide"
        visible={newConversationOpen}
        onRequestClose={() => setNewConversationOpen(false)}>
        <Pressable
          style={styles.bottomSheetBackdrop}
          onPress={() => setNewConversationOpen(false)}>
          <Pressable
            style={[styles.bottomSheet, { backgroundColor: colors.surface }]}
            onPress={(event) => event.stopPropagation()}>
            <View style={[styles.bottomSheetHandle, { backgroundColor: colors.border }]} />
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleBlock}>
                <ThemedText variant="subtitle">Nova conversa</ThemedText>
                <ThemedText variant="caption" color={colors.textMuted}>
                  Escolha uma instituição para iniciar o atendimento.
                </ThemedText>
              </View>
              <Pressable
                accessibilityLabel="Fechar nova conversa"
                style={styles.closeButton}
                onPress={() => setNewConversationOpen(false)}>
                <Ionicons name="close" size={20} color={colors.icon} />
              </Pressable>
            </View>

            <Input
              onChangeText={setInstitutionSearch}
              placeholder="Buscar instituição"
              value={institutionSearch}
              leftSlot={
                <View style={styles.searchIcon}>
                  <Ionicons name="search-outline" size={16} color={colors.icon} />
                </View>
              }
            />

            {createConversationError ? (
              <ThemedText variant="caption" color={colors.danger}>
                {createConversationError}
              </ThemedText>
            ) : null}

            {institutions.loading ? <Loading label="Carregando instituições..." /> : null}
            {institutions.error ? (
              <EmptyState
                title="Não foi possível carregar"
                description={institutions.error}
                illustration={<Ionicons name="cloud-offline-outline" size={48} color={colors.border} />}
                action={<Button variant="secondary" onPress={institutions.refetch}>Tentar novamente</Button>}
              />
            ) : null}

            {!institutions.loading && !institutions.error && filteredInstitutions.length === 0 ? (
              <EmptyState
                title="Nenhuma instituição disponível"
                description="Não encontramos novas instituições para iniciar conversa."
                illustration={<Ionicons name="business-outline" size={48} color={colors.border} />}
              />
            ) : null}

            {!institutions.loading && !institutions.error && filteredInstitutions.length > 0 ? (
              <ScrollView contentContainerStyle={styles.institutionList}>
                {filteredInstitutions.map((item) => (
                  <Pressable
                    key={item.id}
                    disabled={creatingConversationId === item.id}
                    onPress={() => handleCreateConversation(item.id, item.name)}
                    style={({ pressed }) => [
                      styles.institutionOption,
                      {
                        backgroundColor: pressed ? colors.primarySoft : colors.surface,
                        borderColor: colors.border,
                      },
                    ]}>
                    <Avatar name={item.name} size="md" />
                    <View style={styles.institutionOptionText}>
                      <ThemedText variant="body" style={styles.bold} numberOfLines={1}>
                        {item.name}
                      </ThemedText>
                      <ThemedText variant="caption" color={colors.textMuted} numberOfLines={1}>
                        {item.city}, {item.state} · {item.category}
                      </ThemedText>
                    </View>
                    {creatingConversationId === item.id ? (
                      <Loading size="small" style={styles.inlineLoading} />
                    ) : (
                      <Ionicons name="chevron-forward" size={18} color={colors.icon} />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}
