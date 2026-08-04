import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  Avatar,
  Button,
  Card,
  EmptyState,
  Input,
  Loading,
  ProgressBar,
  ScreenContainer,
  Tag,
  ThemedText,
} from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFetch } from '@/hooks/use-fetch';
import { routes } from '@/navigation/routes';
import { campaignsService, type Campaign, type PendingInstitution } from '@/services/campaigns';
import {
  donationsService,
  type Donation,
} from '@/services/donations';
import { followsService, type Follow } from '@/services/follows';
import { postsService, type FeedPost } from '@/services/posts';
import { useActiveRole, useAppStore } from '@/store';
import { theme } from '@/theme';

import { styles } from './styles';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

type DashboardData = {
  donations: Donation[];
  campaigns: Campaign[];
  follows: Follow[];
  pendingInstitutions: PendingInstitution[];
  posts: FeedPost[];
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export function DashboardScreen() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const activeRole = useActiveRole();
  const authToken = useAppStore((state) => state.authToken);
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const [postContent, setPostContent] = useState('');
  const [publishing, setPublishing] = useState(false);

  const fetcher = useCallback(async (): Promise<DashboardData> => {
    if (activeRole === 'platform-admin') {
      const [campaigns, pendingInstitutions] = await Promise.all([
        campaignsService.listCampaigns(),
        campaignsService.listPendingInstitutions(authToken),
      ]);

      return { donations: [], campaigns, follows: [], pendingInstitutions, posts: [] };
    }

    if (activeRole === 'institution-staff') {
      const campaigns = await campaignsService.listCampaigns();
      return { donations: [], campaigns, follows: [], pendingInstitutions: [], posts: [] };
    }

    const [donations, campaigns, follows, posts] = await Promise.all([
      donationsService.listMyDonations(authToken),
      campaignsService.listCampaigns(),
      followsService.listMyFollows(authToken),
      postsService.listFeed(authToken),
    ]);
    return { donations, campaigns, follows, pendingInstitutions: [], posts };
  }, [activeRole, authToken]);

  const { data, loading, error, refetch } = useFetch(fetcher);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch])
  );

