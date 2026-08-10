import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Avatar, Button, Card, Divider, EmptyState, Input, Loading, ScreenContainer, Tag, ThemedText } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFetch } from '@/hooks/use-fetch';
import { getHomeRouteForRole, routes } from '@/navigation/routes';
import { getPreferredInitialRole, getSessionRoles, roleLabels, type UserRole } from '@/navigation/session';
import { ApiError } from '@/services/api';
import { authService } from '@/services/auth';
import { campaignsService } from '@/services/campaigns';
import { donationsService, type Donation } from '@/services/donations';
import { followsService, type Follow } from '@/services/follows';
import { institutionStaffService } from '@/services/institution-staff';
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

function formatStripeRequirement(requirement: string) {
  const labels: Record<string, string> = {
    'business_profile.product_description': 'descrição da atividade',
    business_type: 'tipo de negócio',
    external_account: 'conta bancária de repasse',
  };

  return labels[requirement] ?? requirement;
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
  const activeRole = useActiveRole();
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const [stripeAccountInput, setStripeAccountInput] = useState('');
  const [stripeStatusMessage, setStripeStatusMessage] = useState('');
  const [verifyingStripeAccount, setVerifyingStripeAccount] = useState(false);

  const fetcher = useCallback(async (): Promise<ProfileData> => {
    if (activeRole === 'institution-staff') {
      const [donations, posts] = await Promise.all([
        donationsService.listMyInstitutionDonations(authToken),
        postsService.listFeed(authToken),
      ]);
      return { donations, follows: [], posts };
    }

    const [donations, follows, posts] = await Promise.all([
      donationsService.listMyDonations(authToken),
      followsService.listMyFollows(authToken),
      postsService.listFeed(authToken),
    ]);

    return { donations, follows, posts };
  }, [activeRole, authToken]);

  const { data, loading, error, refetch } = useFetch(fetcher);
  const staffMemberships = useFetch(
    useCallback(() => {
      if (activeRole !== 'institution-staff') return Promise.resolve([]);
      return institutionStaffService.listMyMemberships(authToken);
    }, [activeRole, authToken]),
  );
  const institutionId = staffMemberships.data?.[0]?.institutionId;
  const institution = useFetch(
    useCallback(() => {
      if (!institutionId) return Promise.resolve(null);
      return campaignsService.getInstitutionById(institutionId);
    }, [institutionId]),
  );

  useEffect(() => {
    setStripeAccountInput(institution.data?.stripeConnect?.accountId ?? institution.data?.stripeConnectAccountId ?? '');
  }, [institution.data?.stripeConnect?.accountId, institution.data?.stripeConnectAccountId]);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch])
  );

  const ownPosts = data?.posts.filter((post) => post.authorType === 'USER' && post.authorId === user?.id) ?? [];
  const institutionPosts =
    data?.posts.filter((post) =>
      institutionId
        ? post.authorType === 'INSTITUTION' && (post.institutionId === institutionId || post.authorId === institutionId)
        : post.authorType === 'INSTITUTION',
    ) ?? [];
  const donatedTotalCents = (data?.donations ?? [])
    .filter((donation) => donation.status === 'completed')
    .reduce((total, donation) => total + donation.amountCents, 0);
  const followingCount = data?.follows.length ?? 0;

  async function handleVerifyStripeAccount() {
    const accountId = stripeAccountInput.trim();

    if (!institutionId) {
      setStripeStatusMessage('Não encontramos a instituição vinculada à sua conta.');
      return;
    }

    if (!accountId) {
      setStripeStatusMessage('Informe o ID da conta Stripe no formato acct_...');
      return;
    }

    const normalizedAccountId = accountId.toLowerCase();

    if (
      !/^acct_[a-z0-9]+$/i.test(accountId) ||
      normalizedAccountId.includes('teste') ||
      normalizedAccountId.includes('test') ||
      normalizedAccountId.includes('seu_id') ||
      normalizedAccountId.includes('example')
    ) {
      setStripeStatusMessage('Informe um ID real de conta conectada Stripe, como acct_1ABC...');
      return;
    }

    setVerifyingStripeAccount(true);
    setStripeStatusMessage('');

    try {
      const updatedInstitution = await campaignsService.verifyInstitutionStripeConnectAccount(institutionId, accountId, authToken);
      await institution.refetch();
      const requirements = updatedInstitution.stripeConnect?.requirementsCurrentlyDue ?? [];

      if (updatedInstitution.stripeConnect?.ready) {
        setStripeStatusMessage('Conta Stripe pronta para receber doações.');
      } else if (requirements.length) {
        setStripeStatusMessage('Conta encontrada e salva. Conclua as pendências na Stripe para liberar campanhas.');
      } else {
        setStripeStatusMessage('Conta encontrada e salva. Aguarde a Stripe concluir a ativação da conta.');
      }
    } catch (error) {
      setStripeStatusMessage(error instanceof Error ? error.message : 'Não foi possível validar a conta Stripe.');
    } finally {
      setVerifyingStripeAccount(false);
    }
  }

  if (activeRole === 'institution-staff') {
    const institutionName = institution.data?.name ?? staffMemberships.data?.[0]?.institution?.name ?? user?.name ?? 'Instituição';
    const institutionEmail = institution.data?.email ?? user?.email;
    const isVerified = institution.data?.verified ?? true;
    const campaignCount = institution.data?.campaigns?.length ?? institution.data?.activeCampaigns ?? 0;
    const postsCount = institution.data?.postsCount ?? institutionPosts.length;
    const followersCount = institution.data?.followersCount ?? 0;
    const receivedDonationsCount = (data?.donations ?? []).filter((donation) => donation.status === 'completed').length;
    const stripeConnect = institution.data?.stripeConnect;
    const stripeReady = Boolean(stripeConnect?.ready);

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

            <View style={styles.institutionProfileIdentity}>
              <Avatar name={institutionName} size="lg" />
              <View style={styles.institutionProfileText}>
                <ThemedText variant="title" numberOfLines={2}>{institutionName}</ThemedText>
                <ThemedText variant="body" color={colors.textMuted} numberOfLines={1}>
                  {institutionEmail}
                </ThemedText>
                <Tag
                  label={isVerified ? 'Instituição verificada' : 'Verificação pendente'}
                  variant={isVerified ? 'success' : 'warning'}
                  style={styles.identityBadge}
                />
              </View>
            </View>

            <View style={styles.socialStats}>
              <View style={styles.socialStat}>
                <ThemedText variant="subtitle">{postsCount}</ThemedText>
                <ThemedText variant="caption" color={colors.textMuted}>postagens</ThemedText>
              </View>
              <View style={styles.socialStat}>
                <ThemedText variant="subtitle">{followersCount}</ThemedText>
                <ThemedText variant="caption" color={colors.textMuted}>seguidores</ThemedText>
              </View>
              <View style={styles.socialStat}>
                <ThemedText variant="subtitle">{receivedDonationsCount}</ThemedText>
                <ThemedText variant="caption" color={colors.textMuted}>doações</ThemedText>
              </View>
              <View style={styles.socialStat}>
                <ThemedText variant="subtitle">{campaignCount}</ThemedText>
                <ThemedText variant="caption" color={colors.textMuted}>campanhas</ThemedText>
              </View>
            </View>

            <View style={styles.profileActions}>
              <Button
                size="sm"
                style={styles.profileAction}
                leftSlot={<Ionicons name="eye-outline" size={18} color={colors.surface} />}
                disabled={!institutionId}
                onPress={() => institutionId && router.push(routes.appInstitutionDetail(institutionId))}>
                Ver perfil público
              </Button>
              <Button
                size="sm"
                variant="ghost"
                style={styles.profileAction}
                leftSlot={<Ionicons name="pencil-outline" size={18} color={colors.primary} />}
                onPress={() => router.push(routes.profileMe)}>
                Editar dados
              </Button>
            </View>
          </Card>

          <Card style={[
            styles.stripeCard,
            { borderColor: stripeReady ? colors.primary : colors.warning },
          ]}>
            <View style={styles.stripeHeader}>
              <View style={[styles.stripeIcon, { backgroundColor: stripeReady ? colors.primarySoft : colors.accentSoft }]}>
                <Ionicons
                  name={stripeReady ? 'checkmark-circle-outline' : 'alert-circle-outline'}
                  size={24}
                  color={stripeReady ? colors.primary : colors.warning}
                />
              </View>
              <View style={styles.menuLabel}>
                <ThemedText variant="body" style={styles.logoutText}>Stripe Connect</ThemedText>
                <ThemedText variant="caption" color={colors.textMuted}>
                  {stripeReady
                    ? 'Conta validada. A instituição pode criar campanhas e receber doações.'
                    : 'Valide a conta conectada para liberar a criação de campanhas.'}
                </ThemedText>
              </View>
            </View>
            <Input
              label="Conta conectada Stripe"
              onChangeText={setStripeAccountInput}
              placeholder="acct_..."
              value={stripeAccountInput}
            />
            {stripeConnect?.requirementsCurrentlyDue?.length ? (
              <ThemedText variant="caption" color={colors.warning}>
                Pendências na Stripe: {stripeConnect.requirementsCurrentlyDue.slice(0, 3).map(formatStripeRequirement).join(', ')}
              </ThemedText>
            ) : null}
            {stripeStatusMessage ? (
              <ThemedText variant="caption" color={stripeReady ? colors.primary : colors.warning}>
                {stripeStatusMessage}
              </ThemedText>
            ) : null}
            <Button
              fullWidth
              loading={verifyingStripeAccount}
              onPress={handleVerifyStripeAccount}
              variant={stripeReady ? 'ghost' : 'primary'}>
              {stripeReady ? 'Revalidar conta Stripe' : 'Validar conta Stripe'}
            </Button>
          </Card>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText variant="subtitle">Postagens</ThemedText>
              <Pressable onPress={() => router.push('/institution/create?mode=post' as never)}>
                <ThemedText variant="body" color={colors.primary}>Criar postagem</ThemedText>
              </Pressable>
            </View>

            {loading || institution.loading ? <Loading label="Carregando perfil..." /> : null}
            {error ? (
              <EmptyState
                title="Não foi possível carregar"
                description={error}
                illustration={<Ionicons name="cloud-offline-outline" size={56} color={colors.border} />}
                action={<Button variant="secondary" size="sm" onPress={refetch}>Tentar novamente</Button>}
              />
            ) : null}

            {!loading && !error && institutionPosts.length === 0 ? (
              <Card style={styles.emptyPostCard}>
                <Ionicons name="images-outline" size={32} color={colors.border} />
                <ThemedText variant="body" style={styles.logoutText}>Nenhuma postagem ainda</ThemedText>
                <ThemedText variant="caption" color={colors.textMuted} style={styles.centered}>
                  Publique atualizações para seguidores e doadores.
                </ThemedText>
              </Card>
            ) : (
              <View style={styles.list}>
                {institutionPosts.map((post) => (
                  <Card key={post.id} style={styles.postCard}>
                    <View style={styles.postAuthor}>
                      <Avatar name={institutionName} size="sm" />
                      <View style={styles.menuLabel}>
                        <ThemedText variant="body" style={styles.logoutText}>{institutionName}</ThemedText>
                        <ThemedText variant="caption" color={colors.textMuted}>{formatDate(post.createdAt)}</ThemedText>
                      </View>
                    </View>
                    <ThemedText variant="body">{post.content}</ThemedText>
                    <View style={styles.postStats}>
                      <ThemedText variant="caption" color={colors.primary}>{post.stats.likesCount ?? 0} curtidas</ThemedText>
                      <ThemedText variant="caption" color={colors.textMuted}>{post.stats.commentsCount ?? 0} comentários</ThemedText>
                      <ThemedText variant="caption" color={colors.textMuted}>{post.stats.sharesCount ?? 0} compartilhamentos</ThemedText>
                    </View>
                  </Card>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScreenContainer>
    );
  }

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
            <Button size="sm" variant="ghost" style={styles.profileAction} onPress={() => router.push(routes.profileSettings)}>
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
        <View style={styles.settingsBackBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()} style={styles.settingsBackButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <ThemedText variant="subtitle" numberOfLines={1} style={styles.settingsHeaderTitle}>
            Configurações
          </ThemedText>
          <View style={styles.settingsBackButton} />
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
