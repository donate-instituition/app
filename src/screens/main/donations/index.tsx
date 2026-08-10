import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Share, TextInput, View } from 'react-native';

import { Avatar, Button, Card, Divider, EmptyState, Input, Loading, ScreenContainer, Tag, ThemedText } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFetch } from '@/hooks/use-fetch';
import { routes } from '@/navigation/routes';
import { adminService, type AdminUser, type AdminUsersPage } from '@/services/admin';
import { campaignsService, type Campaign, type CampaignComment } from '@/services/campaigns';
import { donationsService, donationStatusLabels, type Donation, type DonationStatus } from '@/services/donations';
import { postsService, type FeedPost, type PostComment } from '@/services/posts';
import { useActiveRole, useAppStore } from '@/store';
import { theme } from '@/theme';

import { styles } from './styles';

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getPostAuthorLabel(post: FeedPost): string {
  if (post.authorType === 'INSTITUTION') return 'Instituição';
  return 'Doador';
}

type DonorDonateData = {
  campaigns: Campaign[];
  posts: FeedPost[];
};

type CommentTarget =
  | { id: string; title: string; type: 'campaign' }
  | { id: string; title: string; type: 'post' };

type FeedComment = CampaignComment | PostComment;

function getCommentAuthorName(comment: FeedComment) {
  return comment.author?.fullName?.trim() || comment.author?.email?.trim() || 'Usuário';
}

const institutionDonationFilters = [
  { key: 'all', label: 'Todas' },
  { key: 'paid', label: 'Pagas' },
  { key: 'pending', label: 'Pendentes' },
  { key: 'refunded', label: 'Reembolsadas' },
] as const;

function getCampaignImage(item: Campaign) {
  if (item.title.toLowerCase().includes('inverno')) {
    return 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=700&q=80';
  }

  if (item.title.toLowerCase().includes('escolar')) {
    return 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=700&q=80';
  }

  return 'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?auto=format&fit=crop&w=700&q=80';
}

