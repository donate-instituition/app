import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { View } from 'react-native';

import { Button, Card, Divider, EmptyState, Loading, ScreenContainer, Tag, ThemedText } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFetch } from '@/hooks/use-fetch';
import { adminService, type AdminUser } from '@/services/admin';
import { donationsService, donationStatusLabels, type Donation, type DonationStatus } from '@/services/donations';
import { useActiveRole, useAppStore } from '@/store';
import { theme } from '@/theme';

import { styles } from './styles';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type TagVariant = 'success' | 'warning' | 'danger' | 'neutral';

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
  const total = donations.reduce((acc, d) => acc + d.amountCents, 0);
  return `R$ ${(total / 100).toFixed(2).replace('.', ',')}`;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function DonationsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const authToken = useAppStore((state) => state.authToken);
  const activeRole = useActiveRole();

  const fetcher = useCallback(
    () => {
      if (activeRole === 'platform-admin') return Promise.resolve([]);
      return donationsService.listMyDonations(authToken);
    },
    [activeRole, authToken]
  );
  const { data: donations, loading, error, refetch } = useFetch(fetcher);
  const adminUsers = useFetch(
    useCallback(() => {
      if (activeRole !== 'platform-admin') return Promise.resolve([]);
      return adminService.listUsers(authToken);
    }, [activeRole, authToken])
  );

  const completedDonations = donations?.filter((d) => d.status === 'completed') ?? [];
  const totalDonated = donations ? sumCents(completedDonations) : 'R$ 0,00';
  const campaignsSupported = new Set(donations?.map((d) => d.campaignId)).size;

  if (activeRole === 'platform-admin') {
    const users = (adminUsers.data ?? []) as AdminUser[];
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
                        <ThemedText variant="body" style={styles.bold}>
                          {item.fullName}
                        </ThemedText>
                        <ThemedText variant="caption" color={colors.textMuted}>
                          {item.email}
                        </ThemedText>
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

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>

        {/* Metrics */}
        <View style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <Ionicons name="heart" size={24} color={colors.secondary} />
            <ThemedText variant="title">{loading ? '—' : totalDonated}</ThemedText>
            <ThemedText variant="caption" color={colors.textMuted}>
              Total doado
            </ThemedText>
          </Card>
          <Card style={styles.metricCard}>
            <Ionicons name="megaphone" size={24} color={colors.primary} />
            <ThemedText variant="title">{loading ? '—' : campaignsSupported}</ThemedText>
            <ThemedText variant="caption" color={colors.textMuted}>
              Campanhas apoiadas
            </ThemedText>
          </Card>
        </View>

        {/* History */}
        <View style={styles.section}>
          <ThemedText variant="subtitle">Histórico</ThemedText>

          {loading && <Loading label="Carregando doações..." />}

          {error && (
            <EmptyState
              title="Não foi possível carregar"
              description={error}
              illustration={<Ionicons name="cloud-offline-outline" size={56} color={colors.border} />}
              action={
                <Button variant="secondary" size="sm" onPress={refetch}>
                  Tentar novamente
                </Button>
              }
            />
          )}

          {!loading && !error && (!donations || donations.length === 0) && (
            <EmptyState
              title="Nenhuma doação ainda"
              description="Suas doações aparecerão aqui assim que você contribuir com uma campanha."
              illustration={<Ionicons name="heart-outline" size={56} color={colors.border} />}
            />
          )}

          {!loading && !error && donations && donations.length > 0 && (
            <Card>
              {donations.map((item, index) => (
                <View key={item.id}>
                  <View style={styles.donationItem}>
                    <View style={styles.donationInfo}>
                      <ThemedText variant="body" style={styles.bold}>
                        {item.campaignTitle}
                      </ThemedText>
                      <ThemedText variant="caption" color={colors.textMuted}>
                        {item.institutionName}
                      </ThemedText>
                      <ThemedText variant="caption" color={colors.textMuted}>
                        {formatDate(item.createdAt)}
                      </ThemedText>
                    </View>
                    <View style={styles.donationRight}>
                      <ThemedText variant="body" color={colors.primary} style={styles.bold}>
                        {item.amountFormatted}
                      </ThemedText>
                      <Tag
                        label={donationStatusLabels[item.status]}
                        variant={getStatusVariant(item.status)}
                      />
                    </View>
                  </View>
                  {index < donations.length - 1 && <Divider />}
                </View>
              ))}
            </Card>
          )}
        </View>

      </View>
    </ScreenContainer>
  );
}
