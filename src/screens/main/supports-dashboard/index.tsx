import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, View, type GestureResponderEvent } from 'react-native';

import { Button, Card, Divider, EmptyState, Loading, ScreenContainer, Tag, ThemedText } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFetch } from '@/hooks/use-fetch';
import { routes } from '@/navigation/routes';
import { campaignsService, type Campaign, type Institution } from '@/services/campaigns';
import { donationsService, donationStatusLabels, type Donation, type DonationStatus } from '@/services/donations';
import { followsService, type Follow } from '@/services/follows';
import { useAppStore } from '@/store';
import { theme } from '@/theme';

import { styles } from '../donations/styles';

type TagVariant = 'success' | 'warning' | 'danger' | 'neutral';

type DonorSupportData = {
  campaigns: Campaign[];
  donations: Donation[];
  follows: Follow[];
  institutions: Institution[];
};

function getStatusVariant(status: DonationStatus): TagVariant {
  switch (status) {
    case 'completed': return 'success';
    case 'processing': return 'warning';
    case 'pending': return 'warning';
    case 'failed': return 'danger';
    case 'cancelled': return 'danger';
    default: return 'neutral';
  }
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function sumCents(donations: Donation[]): string {
  const total = donations.reduce((acc, donation) => acc + donation.amountCents, 0);
  return `R$ ${(total / 100).toFixed(2).replace('.', ',')}`;
}

export function SupportsDashboardScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const authToken = useAppStore((state) => state.authToken);
  const router = useRouter();
  const [cancelingSubscriptionId, setCancelingSubscriptionId] = useState<string | null>(null);

  const fetcher = useCallback(async (): Promise<DonorSupportData> => {
    const [donations, follows, campaigns, institutions] = await Promise.all([
      donationsService.listMyDonations(authToken),
      followsService.listMyFollows(authToken),
      campaignsService.listCampaigns(),
      campaignsService.listInstitutions(),
    ]);

    return { campaigns, donations, follows, institutions };
  }, [authToken]);

  const { data, loading, error, refetch } = useFetch(fetcher);
  const donorDonations = data?.donations ?? [];
  const donorFollows = data?.follows ?? [];
  const followedInstitutions = data?.institutions.filter((institution) =>
    donorFollows.some((follow) => follow.targetType === 'INSTITUTION' && follow.targetId === institution.id),
  ) ?? [];
  const followedCampaigns = data?.campaigns.filter((campaign) =>
    donorFollows.some((follow) => follow.targetType === 'CAMPAIGN' && follow.targetId === campaign.id),
  ) ?? [];
  const completedDonations = donorDonations.filter((donation) => donation.status === 'completed');
  const totalDonated = data ? sumCents(completedDonations) : 'R$ 0,00';
  const campaignsSupported = new Set(donorDonations.map((donation) => donation.campaignId)).size;

  async function handleCancelSubscription(subscriptionId: string) {
    setCancelingSubscriptionId(subscriptionId);
    try {
      await donationsService.cancelStripeSubscription(subscriptionId, authToken);
      await refetch();
    } catch (error) {
      Alert.alert(
        'Não foi possível cancelar',
        error instanceof Error ? error.message : 'Tente novamente em instantes.',
      );
    } finally {
      setCancelingSubscriptionId(null);
    }
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.primaryStrong} />
          </Pressable>
          <ThemedText variant="title">Apoios</ThemedText>
          <ThemedText variant="caption" color={colors.textMuted}>
            Instituições, campanhas seguidas e seu histórico de doações.
          </ThemedText>
        </View>

        <View style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <Ionicons name="heart" size={24} color={colors.secondary} />
            <ThemedText variant="title">{loading ? '—' : totalDonated}</ThemedText>
            <ThemedText variant="caption" color={colors.textMuted}>Total doado</ThemedText>
          </Card>
          <Card style={styles.metricCard}>
            <Ionicons name="megaphone" size={24} color={colors.primary} />
            <ThemedText variant="title">{loading ? '—' : campaignsSupported}</ThemedText>
            <ThemedText variant="caption" color={colors.textMuted}>Campanhas apoiadas</ThemedText>
          </Card>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText variant="subtitle">Instituições que você segue</ThemedText>
            <ThemedText variant="caption" color={colors.textMuted}>{followedInstitutions.length}</ThemedText>
          </View>
          {followedInstitutions.length === 0 ? (
            <EmptyState
              title="Nenhuma instituição seguida"
              description="Siga instituições para acompanhar campanhas e novidades por aqui."
              illustration={<Ionicons name="business-outline" size={48} color={colors.border} />}
              action={<Button size="sm" variant="secondary" onPress={() => router.push(routes.donorCampaigns)}>Explorar instituições</Button>}
            />
          ) : (
            <View style={styles.followGrid}>
              {followedInstitutions.map((institution) => (
                <Pressable
                  key={institution.id}
                  style={[styles.followCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => router.push(routes.appInstitutionDetail(institution.id))}>
                  <View style={[styles.followIcon, { backgroundColor: colors.primarySoft }]}>
                    <Ionicons name="business-outline" size={22} color={colors.primary} />
                  </View>
                  <ThemedText variant="body" style={styles.bold} numberOfLines={2}>{institution.name}</ThemedText>
                  <ThemedText variant="caption" color={colors.textMuted} numberOfLines={1}>
                    {institution.city}, {institution.state}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText variant="subtitle">Campanhas seguidas</ThemedText>
            <ThemedText variant="caption" color={colors.textMuted}>{followedCampaigns.length}</ThemedText>
          </View>
          {followedCampaigns.length === 0 ? (
            <Card style={styles.emptyFollowCard}>
              <Ionicons name="heart-outline" size={28} color={colors.border} />
              <ThemedText variant="body" style={styles.bold}>Siga campanhas para doar depois</ThemedText>
            </Card>
          ) : (
            <View style={styles.list}>
              {followedCampaigns.map((campaign) => (
                <Pressable key={campaign.id} onPress={() => router.push(routes.appCampaignDetail(campaign.id))}>
                  <Card style={styles.followCampaignCard}>
                    <View style={styles.donationInfo}>
                      <ThemedText variant="body" style={styles.bold} numberOfLines={1}>{campaign.title}</ThemedText>
                      <ThemedText variant="caption" color={colors.textMuted} numberOfLines={1}>{campaign.institution}</ThemedText>
                    </View>
                    <Tag label={`${campaign.progress}%`} variant="success" />
                  </Card>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText variant="subtitle">Histórico</ThemedText>
          {loading && <Loading label="Carregando doações..." />}
          {error && (
            <EmptyState
              title="Não foi possível carregar"
              description={error}
              illustration={<Ionicons name="cloud-offline-outline" size={56} color={colors.border} />}
              action={<Button variant="secondary" size="sm" onPress={refetch}>Tentar novamente</Button>}
            />
          )}
          {!loading && !error && donorDonations.length === 0 && (
            <EmptyState
              title="Nenhuma doação ainda"
              description="Suas doações aparecerão aqui assim que você contribuir com uma campanha."
              illustration={<Ionicons name="heart-outline" size={56} color={colors.border} />}
            />
          )}
          {!loading && !error && donorDonations.length > 0 && (
            <Card>
              {donorDonations.map((item, index) => (
                <View key={item.id}>
                  <Pressable style={styles.donationItem} onPress={() => router.push(routes.appDonationDetail(item.id))}>
                    <View style={styles.donationInfo}>
                      <ThemedText variant="body" style={styles.bold}>{item.campaignTitle}</ThemedText>
                      <ThemedText variant="caption" color={colors.textMuted}>{item.institutionName}</ThemedText>
                      <ThemedText variant="caption" color={colors.textMuted}>{formatDate(item.createdAt)}</ThemedText>
                      {item.serviceFeeFormatted ? (
                        <ThemedText variant="caption" color={colors.textMuted}>
                          Taxa EloDoar: {item.serviceFeeFormatted} · Destinado: {item.netAmountFormatted}
                        </ThemedText>
                      ) : null}
                      {item.receiptNumber ? (
                        <ThemedText variant="caption" color={colors.textMuted}>Recibo {item.receiptNumber}</ThemedText>
                      ) : null}
                      {item.subscriptionId && item.subscriptionStatus !== 'canceled' ? (
                        <Pressable
                          style={[styles.cancelSubscriptionButton, { borderColor: colors.danger }]}
                          disabled={cancelingSubscriptionId === item.subscriptionId}
                          onPress={(event: GestureResponderEvent) => {
                            event.stopPropagation();
                            void handleCancelSubscription(item.subscriptionId!);
                          }}>
                          <Ionicons name="close-circle-outline" size={16} color={colors.danger} />
                          <ThemedText variant="caption" color={colors.danger} style={styles.bold}>
                            {cancelingSubscriptionId === item.subscriptionId ? 'Cancelando...' : 'Cancelar doação mensal'}
                          </ThemedText>
                        </Pressable>
                      ) : null}
                    </View>
                    <View style={styles.donationRight}>
                      <ThemedText variant="body" color={colors.primary} style={styles.bold}>{item.amountFormatted}</ThemedText>
                      {item.donationKind === 'monthly' ? (
                        <Tag
                          label={item.subscriptionStatus === 'canceled' ? 'Mensal cancelada' : 'Mensal'}
                          variant={item.subscriptionStatus === 'canceled' ? 'danger' : 'success'}
                        />
                      ) : null}
                      <Tag label={donationStatusLabels[item.status]} variant={getStatusVariant(item.status)} />
                    </View>
                  </Pressable>
                  {index < donorDonations.length - 1 && <Divider />}
                </View>
              ))}
            </Card>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
