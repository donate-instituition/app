import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, View } from 'react-native';

import {
  Avatar,
  Button,
  Card,
  EmptyState,
  Loading,
  ScreenContainer,
  Tag,
  ThemedText,
} from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFetch } from '@/hooks/use-fetch';
import { routes } from '@/navigation/routes';
import { adminService, type AdminDashboardStats } from '@/services/admin';
import { useAppStore } from '@/store';
import { theme } from '@/theme';

import { styles } from './styles';

export function AdminDashboardScreen() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const authToken = useAppStore((state) => state.authToken);
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  const fetcher = useCallback(async (): Promise<AdminDashboardStats> => {
    return adminService.getDashboardStats(authToken);
  }, [authToken]);

  const { data, loading, error, refetch } = useFetch(fetcher);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch])
  );

  const firstName = user?.name?.split(' ')[0] ?? 'Admin';
  const stats = data ?? {
    pendingInstitutions: 0,
    activeCampaigns: 0,
    activeUsers30d: 0,
    actionsToday: 0,
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <ThemedText variant="body" color={colors.textMuted}>
                Bem-vindo de volta 👋
              </ThemedText>
              <ThemedText variant="title">{firstName}</ThemedText>
            </View>
            <Avatar name={user?.name} size="md" />
          </View>
        </View>

        {loading && <Loading label="Carregando dashboard..." />}

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

        {!loading && !error && (
          <>
            {/* Pending Institutions Alert */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText variant="subtitle">
                  Instituições em análise
                </ThemedText>
                <Tag label={String(stats.pendingInstitutions)} variant="warning" />
              </View>

              {stats.pendingInstitutions === 0 ? (
                <Card variant="elevated">
                  <View style={styles.emptyCard}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={40}
                      color={colors.border}
                    />
                    <ThemedText variant="body" style={styles.bold}>
                      Sem cadastros pendentes
                    </ThemedText>
                    <ThemedText variant="caption" color={colors.textMuted}>
                      Novas instituições aparecerão aqui assim que necessitarem de
                      revisão.
                    </ThemedText>
                  </View>
                </Card>
              ) : null}
            </View>

            {/* Stats Grid */}
            <View style={styles.section}>
              <View style={styles.grid}>
                <Pressable onPress={() => router.push(routes.adminInstitutions)}>
                  <Card style={styles.statCard} variant="elevated">
                    <View style={styles.statIconContainer}>
                      <Ionicons
                        name="business-outline"
                        size={24}
                        color={colors.primary}
                      />
                    </View>
                    <ThemedText variant="caption" color={colors.textMuted}>
                      Instituições pendentes
                    </ThemedText>
                    <ThemedText variant="title">
                      {stats.pendingInstitutions}
                    </ThemedText>
                    <ThemedText variant="caption" color={colors.textMuted}>
                      Aguardando revisão
                    </ThemedText>
                  </Card>
                </Pressable>

                <Card style={styles.statCard} variant="elevated">
                  <View style={styles.statIconContainer}>
                    <Ionicons
                      name="megaphone-outline"
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <ThemedText variant="caption" color={colors.textMuted}>
                    Campanhas na plataforma
                  </ThemedText>
                  <ThemedText variant="title">{stats.activeCampaigns}</ThemedText>
                  <ThemedText variant="caption" color={colors.textMuted}>
                    Ativas e publicadas
                  </ThemedText>
                </Card>

                <Card style={styles.statCard} variant="elevated">
                  <View style={styles.statIconContainer}>
                    <Ionicons
                      name="people-outline"
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <ThemedText variant="caption" color={colors.textMuted}>
                    Usuários ativos
                  </ThemedText>
                  <ThemedText variant="title">{stats.activeUsers30d}</ThemedText>
                  <ThemedText variant="caption" color={colors.textMuted}>
                    Últimos 30 dias
                  </ThemedText>
                </Card>

                <Card style={styles.statCard} variant="elevated">
                  <View style={styles.statIconContainer}>
                    <Ionicons
                      name="shield-outline"
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <ThemedText variant="caption" color={colors.textMuted}>
                    Ações hoje
                  </ThemedText>
                  <ThemedText variant="title">{stats.actionsToday}</ThemedText>
                  <ThemedText variant="caption" color={colors.textMuted}>
                    Logins e eventos
                  </ThemedText>
                </Card>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <ThemedText variant="subtitle">Ações rápidas</ThemedText>
              <View style={styles.quickActions}>
                <Pressable
                  style={[styles.quickAction, { backgroundColor: colors.surface }]}
                  onPress={() => router.push(routes.adminInstitutions)}>
                  <Ionicons
                    name="business-outline"
                    size={24}
                    color={colors.primary}
                  />
                  <ThemedText variant="body">Revisar instituições</ThemedText>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.textMuted}
                  />
                </Pressable>

                <Pressable
                  style={[styles.quickAction, { backgroundColor: colors.surface }]}
                  onPress={() => router.push(routes.adminUsers)}>
                  <Ionicons
                    name="people-outline"
                    size={24}
                    color={colors.primary}
                  />
                  <ThemedText variant="body">Usuários</ThemedText>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.textMuted}
                  />
                </Pressable>

                <Pressable
                  style={[styles.quickAction, { backgroundColor: colors.surface }]}
                  onPress={() => router.push(routes.adminAudit)}>
                  <Ionicons
                    name="shield-outline"
                    size={24}
                    color={colors.primary}
                  />
                  <ThemedText variant="body">Auditoria</ThemedText>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.textMuted}
                  />
                </Pressable>
              </View>
            </View>
          </>
        )}
      </View>
    </ScreenContainer>
  );
}
