import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, View } from 'react-native';

import {
  Avatar,
  Button,
  Card,
  Divider,
  EmptyState,
  Loading,
  ProgressBar,
  ScreenContainer,
  Tag,
  ThemedText,
} from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFetch } from '@/hooks/use-fetch';
import { routes } from '@/navigation/routes';
import { campaignsService, type Campaign } from '@/services/campaigns';
import {
  donationStatusLabels,
  donationsService,
  type Donation,
  type DonationStatus,
} from '@/services/donations';
import { useAppStore } from '@/store';
import { theme } from '@/theme';

import { styles } from './styles';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type TagVariant = 'success' | 'warning' | 'danger' | 'neutral';

function getStatusVariant(status: DonationStatus): TagVariant {
  switch (status) {
    case 'completed':
      return 'success';
    case 'processing':
    case 'pending':
      return 'warning';
    case 'failed':
    case 'cancelled':
      return 'danger';
    default:
      return 'neutral';
  }
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function pickFeaturedCampaign(campaigns: Campaign[]): Campaign | null {
  const active = campaigns.filter((c) => c.active);
  if (active.length === 0) return null;
  return [...active].sort((a, b) => b.progress - a.progress)[0];
}

function pickSuggestedCampaigns(campaigns: Campaign[], featuredId?: string): Campaign[] {
  return campaigns
    .filter((c) => c.active && c.id !== featuredId)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 2);
}

type DashboardData = {
  donations: Donation[];
  campaigns: Campaign[];
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export function DashboardScreen() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const authToken = useAppStore((state) => state.authToken);
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  const fetcher = useCallback(async (): Promise<DashboardData> => {
    const [donations, campaigns] = await Promise.all([
      donationsService.listMyDonations(authToken),
      campaignsService.listCampaigns(),
    ]);
    return { donations, campaigns };
  }, [authToken]);

  const { data, loading, error, refetch } = useFetch(fetcher);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch])
  );

  const firstName = user?.name?.split(' ')[0] ?? 'Visitante';
  const recentDonations = data?.donations.slice(0, 2) ?? [];
  const featuredCampaign = data ? pickFeaturedCampaign(data.campaigns) : null;
  const suggestedCampaigns = data
    ? pickSuggestedCampaigns(data.campaigns, featuredCampaign?.id)
    : [];

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
              <ThemedText variant="title">{firstName}</ThemedText>
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

        {!loading && !error && featuredCampaign && (
          <Pressable onPress={() => router.push(routes.appCampaignDetail(featuredCampaign.id))}>
            <Card style={[styles.banner, { backgroundColor: colors.primary }]} padding="lg">
              <View style={styles.bannerContent}>
                <Tag label="Em destaque" variant="neutral" />
                <ThemedText variant="subtitle" color={colors.surface}>
                  {featuredCampaign.title}
                </ThemedText>
                <ThemedText variant="body" color={colors.primarySoft}>
                  {featuredCampaign.institution} — {featuredCampaign.progress}% da meta atingida.
                </ThemedText>
                <View style={styles.bannerProgress}>
                  <ProgressBar
                    value={featuredCampaign.progress}
                    trackColor="rgba(255,255,255,0.25)"
                    fillColor="rgba(255,255,255,0.9)"
                  />
                  <ThemedText variant="caption" color={colors.primarySoft}>
                    {featuredCampaign.raisedFormatted} de {featuredCampaign.goalFormatted}
                  </ThemedText>
                </View>
              </View>
            </Card>
          </Pressable>
        )}

        {!loading && !error && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText variant="subtitle">Minhas doações</ThemedText>
              <Pressable onPress={() => router.push('/donations')}>
                <ThemedText variant="caption" color={colors.primary}>
                  Ver todas
                </ThemedText>
              </Pressable>
            </View>

            {recentDonations.length === 0 ? (
              <EmptyState
                title="Nenhuma doação ainda"
                description="Suas doações recentes aparecerão aqui."
                illustration={<Ionicons name="heart-outline" size={40} color={colors.border} />}
              />
            ) : (
              <View style={styles.list}>
                {recentDonations.map((item, index) => (
                  <View key={item.id}>
                    <Pressable onPress={() => router.push(routes.appCampaignDetail(item.campaignId))}>
                      <View style={styles.donationItem}>
                        <View style={styles.donationIcon}>
                          <Ionicons name="heart" size={18} color={colors.secondary} />
                        </View>
                        <View style={styles.donationInfo}>
                          <ThemedText variant="body" style={styles.bold}>
                            {item.campaignTitle}
                          </ThemedText>
                          <ThemedText variant="caption" color={colors.textMuted}>
                            {item.institutionName}
                          </ThemedText>
                          <View style={styles.donationMeta}>
                            <ThemedText variant="caption" color={colors.primary}>
                              {item.amountFormatted}
                            </ThemedText>
                            <ThemedText variant="caption" color={colors.textMuted}>
                              · {formatDate(item.createdAt)}
                            </ThemedText>
                          </View>
                        </View>
                        <Tag
                          label={donationStatusLabels[item.status]}
                          variant={getStatusVariant(item.status)}
                        />
                      </View>
                    </Pressable>
                    {index < recentDonations.length - 1 && <Divider />}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {!loading && !error && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText variant="subtitle">Campanhas para você</ThemedText>
              <Pressable onPress={() => router.push('/campaigns')}>
                <ThemedText variant="caption" color={colors.primary}>
                  Explorar
                </ThemedText>
              </Pressable>
            </View>

            {suggestedCampaigns.length === 0 ? (
              <EmptyState
                title="Nenhuma campanha disponível"
                description="Novas campanhas aparecerão aqui em breve."
                illustration={<Ionicons name="megaphone-outline" size={40} color={colors.border} />}
              />
            ) : (
              <View style={styles.list}>
                {suggestedCampaigns.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => router.push(routes.appCampaignDetail(item.id))}>
                    <Card variant="outlined">
                      <View style={styles.campaignCard}>
                        <View style={styles.campaignHeader}>
                          <View style={styles.campaignInfo}>
                            <ThemedText variant="body" style={styles.bold}>
                              {item.title}
                            </ThemedText>
                            <ThemedText variant="caption" color={colors.textMuted}>
                              {item.institution}
                            </ThemedText>
                          </View>
                          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                        </View>
                        <ProgressBar value={item.progress} />
                        <View style={styles.campaignMeta}>
                          <ThemedText variant="caption" color={colors.primary}>
                            {item.raisedFormatted}
                          </ThemedText>
                          <ThemedText variant="caption" color={colors.textMuted}>
                            de {item.goalFormatted}
                          </ThemedText>
                        </View>
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
