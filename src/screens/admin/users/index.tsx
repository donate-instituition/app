import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  Avatar,
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
  type AdminUser,
  type AdminUserRole,
  type PaginatedResponse,
} from '@/services/admin';
import { useAppStore } from '@/store';
import { theme } from '@/theme';

import { styles } from './styles';

export function AdminUsersScreen() {
  const authToken = useAppStore((state) => state.authToken);
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<AdminUserRole | null>(null);

  const fetcher = useCallback(async (): Promise<PaginatedResponse<AdminUser>> => {
    return adminService.listUsers(authToken, {
      search: search.trim() || undefined,
      role: roleFilter || undefined,
      page: 1,
      limit: 100,
    });
  }, [authToken, search, roleFilter]);

  const { data, loading, error, refetch } = useFetch(fetcher);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch])
  );

  const users = data?.data ?? [];
  const donors = users.filter((u) =>
    u.roles.some((r) => r.name === 'DONOR')
  ).length;
  const institutions = users.filter((u) =>
    u.roles.some((r) => r.name === 'INSTITUTION_STAFF')
  ).length;

  function getRoleBadge(user: AdminUser) {
    const role = user.roles[0]?.name;
    if (role === 'PLATFORM_ADMIN') {
      return <Tag label="Admin" variant="info" />;
    }
    if (role === 'INSTITUTION_STAFF') {
      return <Tag label="Instituição" variant="info" />;
    }
    return <Tag label="Doador" variant="success" />;
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText variant="title">Usuários</ThemedText>
          <ThemedText variant="caption" color={colors.textMuted}>
            Gestão de contas da plataforma.
          </ThemedText>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard} variant="elevated">
            <View style={styles.statIcon}>
              <Ionicons name="people-outline" size={24} color={colors.primary} />
            </View>
            <ThemedText variant="title">{users.length}</ThemedText>
            <ThemedText variant="caption" color={colors.textMuted}>
              Usuários
            </ThemedText>
          </Card>
          <Card style={styles.statCard} variant="elevated">
            <View style={styles.statIcon}>
              <Ionicons name="business-outline" size={24} color={colors.primary} />
            </View>
            <ThemedText variant="title">{institutions}</ThemedText>
            <ThemedText variant="caption" color={colors.textMuted}>
              Equipe instituições
            </ThemedText>
          </Card>
        </View>

        {/* Search */}
        <View style={styles.section}>
          <ThemedText variant="subtitle">Usuários da plataforma</ThemedText>
          <ThemedText variant="caption" color={colors.textMuted}>
            {donors} doadores • {institutions} usuários institucionais
          </ThemedText>

          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <Ionicons
                name="search-outline"
                size={20}
                color={colors.textMuted}
              />
              <Input
                placeholder="Buscar usuário"
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
            </View>
            <Pressable
              style={[styles.filterButton, { backgroundColor: colors.surface }]}>
              <Ionicons name="options-outline" size={20} color={colors.text} />
            </Pressable>
          </View>
        </View>

        {loading && <Loading label="Carregando usuários..." />}

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

        {!loading && !error && users.length === 0 && (
          <EmptyState
            title="Nenhum usuário encontrado"
            description="Ajuste os filtros ou tente outra busca."
            illustration={
              <Ionicons name="people-outline" size={56} color={colors.border} />
            }
          />
        )}

        {!loading && !error && users.length > 0 && (
          <View style={styles.list}>
            {users.map((user) => (
              <Card key={user._id || user.id} variant="outlined">
                <View style={styles.userCard}>
                  <Avatar name={user.fullName} size="md" />
                  <View style={styles.userContent}>
                    <View style={styles.userHeader}>
                      <ThemedText
                        variant="body"
                        style={styles.bold}
                        numberOfLines={1}>
                        {user.fullName}
                      </ThemedText>
                      {getRoleBadge(user)}
                    </View>
                    <ThemedText variant="caption" color={colors.textMuted}>
                      {user.email}
                    </ThemedText>
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
