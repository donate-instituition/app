import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Avatar, Button, Card, Divider, EmptyState, Loading, ScreenContainer, Tag, ThemedText } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFetch } from '@/hooks/use-fetch';
import { getHomeRouteForRole, routes } from '@/navigation/routes';
import { getPreferredInitialRole, getSessionRoles, roleLabels, type UserRole } from '@/navigation/session';
import { ApiError } from '@/services/api';
import { authService } from '@/services/auth';
import { donationsService, type Donation } from '@/services/donations';
import { followsService, type Follow } from '@/services/follows';
import { postsService, type FeedPost } from '@/services/posts';
import { useActiveRole, useAppStore } from '@/store';
import { theme } from '@/theme';

import { styles } from './styles';

type MenuItemProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress?: () => void;
};

function MenuItem({ icon, label, onPress }: MenuItemProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  return (
    <Pressable onPress={onPress}>
      <View style={styles.menuItem}>
        <Ionicons name={icon} size={20} color={colors.icon} />
        <ThemedText variant="body" style={styles.menuLabel}>
          {label}
        </ThemedText>
        <Ionicons name="chevron-forward" size={16} color={colors.border} />
      </View>
    </Pressable>
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

type ProfileData = {
  donations: Donation[];
  follows: Follow[];
  posts: FeedPost[];
};

export function ProfileScreen() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const authToken = useAppStore((state) => state.authToken);
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  const fetcher = useCallback(async (): Promise<ProfileData> => {
    const [donations, follows, posts] = await Promise.all([
      donationsService.listMyDonations(authToken),
      followsService.listMyFollows(authToken),
      postsService.listFeed(authToken),
    ]);

    return { donations, follows, posts };
  }, [authToken]);

  const { data, loading, error, refetch } = useFetch(fetcher);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch])
  );

  const ownPosts = data?.posts.filter((post) => post.authorType === 'USER' && post.authorId === user?.id) ?? [];
  const donatedTotalCents = (data?.donations ?? [])
    .filter((donation) => donation.status === 'completed')
    .reduce((total, donation) => total + donation.amountCents, 0);
  const followingCount = data?.follows.length ?? 0;

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <Card style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Configurações"
              onPress={() => router.push(routes.profileSettings)}
              style={[styles.iconButton, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Ionicons name="settings-outline" size={20} color={colors.primaryStrong} />
            </Pressable>
          </View>

          <View style={styles.identity}>
            <Avatar name={user?.name} size="lg" />
            <View style={styles.identityInfo}>
              <ThemedText variant="title" style={styles.name} numberOfLines={2}>
                {user?.name ?? 'Perfil'}
              </ThemedText>
              <ThemedText variant="body" color={colors.textMuted} style={styles.centered} numberOfLines={1}>
                {user?.email}
              </ThemedText>
              <Tag label="Usuario padrao" variant="success" style={styles.identityBadge} />
            </View>
          </View>

          <View style={styles.socialStats}>
            <View style={styles.socialStat}>
              <ThemedText variant="subtitle">{ownPosts.length}</ThemedText>
              <ThemedText variant="caption" color={colors.textMuted}>posts</ThemedText>
            </View>
            <View style={styles.socialStat}>
              <ThemedText variant="subtitle">0</ThemedText>
              <ThemedText variant="caption" color={colors.textMuted}>seguidores</ThemedText>
            </View>
            <View style={styles.socialStat}>
              <ThemedText variant="subtitle">{followingCount}</ThemedText>
              <ThemedText variant="caption" color={colors.textMuted}>seguindo</ThemedText>
            </View>
            <View style={styles.socialStat}>
              <ThemedText variant="subtitle">R$ {(donatedTotalCents / 100).toFixed(0)}</ThemedText>
              <ThemedText variant="caption" color={colors.textMuted}>doados</ThemedText>
            </View>
          </View>

          <View style={styles.profileActions}>
            <Button size="sm" style={styles.profileAction} onPress={() => router.push(routes.profileSupports)}>
              Apoios
            </Button>
            <Button size="sm" variant="secondary" style={styles.profileAction} onPress={() => router.push(routes.profileSettings)}>
              Editar perfil
            </Button>
          </View>
        </Card>

        {loading && <Loading label="Carregando perfil..." />}

        {error && (
          <EmptyState
            title="Não foi possível carregar"
            description={error}
            illustration={<Ionicons name="cloud-offline-outline" size={56} color={colors.border} />}
            action={<Button variant="secondary" size="sm" onPress={refetch}>Tentar novamente</Button>}
          />
        )}

        {!loading && !error ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText variant="subtitle">Postagens</ThemedText>
              <Pressable onPress={() => router.push(routes.donorDashboard)}>
                <ThemedText variant="caption" color={colors.primary}>Criar postagem</ThemedText>
              </Pressable>
            </View>

            {ownPosts.length === 0 ? (
              <Card style={styles.emptyPostCard}>
                <Ionicons name="images-outline" size={32} color={colors.border} />
                <ThemedText variant="body" style={styles.logoutText}>
                  Nenhuma postagem ainda
                </ThemedText>
                <ThemedText variant="caption" color={colors.textMuted} style={styles.centered}>
                  Suas publicações sobre campanhas e instituições aparecem aqui.
                </ThemedText>
              </Card>
            ) : (
              <View style={styles.list}>
                {ownPosts.map((post) => (
                  <Card key={post.id} style={styles.postCard}>
                    <View style={styles.postAuthor}>
                      <Avatar name={user?.name} size="sm" />
                      <View style={styles.menuLabel}>
                        <ThemedText variant="body" style={styles.logoutText} numberOfLines={1}>
                          {user?.name}
                        </ThemedText>
                        <ThemedText variant="caption" color={colors.textMuted}>
                          {formatDate(post.createdAt)}
                        </ThemedText>
                      </View>
                    </View>
                    <ThemedText variant="body">{post.content}</ThemedText>
                    <View style={styles.postStats}>
                      <ThemedText variant="caption" color={colors.textMuted}>
                        {post.stats.likesCount ?? 0} curtidas
                      </ThemedText>
                      <ThemedText variant="caption" color={colors.textMuted}>
                        {post.stats.commentsCount ?? 0} comentários
                      </ThemedText>
                    </View>
                  </Card>
                ))}
              </View>
            )}
          </View>
        ) : null}
      </View>
    </ScreenContainer>
  );
}

