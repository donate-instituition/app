import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert, Linking, Pressable, Share, View } from 'react-native';

import { Button, Card, EmptyState, Loading, ScreenContainer, Tag, ThemedText } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFetch } from '@/hooks/use-fetch';
import { API_BASE_URL } from '@/services/api';
import { donationsService, donationStatusLabels, type DonationStatus } from '@/services/donations';
import { useAppStore } from '@/store';
import { theme } from '@/theme';

import { styles } from './styles';

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

function getStatusIcon(status: DonationStatus): keyof typeof Ionicons.glyphMap {
  if (status === 'completed') return 'checkmark';
  if (status === 'failed' || status === 'cancelled') return 'close';
  return 'time-outline';
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function resolveUrl(pathOrUrl?: string) {
  if (!pathOrUrl) return undefined;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${API_BASE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

export function DonationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const authToken = useAppStore((state) => state.authToken);

  const fetcher = useCallback(
    () => donationsService.getDonationById(id, authToken),
    [authToken, id],
  );
  const { data: donation, loading, error, refetch } = useFetch(fetcher);
  const receiptUrl = resolveUrl(donation?.receiptUrl);

  async function handleShare() {
    if (!donation) return;

    await Share.share({
      message: `Eu doei ${donation.amountFormatted} para ${donation.campaignTitle} no EloDoar.`,
      title: 'Doação EloDoar',
    });
  }

  async function handleOpenReceipt() {
    if (!receiptUrl) {
      Alert.alert(
        'Recibo em processamento',
        'O recibo será liberado assim que o worker terminar de gerar o PDF.',
      );
      return;
    }

    const canOpen = await Linking.canOpenURL(receiptUrl);
    if (!canOpen) {
      Alert.alert('Não foi possível abrir', 'Tente novamente em instantes.');
      return;
    }

    await Linking.openURL(receiptUrl);
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <Pressable
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>

        {loading ? <Loading label="Carregando doação..." /> : null}

        {error ? (
          <EmptyState
            title="Não foi possível carregar"
            description={error}
            illustration={<Ionicons name="cloud-offline-outline" size={56} color={colors.border} />}
            action={<Button variant="secondary" size="sm" onPress={refetch}>Tentar novamente</Button>}
          />
        ) : null}

        {!loading && !error && donation ? (
          <>
            <View style={styles.hero}>
              <View style={[styles.statusIcon, { backgroundColor: colors.primary }]}>
                <Ionicons name={getStatusIcon(donation.status)} size={42} color={colors.surface} />
              </View>
              <View style={styles.header}>
                <ThemedText variant="title" style={styles.centered}>
                  Detalhes da doação
                </ThemedText>
                <ThemedText variant="body" color={colors.textMuted} style={styles.centered}>
                  Acompanhe o pagamento, recibo e valores da contribuição.
                </ThemedText>
              </View>
              <Tag label={donationStatusLabels[donation.status]} variant={getStatusVariant(donation.status)} />
            </View>

            <Card variant="elevated" style={styles.receiptCard}>
              <View style={styles.receiptHeader}>
                <ThemedText variant="caption" style={styles.bold}>Recibo de doação</ThemedText>
                <ThemedText variant="caption" color={colors.textMuted}>
                  {donation.receiptNumber ?? 'Processando'}
                </ThemedText>
              </View>

              <ThemedText variant="title" color={colors.primary}>
                {donation.amountFormatted}
              </ThemedText>

              {[
                ['Campanha', donation.campaignTitle],
                ['Instituição', donation.institutionName],
                ['Tipo', donation.donationKind === 'monthly' ? 'Mensal' : 'Única'],
                ['Taxa EloDoar', donation.serviceFeeFormatted ?? 'R$ 0,00'],
                ['Valor destinado', donation.netAmountFormatted ?? donation.amountFormatted],
                ['Data', formatDateTime(donation.createdAt)],
                ['Status', donationStatusLabels[donation.status]],
              ].map(([label, value]) => (
                <View key={label} style={styles.row}>
                  <ThemedText variant="body" color={colors.textMuted}>{label}</ThemedText>
                  <ThemedText variant="body" color={colors.text} style={styles.rowValue}>
                    {value}
                  </ThemedText>
                </View>
              ))}
            </Card>

            <View style={styles.actions}>
              <Pressable
                style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={handleShare}>
                <Ionicons name="share-social-outline" size={22} color={colors.primary} />
                <ThemedText variant="caption" style={styles.bold}>Compartilhar</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={handleOpenReceipt}>
                <Ionicons name="document-text-outline" size={22} color={colors.primary} />
                <ThemedText variant="caption" style={styles.bold}>Ver recibo</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={handleOpenReceipt}>
                <Ionicons name="download-outline" size={22} color={colors.primary} />
                <ThemedText variant="caption" style={styles.bold}>PDF</ThemedText>
              </Pressable>
            </View>

            {donation.subscriptionId ? (
              <Card variant="outlined" style={styles.section}>
                <ThemedText variant="body" style={styles.bold}>Assinatura</ThemedText>
                <View style={styles.row}>
                  <ThemedText variant="body" color={colors.textMuted}>Status</ThemedText>
                  <ThemedText variant="body" style={styles.rowValue}>
                    {donation.subscriptionStatus === 'canceled' ? 'Cancelada' : 'Ativa'}
                  </ThemedText>
                </View>
              </Card>
            ) : null}
          </>
        ) : null}
      </View>
    </ScreenContainer>
  );
}