export function DonationsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const authToken = useAppStore((state) => state.authToken);
  const activeRole = useActiveRole();
  const router = useRouter();
  const [mode, setMode] = useState<'following' | 'recommended'>('following');
  const [institutionDonationFilter, setInstitutionDonationFilter] = useState<'all' | 'paid' | 'pending' | 'refunded'>('all');
  const [institutionDonationSearch, setInstitutionDonationSearch] = useState('');
  const [adminUserSearch, setAdminUserSearch] = useState('');
  const [adminUserPage, setAdminUserPage] = useState(1);
  const [likedCampaigns, setLikedCampaigns] = useState<Set<string>>(new Set());
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [commentTarget, setCommentTarget] = useState<CommentTarget | null>(null);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentsError, setCommentsError] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  useEffect(() => {
    setAdminUserPage(1);
  }, [adminUserSearch]);

  const feed = useFetch(
    useCallback(() => {
      if (activeRole !== 'donor') return Promise.resolve({ campaigns: [], posts: [] });
      return Promise.all([
        campaignsService.listCampaigns(),
        postsService.listFeed(authToken),
      ]).then(([campaigns, posts]) => ({ campaigns, posts }));
    }, [activeRole, authToken])
  );

  const adminUsers = useFetch(
    useCallback(() => {
      if (activeRole !== 'platform-admin') {
        return Promise.resolve(null);
      }

      return adminService.listUsersPage(authToken, {
        limit: 30,
        page: adminUserPage,
        search: adminUserSearch,
        sort: 'name',
      });
    }, [activeRole, adminUserPage, adminUserSearch, authToken])
  );
  const institutionDonations = useFetch(
    useCallback(() => {
      if (activeRole !== 'institution-staff') return Promise.resolve([]);
      return donationsService.listMyInstitutionDonations(authToken);
    }, [activeRole, authToken])
  );

  function getStatusVariant(status: DonationStatus): 'success' | 'warning' | 'danger' | 'neutral' {
    if (status === 'completed') return 'success';
    if (status === 'pending' || status === 'processing') return 'warning';
    if (status === 'failed' || status === 'cancelled') return 'danger';
    return 'neutral';
  }

  async function openComments(target: CommentTarget) {
    setCommentTarget(target);
    setCommentText('');
    setComments([]);
    setCommentsError('');
    setCommentsLoading(true);

    try {
      const nextComments =
        target.type === 'campaign'
          ? await campaignsService.listCampaignComments(target.id, authToken)
          : await postsService.listComments(target.id, authToken);
      setComments(nextComments);
    } catch (error) {
      setCommentsError(error instanceof Error ? error.message : 'Não foi possível carregar os comentários.');
    } finally {
      setCommentsLoading(false);
    }
  }

  async function submitComment() {
    if (!commentTarget || !commentText.trim()) return;

    setCommentSubmitting(true);

    try {
      const createdComment =
        commentTarget.type === 'campaign'
          ? await campaignsService.createCampaignComment(commentTarget.id, commentText, authToken)
          : await postsService.createComment({ postId: commentTarget.id, content: commentText }, authToken);
      setComments((items) => [...items, createdComment]);
      setCommentText('');
      await feed.refetch();
    } catch (error) {
      setCommentsError(error instanceof Error ? error.message : 'Não foi possível enviar o comentário.');
    } finally {
      setCommentSubmitting(false);
    }
  }

  async function toggleCampaignLike(campaign: Campaign) {
    const isLiked = likedCampaigns.has(campaign.id);

    setLikedCampaigns((current) => {
      const next = new Set(current);
      if (isLiked) next.delete(campaign.id);
      else next.add(campaign.id);
      return next;
    });

    try {
      if (isLiked) await campaignsService.unlikeCampaign(campaign.id, authToken);
      else await campaignsService.likeCampaign(campaign.id, authToken);
      await feed.refetch();
    } catch {
      setLikedCampaigns((current) => {
        const next = new Set(current);
        if (isLiked) next.add(campaign.id);
        else next.delete(campaign.id);
        return next;
      });
    }
  }

  async function togglePostLike(post: FeedPost) {
    const isLiked = likedPosts.has(post.id);

    setLikedPosts((current) => {
      const next = new Set(current);
      if (isLiked) next.delete(post.id);
      else next.add(post.id);
      return next;
    });

    try {
      if (isLiked) await postsService.unlikePost(post.id, authToken);
      else await postsService.likePost({ postId: post.id }, authToken);
      await feed.refetch();
    } catch {
      setLikedPosts((current) => {
        const next = new Set(current);
        if (isLiked) next.add(post.id);
        else next.delete(post.id);
        return next;
      });
    }
  }

  async function shareCampaign(campaign: Campaign) {
    await Share.share({
      message: `Conheça a campanha ${campaign.title} da ${campaign.institution}.`,
    });
    await campaignsService.shareCampaign(campaign.id);
    await feed.refetch();
  }

  async function sharePost(post: FeedPost) {
    await Share.share({ message: post.content });
    await postsService.sharePost(post.id);
    await feed.refetch();
  }

  if (activeRole === 'platform-admin') {
    const usersPage = adminUsers.data as AdminUsersPage | null;
    const users = usersPage?.items ?? [];
    const usersTotal = usersPage?.meta.total ?? users.length;
    const donorsCount =
      usersPage?.summary?.donorsCount ??
      users.filter((item) => item.roles?.some((role) => role.name === 'DONOR')).length;
    const institutionStaffCount =
      usersPage?.summary?.institutionStaffCount ??
      users.filter((item) => item.roles?.some((role) => role.name === 'INSTITUTION_STAFF')).length;
    const getUserId = (item: AdminUser) => item.id ?? item._id ?? '';

    return (
      <ScreenContainer scrollable>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.donateHeader}>
              <View style={styles.headerText}>
                <ThemedText variant="title">Usuários</ThemedText>
                <ThemedText variant="caption" color={colors.textMuted}>
                  Gestão de contas da plataforma.
                </ThemedText>
              </View>
              <Avatar name="Admin" size="md" />
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <Card style={styles.metricCard}>
              <View style={[styles.metricCircle, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="people" size={24} color={colors.primary} />
              </View>
              <ThemedText variant="title">{adminUsers.loading ? '—' : usersTotal}</ThemedText>
              <ThemedText variant="caption" color={colors.textMuted}>Usuários</ThemedText>
            </Card>
            <Card style={styles.metricCard}>
              <View style={[styles.metricCircle, { backgroundColor: colors.secondarySoft }]}>
                <Ionicons name="business" size={24} color={colors.secondary} />
              </View>
              <ThemedText variant="title">{adminUsers.loading ? '—' : institutionStaffCount}</ThemedText>
              <ThemedText variant="caption" color={colors.textMuted}>Equipe instituições</ThemedText>
            </Card>
          </View>

          <View style={styles.section}>
            <ThemedText variant="subtitle">Usuários da plataforma</ThemedText>
            <ThemedText variant="caption" color={colors.textMuted}>
              {donorsCount} doadores · {institutionStaffCount} usuários institucionais
            </ThemedText>

            <View style={styles.searchRow}>
              <View style={styles.searchInputWrap}>
                <Input
                  placeholder="Buscar usuário"
                  value={adminUserSearch}
                  onChangeText={setAdminUserSearch}
                  leftSlot={<Ionicons name="search-outline" size={20} color={colors.icon} />}
                />
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => setAdminUserSearch('')}
                style={[styles.filterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="options-outline" size={22} color={colors.primary} />
              </Pressable>
            </View>

            {adminUsers.loading && <Loading label="Carregando usuários..." />}

            {adminUsers.error && (
              <EmptyState
                title="Não foi possível carregar"
                description={adminUsers.error}
                illustration={<Ionicons name="cloud-offline-outline" size={56} color={colors.border} />}
                action={<Button variant="secondary" size="sm" onPress={adminUsers.refetch}>Tentar novamente</Button>}
              />
            )}

            {!adminUsers.loading && !adminUsers.error && (
              <Card padding="none" style={styles.institutionDonationList}>
                {users.map((item, index) => {
                  const primaryRole = item.roles?.some((role) => role.name === 'PLATFORM_ADMIN')
                    ? 'PLATFORM_ADMIN'
                    : item.roles?.some((role) => role.name === 'INSTITUTION_STAFF')
                      ? 'INSTITUTION_STAFF'
                      : 'DONOR';

                  return (
                    <View key={item.id ?? item._id ?? item.email}>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => router.push(`/admin/user/${getUserId(item)}` as never)}
                        style={styles.adminUserRow}>
                        <View style={styles.donationInfo}>
                          <ThemedText variant="body" style={styles.bold}>{item.fullName}</ThemedText>
                          <ThemedText variant="caption" color={colors.textMuted}>{item.email}</ThemedText>
                        </View>
                        <Tag
                          label={primaryRole === 'DONOR' ? 'Doador' : primaryRole === 'INSTITUTION_STAFF' ? 'Instituição' : 'Admin'}
                          variant={primaryRole === 'PLATFORM_ADMIN' ? 'warning' : 'neutral'}
                        />
                      </Pressable>
                      {index < users.length - 1 && <Divider />}
                    </View>
                  );
                })}
              </Card>
            )}

            {!adminUsers.loading && !adminUsers.error && usersPage ? (
              <View style={styles.paginationRow}>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!usersPage.meta.hasPreviousPage}
                  onPress={() => setAdminUserPage((page) => Math.max(1, page - 1))}>
                  Anterior
                </Button>
                <ThemedText variant="caption" color={colors.textMuted}>
                  Página {usersPage.meta.page} de {usersPage.meta.totalPages}
                </ThemedText>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!usersPage.meta.hasNextPage}
                  onPress={() => setAdminUserPage((page) => page + 1)}>
                  Próxima
                </Button>
              </View>
            ) : null}
          </View>
        </View>
      </ScreenContainer>
    );
  }

  if (activeRole === 'institution-staff') {
    const donations = (institutionDonations.data ?? []) as Donation[];
    const normalizedSearch = institutionDonationSearch.trim().toLowerCase();
    const filteredDonations = donations.filter((item) => {
      const matchesFilter =
        institutionDonationFilter === 'all' ||
        (institutionDonationFilter === 'paid' && item.status === 'completed') ||
        (institutionDonationFilter === 'pending' && ['pending', 'processing'].includes(item.status)) ||
        (institutionDonationFilter === 'refunded' && ['cancelled', 'failed'].includes(item.status));
      const matchesSearch =
        !normalizedSearch ||
        [
          item.campaignTitle,
          item.institutionName,
          item.amountFormatted,
          donationStatusLabels[item.status],
          formatDate(item.createdAt),
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
    const completed = donations.filter((item) => item.status === 'completed');
    const now = new Date();
    const todayTotal = completed
      .filter((item) => new Date(item.createdAt).toDateString() === now.toDateString())
      .reduce((sum, item) => sum + (item.netAmountCents ?? item.amountCents), 0);
    const monthTotal = completed
      .filter((item) => {
        const createdAt = new Date(item.createdAt);
        return createdAt.getFullYear() === now.getFullYear() && createdAt.getMonth() === now.getMonth();
      })
      .reduce((sum, item) => sum + (item.netAmountCents ?? item.amountCents), 0);
    const donorsCount = completed.length;

    return (
      <ScreenContainer scrollable>
        <View style={styles.container}>
          <View style={styles.backBar}>
            <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
            <ThemedText variant="subtitle" numberOfLines={1} style={styles.backBarTitle}>
              Doações
            </ThemedText>
            <View style={styles.backButton} />
          </View>

          <ThemedText variant="caption" color={colors.textMuted}>
            Acompanhe entradas, recibos e status.
          </ThemedText>

          <View style={styles.searchRow}>
            <View style={styles.searchInputWrap}>
              <Input
                placeholder="Buscar doadores ou campanhas"
                value={institutionDonationSearch}
                onChangeText={setInstitutionDonationSearch}
                leftSlot={<View style={styles.searchIcon}><Ionicons name="search-outline" size={18} color={colors.icon} /></View>}
              />
            </View>
            <Pressable
              style={[styles.filterButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={() => setInstitutionDonationSearch('')}>
              <Ionicons name="filter-outline" size={28} color={colors.primary} />
            </Pressable>
          </View>

          <View style={styles.chipRow}>
            {institutionDonationFilters.map(({ key, label }) => {
              const selected = institutionDonationFilter === key;

              return (
                <Pressable
                  key={key}
                  accessibilityRole="button"
                  onPress={() => setInstitutionDonationFilter(key)}
                  style={[
                    styles.outlineChip,
                    { backgroundColor: selected ? colors.primarySoft : colors.surface, borderColor: selected ? colors.primary : colors.border },
                  ]}>
                  <ThemedText variant="body" color={selected ? colors.primary : colors.textMuted}>{label}</ThemedText>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.metricsGrid}>
            <Card style={styles.institutionDonationMetric}>
              <View style={[styles.metricCircle, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="calendar-outline" size={24} color={colors.primary} />
              </View>
              <ThemedText variant="body" color={colors.textMuted}>Hoje</ThemedText>
              <ThemedText variant="title">R$ {(todayTotal / 100).toFixed(0)}</ThemedText>
            </Card>
            <Card style={styles.institutionDonationMetric}>
              <View style={[styles.metricCircle, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="bar-chart-outline" size={24} color={colors.primary} />
              </View>
              <ThemedText variant="body" color={colors.textMuted}>Mês</ThemedText>
              <ThemedText variant="title">R$ {(monthTotal / 100).toFixed(0)}</ThemedText>
            </Card>
            <Card style={styles.institutionDonationMetric}>
              <View style={[styles.metricCircle, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="people-outline" size={24} color={colors.primary} />
              </View>
              <ThemedText variant="title">{donorsCount}</ThemedText>
              <ThemedText variant="body" color={colors.textMuted}>doadores</ThemedText>
            </Card>
          </View>

          {institutionDonations.loading && <Loading label="Carregando doações..." />}
          {institutionDonations.error ? (
            <EmptyState
              title="Não foi possível carregar"
              description={institutionDonations.error}
              illustration={<Ionicons name="cloud-offline-outline" size={56} color={colors.border} />}
              action={<Button variant="secondary" size="sm" onPress={institutionDonations.refetch}>Tentar novamente</Button>}
            />
          ) : null}
          {!institutionDonations.loading && !institutionDonations.error && donations.length === 0 ? (
            <EmptyState
              title="Nenhuma doação ainda"
              description="As entradas da instituição aparecerão aqui."
              illustration={<Ionicons name="receipt-outline" size={56} color={colors.border} />}
            />
          ) : null}
          {!institutionDonations.loading && !institutionDonations.error && donations.length > 0 && filteredDonations.length === 0 ? (
            <EmptyState
              title="Nenhuma doação encontrada"
              description="Tente mudar a busca ou o filtro selecionado."
              illustration={<Ionicons name="search-outline" size={56} color={colors.border} />}
            />
          ) : null}
          {!institutionDonations.loading && !institutionDonations.error && filteredDonations.length > 0 ? (
            <Card padding="none" style={styles.institutionDonationList}>
              {filteredDonations.map((item, index) => (
                <View key={item.id}>
                  <Pressable style={styles.institutionDonationRow} onPress={() => router.push(routes.appDonationDetail(item.id))}>
                    <Avatar name={item.institutionName} size="md" />
                    <View style={styles.donationInfo}>
                      <ThemedText variant="body" style={styles.bold}>Doador EloDoar</ThemedText>
                      <ThemedText variant="caption" color={colors.textMuted}>{item.campaignTitle}</ThemedText>
                      <View style={styles.inlineMeta}>
                        <Ionicons name="time-outline" size={14} color={colors.icon} />
                        <ThemedText variant="caption" color={colors.textMuted}>{formatDate(item.createdAt)}</ThemedText>
                      </View>
                    </View>
                    <View style={styles.donationRight}>
                      <ThemedText variant="subtitle">{item.amountFormatted}</ThemedText>
                      <Tag label={donationStatusLabels[item.status]} variant={getStatusVariant(item.status)} />
                    </View>
                    <Ionicons name="receipt-outline" size={24} color={colors.primary} />
                  </Pressable>
                  {index < filteredDonations.length - 1 ? <Divider /> : null}
                </View>
              ))}
            </Card>
          ) : null}
        </View>
      </ScreenContainer>
    );
  }

  const donorData = (feed.data ?? { campaigns: [], posts: [] }) as DonorDonateData;
  const posts = donorData.posts;
  const campaigns = donorData.campaigns.slice(0, 4);

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <View style={styles.donateHeader}>
          <View style={styles.headerText}>
            <ThemedText variant="title">Doar</ThemedText>
            <ThemedText variant="caption" color={colors.textMuted}>
              Apoie campanhas e acompanhe causas que fazem sentido para você.
            </ThemedText>
          </View>
          <View style={styles.headerActions}>
            <Pressable accessibilityRole="button" onPress={() => router.push(routes.appNotifications)} style={styles.headerIconButton}>
              <Ionicons name="notifications-outline" size={30} color={colors.primaryStrong} />
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => router.push(routes.donorMessages)} style={styles.headerIconButton}>
              <Ionicons name="chatbubble-outline" size={30} color={colors.primaryStrong} />
            </Pressable>
          </View>
        </View>

        <View style={[styles.modeToggle, { backgroundColor: colors.surfaceMuted }]}>
          <Pressable
            style={[styles.modeButton, mode === 'following' && [styles.modeButtonActive, { backgroundColor: colors.surface }]]}
            onPress={() => setMode('following')}>
            <ThemedText variant="body" color={mode === 'following' ? colors.primary : colors.textMuted} style={styles.modeText}>
              Seguindo
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.modeButton, mode === 'recommended' && [styles.modeButtonActive, { backgroundColor: colors.surface }]]}
            onPress={() => setMode('recommended')}>
            <ThemedText variant="body" color={mode === 'recommended' ? colors.primary : colors.textMuted} style={styles.modeText}>
              Para você
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.chipRow}>
          {[
            ['alert-circle', 'Urgentes'],
            ['book-outline', 'Educação'],
            ['people-outline', 'Comunidade'],
            ['leaf-outline', 'Meio ambiente'],
          ].map(([icon, label], index) => (
            <View
              key={label}
              style={[
                styles.outlineChip,
                {
                  backgroundColor: index === 0 ? colors.secondarySoft : colors.surface,
                  borderColor: index === 0 ? colors.primary : colors.border,
                },
              ]}>
              <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color={index === 0 ? colors.danger : colors.primary} />
              <ThemedText variant="body" color={index === 0 ? colors.primary : colors.textMuted}>
                {label}
              </ThemedText>
            </View>
          ))}
        </View>

        {feed.loading && <Loading label="Carregando feed..." />}

        {feed.error && (
          <EmptyState
            title="Não foi possível carregar"
            description={feed.error}
            illustration={<Ionicons name="cloud-offline-outline" size={56} color={colors.border} />}
            action={<Button variant="secondary" size="sm" onPress={feed.refetch}>Tentar novamente</Button>}
          />
        )}

        {!feed.loading && !feed.error && campaigns.length === 0 && posts.length === 0 ? (
          <EmptyState
            title="Seu feed ainda está vazio"
            description="Siga campanhas, instituições e pessoas para acompanhar publicações por aqui."
            illustration={<Ionicons name="heart-outline" size={56} color={colors.border} />}
            action={<Button size="sm" onPress={() => router.push(routes.donorCampaigns)}>Explorar causas</Button>}
          />
        ) : null}

        {!feed.loading && !feed.error && (campaigns.length > 0 || posts.length > 0) ? (
          <View style={styles.list}>
            {campaigns.map((campaign, index) => (
              <Card key={campaign.id} style={styles.donateCampaignCard}>
                <View style={styles.postHeader}>
                  <Avatar name={campaign.institution} size="sm" />
                  <View style={styles.donationInfo}>
                    <View style={styles.verifiedLine}>
                      <ThemedText variant="subtitle" style={styles.bold} numberOfLines={1}>
                        {campaign.institution}
                      </ThemedText>
                      <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                    </View>
                    <ThemedText variant="caption" color={colors.textMuted}>
                      {index === 0 ? '2h' : '1d'} · Público
                    </ThemedText>
                  </View>
                  {index > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      style={[
                        styles.followSmall,
                        { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft },
                      ]}>
                      Seguir
                    </Button>
                  )}
                  <Ionicons name="ellipsis-horizontal" size={18} color={colors.icon} />
                </View>
                <ThemedText variant="body">
                  {campaign.title.toLowerCase().includes('inverno')
                    ? 'O inverno chegou e nossa meta é garantir carinho, conforto e dignidade para cada pessoa atendida.'
                    : `Ajude a campanha ${campaign.title} a chegar mais longe.`}{' '}
                  <ThemedText variant="body" color={colors.primary}>Ver mais</ThemedText>
                </ThemedText>
                <Pressable onPress={() => router.push(routes.appCampaignDetail(campaign.id))}>
                  <Image source={getCampaignImage(campaign)} style={styles.donateCampaignImage} contentFit="cover" />
                </Pressable>
                <View style={styles.donateProgressRow}>
                  <View>
                    <ThemedText variant="title" color={colors.primary}>{campaign.progress}%</ThemedText>
                    <ThemedText variant="caption" color={colors.textMuted}>da meta</ThemedText>
                  </View>
                  <View style={[styles.donateProgressTrack, { backgroundColor: colors.primarySoft }]}>
                    <View style={[styles.donateProgressFill, { backgroundColor: colors.primary, width: `${Math.min(campaign.progress, 100)}%` }]} />
                  </View>
                  <View style={styles.donateGoal}>
                    <ThemedText variant="body">{campaign.goalFormatted}</ThemedText>
                    <ThemedText variant="caption" color={colors.textMuted}>meta</ThemedText>
                  </View>
                </View>
                <View style={styles.donateMetaRow}>
                  <ThemedText variant="body" color={colors.textMuted}>
                    {campaign.donationsCount ?? 0} doações
                  </ThemedText>
                  <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />
                  <ThemedText variant="body" color={colors.textMuted}>
                    {campaign.followersCount ?? 0} apoiadores
                  </ThemedText>
                </View>
                <Button
                  fullWidth
                  variant="primary"
                  onPress={() => router.push(routes.appDonate(campaign.id))}>
                  Doar agora
                </Button>
                <View style={styles.feedActions}>
                  <Pressable style={styles.feedAction} onPress={() => void toggleCampaignLike(campaign)}>
                    <Ionicons
                      name={likedCampaigns.has(campaign.id) ? 'heart' : 'heart-outline'}
                      size={22}
                      color={likedCampaigns.has(campaign.id) ? colors.primary : colors.icon}
                    />
                    <ThemedText variant="body" color={likedCampaigns.has(campaign.id) ? colors.primary : colors.textMuted}>
                      {campaign.likesCount ?? 0}
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    style={styles.feedAction}
                    onPress={() => void openComments({ id: campaign.id, title: campaign.title, type: 'campaign' })}>
                    <Ionicons name="chatbubble-outline" size={22} color={colors.icon} />
                    <ThemedText variant="body" color={colors.textMuted}>
                      {campaign.commentsCount ?? 0}
                    </ThemedText>
                  </Pressable>
                  <Pressable style={styles.feedAction} onPress={() => void shareCampaign(campaign)}>
                    <Ionicons name="paper-plane-outline" size={22} color={colors.icon} />
                    <ThemedText variant="body" color={colors.textMuted}>
                      {campaign.sharesCount ?? 0}
                    </ThemedText>
                  </Pressable>
                </View>
              </Card>
            ))}

            {posts.map((post) => (
              <Card key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <Avatar name={getPostAuthorLabel(post)} size="sm" />
                  <View style={styles.donationInfo}>
                    <ThemedText variant="body" style={styles.bold}>{getPostAuthorLabel(post)}</ThemedText>
                    <ThemedText variant="caption" color={colors.textMuted}>{formatDate(post.createdAt)}</ThemedText>
                  </View>
                  <Ionicons name="ellipsis-horizontal" size={18} color={colors.icon} />
                </View>

                <ThemedText variant="body">{post.content}</ThemedText>

                <View style={styles.postActions}>
                  <Pressable style={styles.postAction} onPress={() => void togglePostLike(post)}>
                    <Ionicons
                      name={likedPosts.has(post.id) ? 'heart' : 'heart-outline'}
                      size={22}
                      color={likedPosts.has(post.id) ? colors.primary : colors.icon}
                    />
                    <ThemedText variant="caption" color={colors.textMuted}>{post.stats.likesCount ?? 0}</ThemedText>
                  </Pressable>
                  <Pressable
                    style={styles.postAction}
                    onPress={() => void openComments({ id: post.id, title: 'Post', type: 'post' })}>
                    <Ionicons name="chatbubble-outline" size={20} color={colors.icon} />
                    <ThemedText variant="caption" color={colors.textMuted}>{post.stats.commentsCount ?? 0}</ThemedText>
                  </Pressable>
                  <Pressable style={styles.postAction} onPress={() => void sharePost(post)}>
                    <Ionicons name="paper-plane-outline" size={20} color={colors.icon} />
                    <ThemedText variant="caption" color={colors.textMuted}>{post.stats.sharesCount ?? 0}</ThemedText>
                  </Pressable>
                  {post.campaignId ? (
                    <Button size="sm" style={styles.donateAction} onPress={() => router.push(routes.appDonate(post.campaignId!))}>
                      Doar
                    </Button>
                  ) : null}
                </View>
              </Card>
            ))}
          </View>
        ) : null}

        <Modal
          animationType="slide"
          transparent
          visible={Boolean(commentTarget)}
          onRequestClose={() => setCommentTarget(null)}>
          <View style={styles.commentBackdrop}>
            <View style={[styles.commentSheet, { backgroundColor: colors.surface }]}>
              <View style={[styles.commentHandle, { backgroundColor: colors.border }]} />
              <View style={styles.commentHeader}>
                <View style={styles.headerText}>
                  <ThemedText variant="subtitle">Comentários</ThemedText>
                  <ThemedText variant="caption" color={colors.textMuted} numberOfLines={1}>
                    {commentTarget?.title}
                  </ThemedText>
                </View>
                <Pressable style={styles.commentCloseButton} onPress={() => setCommentTarget(null)}>
                  <Ionicons name="close" size={22} color={colors.icon} />
                </Pressable>
              </View>

              {commentsLoading ? (
                <Loading label="Carregando comentários..." />
              ) : commentsError ? (
                <View style={styles.commentEmpty}>
                  <Ionicons name="warning-outline" size={36} color={colors.danger} />
                  <ThemedText variant="body" style={styles.bold}>Não foi possível carregar</ThemedText>
                  <ThemedText variant="caption" color={colors.textMuted}>
                    {commentsError}
                  </ThemedText>
                  {commentTarget ? (
                    <Button size="sm" variant="secondary" onPress={() => void openComments(commentTarget)}>
                      Tentar novamente
                    </Button>
                  ) : null}
                </View>
              ) : comments.length === 0 ? (
                <View style={styles.commentEmpty}>
                  <Ionicons name="chatbubble-outline" size={36} color={colors.border} />
                  <ThemedText variant="body" style={styles.bold}>Nenhum comentário ainda</ThemedText>
                  <ThemedText variant="caption" color={colors.textMuted}>
                    Seja a primeira pessoa a comentar.
                  </ThemedText>
                </View>
              ) : (
                <ScrollView style={styles.commentList} showsVerticalScrollIndicator={false}>
                  {comments.map((comment, index) => (
                    <View key={comment.id}>
                      <View style={styles.commentItem}>
                        <Avatar name={getCommentAuthorName(comment)} size="sm" />
                        <View style={styles.commentBody}>
                          <ThemedText variant="body" style={styles.bold}>
                            {getCommentAuthorName(comment)}
                          </ThemedText>
                          <ThemedText variant="body">{comment.content}</ThemedText>
                          <ThemedText variant="caption" color={colors.textMuted}>
                            {formatDate(comment.createdAt)}
                          </ThemedText>
                        </View>
                      </View>
                      {index < comments.length - 1 ? <Divider /> : null}
                    </View>
                  ))}
                </ScrollView>
              )}

              <View style={[styles.commentInputRow, { borderColor: colors.border }]}>
                <TextInput
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder="Escreva um comentário..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.commentInput, { color: colors.text }]}
                />
                <Pressable
                  disabled={commentSubmitting || !commentText.trim()}
                  onPress={() => void submitComment()}
                  style={[
                    styles.commentSendButton,
                    { backgroundColor: commentText.trim() ? colors.primary : colors.surfaceMuted },
                  ]}>
                  <Ionicons name="send" size={18} color={commentText.trim() ? '#FFFFFF' : colors.icon} />
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenContainer>
  );
}
