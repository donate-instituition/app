import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Avatar, Button, Card, Divider, EmptyState, Loading, ScreenContainer, Tag, ThemedText } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFetch } from '@/hooks/use-fetch';
import { routes } from '@/navigation/routes';
import { adminService, type AdminUser } from '@/services/admin';
import { campaignsService, type Campaign } from '@/services/campaigns';
import { postsService, type FeedPost } from '@/services/posts';
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
    useCallback(async () => {
      if (activeRole !== 'platform-admin')
        return Promise.resolve({ data: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } });
      return adminService.listUsers(authToken);
    }, [activeRole, authToken])
  );

  if (activeRole === 'platform-admin') {
    const users = adminUsers.data?.data ?? [];
    const donorsCount = users.filter((item) => item.roles?.some((role) => role.name === 'DONOR')).length;
    const institutionStaffCount = users.filter((item) => item.roles?.some((role) => role.name === 'INSTITUTION_STAFF')).length;

    return (
      <ScreenContainer scrollable>
        <View style={styles.container}>
          <View style={styles.metricsGrid}>
            <Card style={styles.metricCard}>
              <Ionicons name="people" size={24} color={colors.primary} />
              <ThemedText variant="title">{adminUsers.loading ? '—' : users.length}</ThemedText>
              <ThemedText variant="caption" color={colors.textMuted}>Usuários</ThemedText>
            </Card>
            <Card style={styles.metricCard}>
              <Ionicons name="business" size={24} color={colors.secondary} />
              <ThemedText variant="title">{adminUsers.loading ? '—' : institutionStaffCount}</ThemedText>
              <ThemedText variant="caption" color={colors.textMuted}>Equipe instituições</ThemedText>
            </Card>
          </View>

          <View style={styles.section}>
            <ThemedText variant="subtitle">Usuários da plataforma</ThemedText>
            <ThemedText variant="caption" color={colors.textMuted}>
              {donorsCount} doadores · {institutionStaffCount} usuários institucionais
            </ThemedText>

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
              <Card>
                {users.map((item, index) => {
                  const primaryRole = item.roles?.some((role) => role.name === 'PLATFORM_ADMIN')
                    ? 'PLATFORM_ADMIN'
                    : item.roles?.some((role) => role.name === 'INSTITUTION_STAFF')
                      ? 'INSTITUTION_STAFF'
                      : 'DONOR';

                  return (
                    <View key={item.id ?? item._id ?? item.email}>
                      <View style={styles.donationItem}>
                        <View style={styles.donationInfo}>
                          <ThemedText variant="body" style={styles.bold}>{item.fullName}</ThemedText>
                          <ThemedText variant="caption" color={colors.textMuted}>{item.email}</ThemedText>
                        </View>
                        <Tag
                          label={primaryRole === 'DONOR' ? 'Doador' : primaryRole === 'INSTITUTION_STAFF' ? 'Instituição' : 'Admin'}
                          variant={primaryRole === 'PLATFORM_ADMIN' ? 'warning' : 'neutral'}
                        />
                      </View>
                      {index < users.length - 1 && <Divider />}
                    </View>
                  );
                })}
              </Card>
            )}
          </View>
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
              <View style={[styles.headerDot, { backgroundColor: colors.primary }]} />
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
                  {index > 0 && <Button size="sm" variant="secondary" style={styles.followSmall}>Seguir</Button>}
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
                  <ThemedText variant="body" color={colors.textMuted}>124 doações</ThemedText>
                  <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />
                  <ThemedText variant="body" color={colors.textMuted}>356 apoiadores</ThemedText>
                </View>
                <Button
                  fullWidth
                  variant={index === 0 ? 'secondary' : 'primary'}
                  onPress={() => router.push(routes.appDonate(campaign.id))}>
                  Doar agora
                </Button>
                <View style={styles.feedActions}>
                  <Pressable style={styles.feedAction}>
                    <Ionicons name="heart-outline" size={22} color={colors.icon} />
                    <ThemedText variant="body" color={colors.textMuted}>Curtir</ThemedText>
                  </Pressable>
                  <Pressable style={styles.feedAction}>
                    <Ionicons name="chatbubble-outline" size={22} color={colors.icon} />
                    <ThemedText variant="body" color={colors.textMuted}>Comentar</ThemedText>
                  </Pressable>
                  <Pressable style={styles.feedAction}>
                    <Ionicons name="paper-plane-outline" size={22} color={colors.icon} />
                    <ThemedText variant="body" color={colors.textMuted}>Compartilhar</ThemedText>
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
                  <Pressable style={styles.postAction}>
                    <Ionicons name="heart-outline" size={22} color={colors.icon} />
                    <ThemedText variant="caption" color={colors.textMuted}>{post.stats.likesCount ?? 0}</ThemedText>
                  </Pressable>
                  <Pressable style={styles.postAction}>
                    <Ionicons name="chatbubble-outline" size={20} color={colors.icon} />
                    <ThemedText variant="caption" color={colors.textMuted}>{post.stats.commentsCount ?? 0}</ThemedText>
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
      </View>
    </ScreenContainer>
  );
}
