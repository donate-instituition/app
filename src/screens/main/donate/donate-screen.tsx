import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Loading, ProgressBar, ScreenContainer, ThemedText } from '@/components';
import { useFetch } from '@/hooks/use-fetch';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { routes } from '@/navigation/routes';
import { campaignsService } from '@/services/campaigns';
import { donationsService } from '@/services/donations';
import { useAppStore } from '@/store';
import { theme } from '@/theme';

import { PRESET_AMOUNTS, styles } from './styles';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCents(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

function parseBRL(raw: string): number {
  // Accept "50", "50.00", "50,00"
  const clean = raw.replace(',', '.').replace(/[^\d.]/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100);
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function DonateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const authToken = useAppStore((state) => state.authToken);

  // ─── Campaign data ───────────────────────────────────────────────────────
  const fetcher = useCallback(() => campaignsService.getCampaignById(id), [id]);
  const { data: campaign, loading: campaignLoading } = useFetch(fetcher);

  // ─── Amount state ────────────────────────────────────────────────────────
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customRaw, setCustomRaw] = useState('');
  const [amountError, setAmountError] = useState('');

  // ─── Submission state ────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const [donatedAmount, setDonatedAmount] = useState(0);

  // ─── Derived amount ──────────────────────────────────────────────────────
  const amountCents: number =
    selectedPreset !== null
      ? selectedPreset
      : parseBRL(customRaw);

  function handlePresetSelect(cents: number) {
    setSelectedPreset(cents);
    setCustomRaw('');
    setAmountError('');
  }

  function handleCustomChange(text: string) {
    setSelectedPreset(null);
    setCustomRaw(text);
    setAmountError('');
  }

  async function handleDonate() {
    if (amountCents < 100) {
      setAmountError('O valor mínimo é R$ 1,00.');
      return;
    }
    if (amountCents > 10_000_00) {
      setAmountError('O valor máximo por doação é R$ 10.000,00.');
      return;
    }

    setApiError('');
    setSubmitting(true);

    try {
      // TODO: when backend is ready, just set EXPO_PUBLIC_API_URL — no code changes needed here
      await donationsService.createDonation({ campaignId: id, amountCents }, authToken);
      setDonatedAmount(amountCents);
      setSuccess(true);
    } catch {
      setApiError('Não foi possível processar sua doação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Success state ───────────────────────────────────────────────────────

  if (success) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <View style={[styles.backBar, { paddingTop: insets.top }]} />
        <View style={styles.successContainer}>
          <View style={[styles.successIcon, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="heart" size={48} color={colors.primary} />
          </View>
          <View style={styles.successText}>
            <ThemedText variant="title" style={styles.centered}>
              Doação realizada!
            </ThemedText>
            <ThemedText variant="body" color={colors.textMuted} style={styles.centered}>
              Sua doação de{' '}
              <ThemedText variant="body" color={colors.primary}>
                {formatCents(donatedAmount)}
              </ThemedText>{' '}
              foi registrada com sucesso. Obrigado por fazer a diferença! 💚
            </ThemedText>
          </View>
          <View style={styles.successActions}>
            <Button
              fullWidth
              onPress={() => router.replace(routes.appCampaignDetail(id))}>
              Ver campanha
            </Button>
            <Button
              fullWidth
              variant="secondary"
              onPress={() => router.replace(routes.appDashboard)}>
              Ir para o início
            </Button>
          </View>
        </View>
      </View>
    );
  }

  // ─── Loading state ───────────────────────────────────────────────────────

  if (campaignLoading) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <View style={[styles.backBar, { paddingTop: insets.top }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        </View>
        <Loading label="Carregando campanha..." />
      </View>
    );
  }

  // ─── Main form ───────────────────────────────────────────────────────────

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Fixed back bar */}
      <View style={[styles.backBar, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <ThemedText variant="subtitle">Fazer doação</ThemedText>
      </View>

      <ScreenContainer scrollable>
        <View style={styles.container}>

          {/* Campaign summary */}
          {campaign && (
            <Card variant="outlined">
              <View style={styles.summaryCard}>
                <ThemedText variant="body" color={colors.textMuted}>
                  {campaign.institution}
                </ThemedText>
                <ThemedText variant="subtitle">{campaign.title}</ThemedText>
                <View style={styles.progressRow}>
                  <ProgressBar value={campaign.progress} />
                  <View style={styles.metaRow}>
                    <ThemedText variant="caption" color={colors.primary}>
                      {campaign.raisedFormatted} arrecadados
                    </ThemedText>
                    <ThemedText variant="caption" color={colors.textMuted}>
                      Meta: {campaign.goalFormatted}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </Card>
          )}

          {/* Preset amounts */}
          <View style={styles.section}>
            <ThemedText variant="subtitle">Escolha um valor</ThemedText>
            <View style={styles.presetGrid}>
              {PRESET_AMOUNTS.map((cents) => {
                const isSelected = selectedPreset === cents;
                return (
                  <Pressable
                    key={cents}
                    style={[
                      styles.presetChip,
                      {
                        borderColor: isSelected ? colors.primary : colors.border,
                        backgroundColor: isSelected ? colors.primarySoft : colors.surface,
                      },
                    ]}
                    onPress={() => handlePresetSelect(cents)}>
                    <ThemedText
                      variant="body"
                      color={isSelected ? colors.primary : colors.text}>
                      {formatCents(cents)}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Custom amount */}
          <View style={styles.section}>
            <ThemedText variant="subtitle">Ou insira um valor</ThemedText>
            <View style={styles.customRow}>
              <ThemedText variant="body" color={colors.textMuted} style={styles.customPrefix}>
                R$
              </ThemedText>
              <TextInput
                style={[
                  styles.customInput,
                  {
                    borderWidth: theme.borderWidths.sm,
                    borderColor: amountError ? colors.danger : (selectedPreset === null && customRaw ? colors.primary : colors.border),
                    borderRadius: theme.radius.md,
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.md,
                    color: colors.text,
                    fontSize: 16,
                    backgroundColor: colors.surface,
                  },
                ]}
                value={customRaw}
                onChangeText={handleCustomChange}
                placeholder="0,00"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
            </View>
            {amountError ? (
              <ThemedText variant="caption" color={colors.danger}>
                {amountError}
              </ThemedText>
            ) : null}
          </View>

          {/* Total */}
          {amountCents > 0 && (
            <Card style={{ backgroundColor: colors.primarySoft }}>
              <View style={styles.totalCard}>
                <ThemedText variant="body" color={colors.primaryStrong}>
                  Total a ser doado
                </ThemedText>
                <ThemedText variant="title" color={colors.primary}>
                  {formatCents(amountCents)}
                </ThemedText>
              </View>
            </Card>
          )}

          {/* API error */}
          {apiError ? (
            <ThemedText variant="caption" color={colors.danger}>
              {apiError}
            </ThemedText>
          ) : null}

          {/* CTA */}
          <Button
            fullWidth
            loading={submitting}
            onPress={handleDonate}
            disabled={amountCents === 0}>
            Confirmar doação
          </Button>

        </View>
      </ScreenContainer>
    </View>
  );
}
