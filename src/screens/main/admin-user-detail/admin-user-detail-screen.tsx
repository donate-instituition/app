import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, View } from 'react-native';

import { Avatar, Card, Divider, EmptyState, Loading, ScreenContainer, Tag, ThemedText } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFetch } from '@/hooks/use-fetch';
import { adminService, type AdminUserRole } from '@/services/admin';
import { useAppStore } from '@/store';
import { theme } from '@/theme';

import { styles } from './styles';

function formatCurrency(cents: number) {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

function formatDate(iso?: string) {
  if (!iso) return 'Sem data';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getRoleLabel(role: AdminUserRole) {
  if (role === 'PLATFORM_ADMIN') return 'Admin';
  if (role === 'INSTITUTION_STAFF') return 'Instituição';
  return 'Doador';
}

function getRoleVariant(role: AdminUserRole): 'neutral' | 'success' | 'warning' {
  if (role === 'PLATFORM_ADMIN') return 'warning';
  if (role === 'INSTITUTION_STAFF') return 'success';
  return 'neutral';
}

export function AdminUserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const authToken = useAppStore((state) => state.authToken);

  const fetcher = useCallback(
    () => adminService.getUserDetail(id, authToken),
    [authToken, id],
  );
  const { data, loading, error, refetch } = useFetch(fetcher);

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.container}>
          <View style={styles.backBar}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
          </View>
          <Loading label="Carregando usuário..." />
        </View>
      </ScreenContainer>
    );
  }

  if (error || !data) {
    return (
      <ScreenContainer>
        <View style={styles.container}>
          <View style={styles.backBar}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
          </View>
          <EmptyState
            title="Não foi possível carregar"
            description={error ?? 'Usuário não encontrado.'}
            illustration={<Ionicons name="cloud-offline-outline" size={56} color={colors.border} />}
            action={
              <Pressable onPress={refetch}>
                <ThemedText variant="body" color={colors.primary} style={styles.bold}>
                  Tentar novamente
                </ThemedText>
              </Pressable>
            }
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <View style={styles.backBar}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <ThemedText variant="subtitle" numberOfLines={1} style={styles.backTitle}>
            {data.user.fullName}
          </ThemedText>
          <View style={styles.backButton} />
        </View>

        <Card style={styles.heroCard}>
          <Avatar name={data.user.fullName} size="lg" />
          <View style={styles.heroText}>
            <ThemedText variant="title" numberOfLines={2}>
              {data.user.fullName}
            </ThemedText>
            <ThemedText variant="body" color={colors.textMuted}>
              {data.user.email}
            </ThemedText>
            <View style={styles.roleRow}>
              {data.user.roles.map((role, index) => (
                <Tag
                  key={`${role.name}-${role.grantedAt ?? index}`}
                  label={getRoleLabel(role.name)}
                  variant={getRoleVariant(role.name)}
                />
              ))}
            </View>
          </View>
        </Card>

        <View style={styles.metricsGrid}>
          {[
            {
              icon: 'heart-outline',
              label: 'Total doado',
              value: formatCurrency(data.stats.totalDonatedCents),
            },
            {
              icon: 'receipt-outline',
              label: 'Doações',
              value: String(data.stats.donationsCount),
            },
            {
              icon: 'chatbox-outline',
              label: 'Posts',
              value: String(data.stats.postsCount),
            },
            {
              icon: 'shield-checkmark-outline',
              label: 'Auditoria',
              value: String(data.stats.auditLogsCount),
            },
          ].map((metric) => (
            <Card key={metric.label} style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name={metric.icon as keyof typeof Ionicons.glyphMap} size={22} color={colors.primary} />
              </View>
              <ThemedText variant="title">{metric.value}</ThemedText>
              <ThemedText variant="caption" color={colors.textMuted}>
                {metric.label}
              </ThemedText>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText variant="subtitle">Doações recentes</ThemedText>
            <ThemedText variant="caption" color={colors.textMuted}>
              {data.donations.length}
            </ThemedText>
          </View>
          {data.donations.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={36} color={colors.border} />
              <ThemedText variant="body" style={styles.bold}>Nenhuma doação</ThemedText>
            </Card>
          ) : (
            <Card padding="none" style={styles.listCard}>
              {data.donations.map((donation, index) => (
                <View key={donation.id}>
                  <View style={styles.row}>
                    <View style={styles.rowHeader}>
                      <ThemedText variant="body" style={[styles.bold, styles.rowTitle]} numberOfLines={1}>
                        {donation.campaignTitle}
                      </ThemedText>
                      <ThemedText variant="body" color={colors.primary} style={styles.bold}>
                        {donation.amountFormatted}
                      </ThemedText>
                    </View>
                    <ThemedText variant="caption" color={colors.textMuted}>{donation.institutionName}</ThemedText>
                    <ThemedText variant="caption" color={colors.textMuted}>{formatDate(donation.createdAt)}</ThemedText>
                  </View>
                  {index < data.donations.length - 1 ? <Divider /> : null}
                </View>
              ))}
            </Card>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText variant="subtitle">Posts recentes</ThemedText>
          {data.posts.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="chatbox-outline" size={36} color={colors.border} />
              <ThemedText variant="body" style={styles.bold}>Nenhum post</ThemedText>
            </Card>
          ) : (
            <Card padding="none" style={styles.listCard}>
              {data.posts.map((post, index) => (
                <View key={post.id}>
                  <View style={styles.row}>
                    <ThemedText variant="body" numberOfLines={3}>{post.content}</ThemedText>
                    <ThemedText variant="caption" color={colors.textMuted}>
                      {formatDate(post.createdAt)} · {post.stats.likesCount ?? 0} curtidas · {post.stats.commentsCount ?? 0} comentários
                    </ThemedText>
                  </View>
                  {index < data.posts.length - 1 ? <Divider /> : null}
                </View>
              ))}
            </Card>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText variant="subtitle">Auditoria</ThemedText>
          {data.auditLogs.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="shield-outline" size={36} color={colors.border} />
              <ThemedText variant="body" style={styles.bold}>Nenhum evento</ThemedText>
            </Card>
          ) : (
            <Card padding="none" style={styles.listCard}>
              {data.auditLogs.map((log, index) => (
                <View key={log.id}>
                  <View style={styles.row}>
                    <View style={styles.rowHeader}>
                      <ThemedText variant="body" style={[styles.bold, styles.rowTitle]} numberOfLines={1}>
                        {log.action}
                      </ThemedText>
                      <ThemedText variant="caption" color={colors.textMuted}>
                        {formatDate(log.createdAt)}
                      </ThemedText>
                    </View>
                    <ThemedText variant="caption" color={colors.textMuted}>
                      {log.targetType}{log.targetId ? ` · ${log.targetId}` : ''}
                    </ThemedText>
                  </View>
                  {index < data.auditLogs.length - 1 ? <Divider /> : null}
                </View>
              ))}
            </Card>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