const firstName = user?.name?.split(' ')[0] ?? 'Visitante';
  const pendingInstitutions = data?.pendingInstitutions ?? [];
  const institutionCampaigns = data?.campaigns ?? [];
  const activeInstitutionCampaigns = institutionCampaigns.filter((campaign) => campaign.active);
  const donorFeed = data?.posts ?? [];

  async function handleCreatePost() {
    const content = postContent.trim();
    if (!content || publishing) return;

    setPublishing(true);
    try {
      await postsService.createPost({ content, visibility: 'PUBLIC' }, authToken);
      setPostContent('');
      await refetch();
    } finally {
      setPublishing(false);
    }
  }

  if (activeRole === 'donor') {
    return (
      <ScreenContainer scrollable>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.homeHeaderRow}>
              <View style={styles.headerText}>
                <ThemedText variant="body" color={colors.textMuted}>Bem-vindo de volta, {firstName}!</ThemedText>
                <ThemedText variant="title">Início</ThemedText>
              </View>
              <View style={styles.homeHeaderActions}>
                <Pressable accessibilityRole="button" onPress={() => router.push(routes.appNotifications)} style={styles.homeIconButton}>
                  <Ionicons name="notifications-outline" size={30} color={colors.primaryStrong} />
                  <View style={[styles.homeDot, { backgroundColor: colors.primary }]} />
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => router.push(routes.donorMessages)} style={styles.homeIconButton}>
                  <Ionicons name="chatbubble-outline" size={30} color={colors.primaryStrong} />
                </Pressable>
              </View>
            </View>
            <ThemedText variant="caption" color={colors.textMuted}>
              Compartilhe atualizações e acompanhe novidades da comunidade.
            </ThemedText>
          </View>

          <Card style={styles.composerCard}>
            <View style={styles.postAuthor}>
              <Avatar name={user?.name} size="sm" />
              <View style={styles.postAuthorText}>
                <ThemedText variant="body" style={styles.bold}>{firstName}</ThemedText>
                <ThemedText variant="body" color={colors.textMuted}>
                  Compartilhe uma campanha, doação ou causa...
                </ThemedText>
              </View>
            </View>
            <Input
              multiline
              numberOfLines={3}
              placeholder="Compartilhe uma campanha, doação ou causa..."
              value={postContent}
              onChangeText={setPostContent}
              style={styles.composerInput}
            />
            <View style={styles.composerActions}>
              <View style={styles.composerQuickActions}>
                <Pressable style={styles.quickAction}>
                  <Ionicons name="image-outline" size={22} color={colors.icon} />
                  <ThemedText variant="body" color={colors.textMuted}>Foto / Vídeo</ThemedText>
                </Pressable>
                <Pressable style={styles.quickAction}>
                  <Ionicons name="heart-outline" size={22} color={colors.icon} />
                  <ThemedText variant="body" color={colors.textMuted}>Apoio</ThemedText>
                </Pressable>
                <Pressable style={styles.quickAction}>
                  <Ionicons name="calendar-outline" size={22} color={colors.icon} />
                  <ThemedText variant="body" color={colors.textMuted}>Evento</ThemedText>
                </Pressable>
              </View>
              <Button
                size="sm"
                onPress={handleCreatePost}
                disabled={!postContent.trim() || publishing}>
                {publishing ? 'Publicando...' : 'Publicar'}
              </Button>
            </View>
          </Card>

          {loading && <Loading label="Carregando início..." />}

          {error && (
            <EmptyState
              title="Não foi possível carregar"
              description={error}
              illustration={<Ionicons name="cloud-offline-outline" size={56} color={colors.border} />}
              action={<Button variant="secondary" onPress={refetch}>Tentar novamente</Button>}
            />
          )}

          {!loading && !error ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText variant="subtitle">Feed recente</ThemedText>
                <Pressable onPress={() => router.push(routes.donorCampaigns)}>
                  <ThemedText variant="caption" color={colors.primary}>Explorar</ThemedText>
                </Pressable>
              </View>

              {donorFeed.length === 0 ? (
                <Card style={styles.emptyPostCard}>
                  <Ionicons name="sparkles-outline" size={32} color={colors.border} />
                  <ThemedText variant="body" style={styles.bold}>
                    Nenhuma novidade ainda
                  </ThemedText>
                  <ThemedText variant="caption" color={colors.textMuted}>
                    Siga pessoas, campanhas e instituições para movimentar seu feed.
                  </ThemedText>
                </Card>
              ) : (
                <View style={styles.list}>
                  {donorFeed.map((post) => (
                    <Card key={post.id} style={styles.homeFeedCard}>
                      <View style={styles.postAuthor}>
                        <Avatar name={post.authorType === 'USER' ? 'Doador' : 'Lar Aconchego'} size="sm" />
                        <View style={styles.postAuthorText}>
                          <ThemedText variant="body" style={styles.bold} numberOfLines={1}>
                            {post.authorType === 'USER' ? 'Doador' : 'Lar Aconchego'}
                          </ThemedText>
                          <ThemedText variant="caption" color={colors.textMuted}>
                            {formatDate(post.createdAt)}
                          </ThemedText>
                        </View>
                        <Ionicons name="ellipsis-horizontal" size={20} color={colors.icon} />
                      </View>
                      <ThemedText variant="body">{post.content}</ThemedText>
                      {post.campaignId ? (
                        <Pressable
                          style={[styles.feedCampaignLink, { backgroundColor: colors.primarySoft }]}
                          onPress={() => router.push(routes.appCampaignDetail(post.campaignId!))}>
                          <Ionicons name="megaphone-outline" size={22} color={colors.primary} />
                          <ThemedText variant="body" color={colors.primary} style={styles.bold}>
                            Ver campanha relacionada
                          </ThemedText>
                        </Pressable>
                      ) : null}
                      <View style={styles.postStats}>
                        <ThemedText variant="caption" color={colors.textMuted}>
                          {post.stats.likesCount ?? 0} curtidas
                        </ThemedText>
                        <ThemedText variant="caption" color={colors.textMuted}>
                          {post.stats.commentsCount ?? 0} comentários
                        </ThemedText>
                      </View>
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
                </View>
              )}
            </View>
          ) : null}
        </View>
      </ScreenContainer>
    );
  }

  async function handleApproveInstitution(id: string) {
    await campaignsService.approveInstitution(id, authToken);
    void refetch();
  }

  async function handleRejectInstitution(id: string) {
    await campaignsService.rejectInstitution(id, authToken);
    void refetch();
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        {/* Header de saudação */}
        <View style={styles.greeting}>
          <View style={styles.greetingRow}>
            <View style={styles.greetingText}>
              <ThemedText variant="caption" color={colors.textMuted}>
                Bem-vindo de volta 👋
              </ThemedText>
              <ThemedText variant="title" numberOfLines={1}>
                {firstName}
              </ThemedText>
            </View>
            <Avatar name={user?.name} size="md" />
          </View>
        </View>

        {loading && <Loading label="Carregando início..." />}

        {error && (
          <EmptyState
            title="Não foi possível carregar"
            description={error}
            illustration={<Ionicons name="cloud-offline-outline" size={56} color={colors.border} />}
            action={<Button variant="secondary" onPress={refetch}>Tentar novamente</Button>}
          />
        )}

        {!loading && !error && activeRole === 'platform-admin' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText variant="subtitle">Instituições em análise</ThemedText>
              <Tag label={String(pendingInstitutions.length)} variant="warning" />
            </View>

            {pendingInstitutions.length === 0 ? (
              <EmptyState
                title="Sem cadastros pendentes"
                description="Novas instituições aparecerão aqui para validação."
                illustration={<Ionicons name="shield-checkmark-outline" size={40} color={colors.border} />}
              />
            ) : (
              <View style={styles.list}>
                {pendingInstitutions.map((institution) => (
                  <Card key={institution.id} variant="outlined">
                    <View style={styles.adminInstitution}>
                      <View style={styles.adminInstitutionInfo}>
                        <ThemedText variant="body" style={styles.bold}>
                          {institution.name}
                        </ThemedText>
                        <ThemedText variant="caption" color={colors.textMuted}>
                          CNPJ {institution.cnpj}
                        </ThemedText>
                        <ThemedText variant="caption" color={colors.textMuted}>
                          {institution.email}
                        </ThemedText>
                      </View>
                      <View style={styles.adminActions}>
                        <Button
                          size="sm"
                          variant="secondary"
                          onPress={() => handleRejectInstitution(institution.id)}>
                          Rejeitar
                        </Button>
                        <Button
                          size="sm"
                          onPress={() => handleApproveInstitution(institution.id)}>
                          Aprovar
                        </Button>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            )}
          </View>
        )}

        {!loading && !error && activeRole === 'platform-admin' && (
          <View style={styles.section}>
            <View style={styles.grid}>
              <Card style={styles.metric}>
                <ThemedText variant="caption" color={colors.textMuted}>
                  Instituições pendentes
                </ThemedText>
                <ThemedText variant="title">{pendingInstitutions.length}</ThemedText>
              </Card>
              <Card style={styles.metric}>
                <ThemedText variant="caption" color={colors.textMuted}>
                  Campanhas na plataforma
                </ThemedText>
                <ThemedText variant="title">{institutionCampaigns.length}</ThemedText>
              </Card>
            </View>
          </View>
        )}

        {!loading && !error && activeRole === 'institution-staff' && (
          <View style={styles.section}>
            <View style={styles.institutionPanelHeader}>
              <View>
                <ThemedText variant="caption" color={colors.textMuted}>
                  Últimos 30 dias
                </ThemedText>
                <ThemedText variant="title">
                  {user?.name ?? 'Casa Lar Esperança'}
                </ThemedText>
              </View>
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
            </View>
            <View style={styles.grid}>
              <Card style={styles.metric} variant="elevated">
                <Ionicons name="trending-up-outline" size={18} color={colors.primary} />
                <ThemedText variant="caption" color={colors.textMuted}>
                  arrecadados no mês
                </ThemedText>
                <ThemedText variant="title">
                  R$ {(institutionCampaigns.reduce((sum, campaign) => sum + campaign.raisedCents, 0) / 100).toFixed(0)}
                </ThemedText>
              </Card>
              <Card style={styles.metric} variant="elevated">
                <Ionicons name="people-outline" size={18} color={colors.primary} />
                <ThemedText variant="caption" color={colors.textMuted}>
                  novos doadores
                </ThemedText>
                <ThemedText variant="title">214</ThemedText>
              </Card>
              <Card style={styles.metric} variant="elevated">
                <Ionicons name="radio-button-on-outline" size={18} color={colors.primary} />
                <ThemedText variant="caption" color={colors.textMuted}>
                  campanhas ativas
                </ThemedText>
                <ThemedText variant="title">{activeInstitutionCampaigns.length}</ThemedText>
              </Card>
              <Card style={styles.metric} variant="elevated">
                <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
                <ThemedText variant="caption" color={colors.textMuted}>
                  mensagens não lidas
                </ThemedText>
                <ThemedText variant="title">9</ThemedText>
              </Card>
            </View>
            <Card variant="elevated">
              <View style={styles.chartCard}>
                <ThemedText variant="body" style={styles.bold}>
                  Desempenho das campanhas
                </ThemedText>
                <View style={styles.chartBars}>
                  {[32, 58, 76, 42, 88, 64, 100].map((height, index) => (
                    <View
                      key={index}
                      style={[
                        styles.chartBar,
                        {
                          height,
                          backgroundColor: colors.primary,
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>
            </Card>
            <Pressable onPress={() => router.push(routes.institutionCampaigns)}>
              <Card variant="elevated">
                <View style={styles.accountabilityRow}>
                  <View>
                    <ThemedText variant="body" style={styles.bold}>
                      Prestações de contas pendentes
                    </ThemedText>
                    <ThemedText variant="caption" color={colors.textMuted}>
                      3 comprovantes aguardando envio
                    </ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </View>
              </Card>
            </Pressable>
          </View>
        )}

        {!loading && !error && activeRole === 'institution-staff' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText variant="subtitle" style={styles.sectionTitle} numberOfLines={1}>
                Campanhas da instituição
              </ThemedText>
              <Pressable onPress={() => router.push(routes.institutionCampaigns)}>
                <ThemedText variant="caption" color={colors.primary} style={styles.sectionAction} numberOfLines={1}>
                  Gerenciar
                </ThemedText>
              </Pressable>
            </View>

            {institutionCampaigns.length === 0 ? (
              <EmptyState
                title="Nenhuma campanha criada"
                description="As campanhas da instituição aparecerão aqui."
                illustration={<Ionicons name="megaphone-outline" size={40} color={colors.border} />}
              />
            ) : (
              <View style={styles.list}>
                {institutionCampaigns.slice(0, 3).map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => router.push(routes.appCampaignDetail(item.id))}>
                    <Card variant="outlined">
                      <View style={styles.campaignCard}>
                        <View style={styles.campaignHeader}>
                          <View style={styles.campaignInfo}>
                            <ThemedText variant="body" style={styles.bold} numberOfLines={1}>
                              {item.title}
                            </ThemedText>
                            <ThemedText variant="caption" color={colors.textMuted} numberOfLines={1}>
                              {item.active ? 'Ativa' : 'Inativa'} · {item.progress}% da meta
                            </ThemedText>
                          </View>
                          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                        </View>
                        <ProgressBar value={item.progress} />
                      </View>
                    </Card>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}

      </View>
    </ScreenContainer>
  );
}
