import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  Button,
  Card,
  EmptyState,
  Input,
  Loading,
  ScreenContainer,
  Tag,
  ThemedText,
} from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFetch } from '@/hooks/use-fetch';
import {
  adminService,
  type AuditLog,
  type PaginatedResponse,
} from '@/services/admin';
import { useAppStore } from '@/store';
import { theme } from '@/theme';

import { styles } from './styles';

type AuditCategory = 'all' | 'login' | 'institutions' | 'users';

function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return 'agora';
  if (minutes < 60) return `${minutes}min`;
  if (hours < 24) return `${hours}h`;

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'institution.approve': 'Instituição aprovada',
    'institution.reject': 'Instituição rejeitada',
    'institution.created': 'Instituição criada',
    'institution.updated': 'Instituição atualizada',
    'user.created': 'Usuário criado',
    'user.updated': 'Usuário atualizado',
    'user.deleted': 'Usuário deletado',
    'campaign.created': 'Campanha criada',
  };
  return labels[action] || action;
}

function getActorLabel(log: AuditLog): string {
  if (!log.actorUserId) return 'Sistema';
  if (log.action.startsWith('auth.')) return 'user';
  if (log.action.startsWith('institution.')) return 'admin';
  return 'user';
}

export function AdminAuditScreen() {
  const authToken = useAppStore((state) => state.authToken);
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<AuditCategory>('all');

  const fetcher = useCallback(async (): Promise<PaginatedResponse<AuditLog>> => {
    return adminService.listAuditLogs(authToken, {
      category,
      search: search.trim() || undefined,
      page: 1,
      limit: 100,
    });
  }, [authToken, category, search]);

  const { data, loading, error, refetch } = useFetch(fetcher);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch])
  );

  const logs = data?.data ?? [];
  const todayLogs = logs.filter((log) => {
    if (!log.createdAt) return false;
    const logDate = new Date(log.createdAt);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  }).length;

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <ThemedText variant="title">Auditoria</ThemedText>
            <View style={styles.todayBadge}>
              <Ionicons name="shield-outline" size={16} color={colors.primary} />
              <ThemedText variant="caption" color={colors.primary}>
                Total hoje
              </ThemedText>
              <ThemedText variant="body" style={styles.bold}>
                {todayLogs}
              </ThemedText>
            </View>
          </View>
          <ThemedText variant="caption" color={colors.textMuted}>
            Histórico recente de ações administrativas.
          </ThemedText>
        </View>

        {/* Filters */}
        <View style={styles.controls}>
          <View style={styles.tabs}>
            <Pressable
              style={[
                styles.tab,
                category === 'all' && styles.tabActive,
                category === 'all' && { borderBottomColor: colors.primary },
              ]}
              onPress={() => setCategory('all')}>
              <ThemedText
                variant="body"
                color={category === 'all' ? colors.primary : colors.textMuted}>
                Todos
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.tab,
                category === 'login' && styles.tabActive,
                category === 'login' && { borderBottomColor: colors.primary },
              ]}
              onPress={() => setCategory('login')}>
              <ThemedText
                variant="body"
                color={category === 'login' ? colors.primary : colors.textMuted}>
                Login
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.tab,
                category === 'institutions' && styles.tabActive,
                category === 'institutions' && {
                  borderBottomColor: colors.primary,
                },
              ]}
              onPress={() => setCategory('institutions')}>
              <ThemedText
                variant="body"
                color={
                  category === 'institutions' ? colors.primary : colors.textMuted
                }>
                Instituições
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.tab,
                category === 'users' && styles.tabActive,
                category === 'users' && { borderBottomColor: colors.primary },
              ]}
              onPress={() => setCategory('users')}>
              <ThemedText
                variant="body"
                color={category === 'users' ? colors.primary : colors.textMuted}>
                Usuários
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <Ionicons
                name="search-outline"
                size={20}
                color={colors.textMuted}
              />
              <Input
                placeholder="Buscar evento"
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
            </View>
          </View>
        </View>

        {loading && <Loading label="Carregando auditoria..." />}

        {error && (
          <EmptyState
            title="Não foi possível carregar"
            description={error}
            illustration={
              <Ionicons
                name="cloud-offline-outline"
                size={56}
                color={colors.border}
              />
            }
            action={
              <Button variant="secondary" onPress={refetch}>
                Tentar novamente
              </Button>
            }
          />
        )}

        {!loading && !error && logs.length === 0 && (
          <EmptyState
            title="Nenhum evento encontrado"
            description="Ajuste os filtros ou tente outra busca."
            illustration={
              <Ionicons name="shield-outline" size={56} color={colors.border} />
            }
          />
        )}

        {!loading && !error && logs.length > 0 && (
          <View style={styles.list}>
            {logs.map((log) => (
              <Card key={log.id} variant="outlined">
                <View style={styles.logCard}>
                  <View style={styles.logIcon}>
                    <Ionicons
                      name="shield-outline"
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.logContent}>
                    <View style={styles.logHeader}>
                      <ThemedText variant="body" style={styles.bold}>
                        {getActionLabel(log.action)}
                      </ThemedText>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={colors.textMuted}
                      />
                    </View>
                    <View style={styles.logInfo}>
                      <ThemedText variant="caption" color={colors.textMuted}>
                        {getActorLabel(log)}
                      </ThemedText>
                      <ThemedText variant="caption" color={colors.textMuted}>
                        •
                      </ThemedText>
                      <ThemedText variant="caption" color={colors.textMuted}>
                        {log.createdAt ? formatDate(log.createdAt) : 'N/A'}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