export function SettingsMenuScreen() {
  const logout = useAppStore((state) => state.logout);
  const authToken = useAppStore((state) => state.authToken);
  const refreshToken = useAppStore((state) => state.refreshToken);
  const user = useAppStore((state) => state.user);
  const setActiveRole = useAppStore((state) => state.setActiveRole);
  const setPreferredRole = useAppStore((state) => state.setPreferredRole);
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const availableRoles = getSessionRoles(user);
  const activeRole = useActiveRole();
  const preferredRole = getPreferredInitialRole(user);
  const [savingPreferredRole, setSavingPreferredRole] = useState<UserRole | null>(null);
  const [settingsError, setSettingsError] = useState('');

  async function handleLogout() {
    try {
      await authService.logout(authToken, refreshToken);
    } catch {
      // ignore backend logout errors and clear local session
    } finally {
      logout();
    }
  }

  function handleChangeActiveRole(role: UserRole) {
    if (role === activeRole) return;

    setActiveRole(role);
    router.replace(getHomeRouteForRole(role));
  }

  async function handleChangePreferredRole(role: UserRole) {
    if (role === preferredRole || savingPreferredRole) return;

    setSettingsError('');
    setSavingPreferredRole(role);

    try {
      const updatedUser = await authService.updatePreferredRole(role, authToken);
      setPreferredRole(updatedUser.preferredRole ?? role);
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        setSettingsError('Essa tela inicial não está disponível para sua conta.');
      } else {
        setSettingsError('Não foi possível salvar sua preferência.');
      }
    } finally {
      setSavingPreferredRole(null);
    }
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText variant="title">Configurações</ThemedText>
          <ThemedText variant="caption" color={colors.textMuted}>
            Conta, segurança, notificações e suporte.
          </ThemedText>
        </View>

        {/* Identidade */}
        <Card style={styles.identityCard}>
          <View style={styles.identity}>
            <Avatar name={user?.name} size="lg" />
            <View style={styles.identityInfo}>
              <ThemedText variant="subtitle" style={styles.name} numberOfLines={2}>
                {user?.name}
              </ThemedText>
              <ThemedText variant="caption" color={colors.textMuted} style={styles.centered} numberOfLines={1}>
                {user?.email}
              </ThemedText>
              {user && (
                <Tag label={roleLabels[activeRole]} variant="success" style={styles.identityBadge} />
              )}
            </View>
          </View>
        </Card>

        {user && availableRoles.length > 1 ? (
          <View style={styles.section}>
            <ThemedText variant="subtitle">Visualização atual</ThemedText>
            <Card>
              <View style={styles.roleSwitcher}>
                {availableRoles.map((role) => {
                  const selected = role === activeRole;

                  return (
                    <Pressable
                      key={role}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => handleChangeActiveRole(role)}
                      style={[
                        styles.roleOption,
                        {
                          backgroundColor: selected ? colors.primary : colors.surfaceMuted,
                          borderColor: selected ? colors.primary : colors.border,
                        },
                      ]}>
                      <Ionicons
                        name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                        size={16}
                        color={selected ? colors.surface : colors.icon}
                      />
                      <ThemedText
                        variant="caption"
                        color={selected ? colors.surface : colors.text}>
                        {roleLabels[role]}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </Card>
          </View>
        ) : null}

        {user && availableRoles.length > 1 ? (
          <View style={styles.section}>
            <ThemedText variant="subtitle">Tela inicial após login</ThemedText>
            <Card>
              <View style={styles.roleSwitcher}>
                {availableRoles.map((role) => {
                  const selected = role === preferredRole;
                  const saving = role === savingPreferredRole;

                  return (
                    <Pressable
                      key={role}
                      accessibilityRole="button"
                      accessibilityState={{ selected, disabled: Boolean(savingPreferredRole) }}
                      disabled={Boolean(savingPreferredRole)}
                      onPress={() => handleChangePreferredRole(role)}
                      style={[
                        styles.roleOption,
                        {
                          backgroundColor: selected ? colors.primary : colors.surfaceMuted,
                          borderColor: selected ? colors.primary : colors.border,
                          opacity: savingPreferredRole && !saving ? 0.64 : 1,
                        },
                      ]}>
                      <Ionicons
                        name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                        size={16}
                        color={selected ? colors.surface : colors.icon}
                      />
                      <ThemedText
                        variant="caption"
                        color={selected ? colors.surface : colors.text}>
                        {saving ? 'Salvando...' : roleLabels[role]}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
              {settingsError ? (
                <ThemedText variant="caption" color={colors.danger} style={styles.settingsError}>
                  {settingsError}
                </ThemedText>
              ) : null}
            </Card>
          </View>
        ) : null}

        {/* Conta */}
        <View style={styles.section}>
          <ThemedText variant="body" style={styles.sectionTitle}>Conta</ThemedText>
          <Card padding="none" style={styles.menuCard}>
            <MenuItem icon="person-outline" label="Meus dados" onPress={() => router.push(routes.profileMe)} />
            <Divider />
            <MenuItem icon="notifications-outline" label="Preferências de notificação" onPress={() => router.push(routes.profileNotifications)} />
            <Divider />
            <MenuItem icon="lock-closed-outline" label="Privacidade e segurança" onPress={() => router.push(routes.profilePrivacy)} />
            <Divider />
            <MenuItem icon="help-circle-outline" label="Ajuda e suporte" onPress={() => router.push(routes.profileHelp)} />
          </Card>
        </View>

        {/* Sair */}
        <Pressable
          accessibilityRole="button"
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            {
              backgroundColor: colors.secondarySoft,
              borderColor: colors.danger,
              opacity: pressed ? 0.84 : 1,
            },
          ]}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <ThemedText variant="caption" color={colors.danger} style={styles.logoutText}>
            Sair da conta
          </ThemedText>
        </Pressable>

      </View>
    </ScreenContainer>
  );
}
