import { Ionicons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Button, Card, Checkbox, FloatingTabBar, Loading, ProgressBar, ScreenContainer, Tag, ThemedText } from '@/components';
import { useFetch } from '@/hooks/use-fetch';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { routes } from '@/navigation/routes';
import { campaignsService } from '@/services/campaigns';
import { donationsService } from '@/services/donations';
import { useAppStore } from '@/store';
import { theme } from '@/theme';

import { PRESET_AMOUNTS, styles } from './styles';

type DonationStep = 'amount' | 'payment' | 'success';
type PaymentMethod = 'card' | 'pix';
type DonationKind = 'single' | 'monthly';

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

function formatCents(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

function formatCentsShort(cents: number): string {
  return `R$ ${(cents / 100).toFixed(0)}`;
}

function parseBRL(raw: string): number {
  const clean = raw.replace(',', '.').replace(/[^\d.]/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100);
}

const DONATE_TABS = [
  { key: 'dashboard', label: 'Início', icon: 'home-outline', activeIcon: 'home' },
  { key: 'campaigns', label: 'Explorar', icon: 'compass-outline', activeIcon: 'compass' },
  { key: 'donations', label: 'Doar', icon: 'heart-outline', activeIcon: 'heart' },
  { key: 'messages', label: 'Conversas', icon: 'chatbubble-outline', activeIcon: 'chatbubble' },
  { key: 'profile', label: 'Perfil', icon: 'person-outline', activeIcon: 'person' },
] as const;

export function DonateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const authToken = useAppStore((state) => state.authToken);
  const user = useAppStore((state) => state.user);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const fetcher = useCallback(() => campaignsService.getCampaignById(id), [id]);
  const { data: campaign, loading: campaignLoading } = useFetch(fetcher);

  const [step, setStep] = useState<DonationStep>('amount');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(12500);
  const [customRaw, setCustomRaw] = useState('125');
  const [amountError, setAmountError] = useState('');
  const [donationKind, setDonationKind] = useState<DonationKind>('single');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [coverFees, setCoverFees] = useState(false);
  const [savePaymentData, setSavePaymentData] = useState(true);
  const [receiptEmail, setReceiptEmail] = useState(user?.email ?? 'joao@email.com');
  const [cardNumber, setCardNumber] = useState('1234 1234 1234 1234');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [donatedAmount, setDonatedAmount] = useState(0);
  const [receiptPaymentIntentId, setReceiptPaymentIntentId] = useState('');

  const amountCents = selectedPreset !== null ? selectedPreset : parseBRL(customRaw);
  const receiptCode = '#INV2026-9F7A2B';

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

  function handleContinueToPayment() {
    if (amountCents < 100) {
      setAmountError('O valor mínimo é R$ 1,00.');
      return;
    }

    if (amountCents > 10_000_00) {
      setAmountError('O valor máximo por doação é R$ 10.000,00.');
      return;
    }

    setAmountError('');
    setStep('payment');
  }

  async function handleDonate() {
    setApiError('');

    if (!STRIPE_PUBLISHABLE_KEY) {
      setApiError('Configure EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY para ativar o pagamento com Stripe.');
      return;
    }

    if (donationKind === 'monthly') {
      setApiError('Doações mensais via Stripe serão ativadas no próximo passo.');
      return;
    }

    setSubmitting(true);

    try {
      const intent = await donationsService.createStripePaymentIntent(
        {
          amountCents,
          campaignId: id,
          paymentMethod,
          receiptEmail,
          savePaymentMethod: savePaymentData,
        },
        authToken,
      );

      const initResult = await initPaymentSheet({
        merchantDisplayName: 'EloDoar',
        paymentIntentClientSecret: intent.clientSecret,
        returnURL: 'elodoar://stripe-redirect',
        defaultBillingDetails: {
          email: receiptEmail,
          name: cardName || user?.name,
        },
      });

      if (initResult.error) {
        throw new Error(initResult.error.message);
      }

      const paymentResult = await presentPaymentSheet();

      if (paymentResult.error) {
        throw new Error(paymentResult.error.message);
      }

      const confirmed = await donationsService.confirmStripePaymentIntent(
        intent.payment.paymentIntentId,
        authToken,
      );

      if (confirmed.donation.status !== 'completed') {
        throw new Error('Pagamento ainda não foi confirmado pelo Stripe.');
      }

      setDonatedAmount(amountCents);
      setReceiptPaymentIntentId(confirmed.payment.paymentIntentId);
      setStep('success');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Não foi possível processar sua doação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  function renderHeader(title: string, rightIcon?: keyof typeof Ionicons.glyphMap) {
    return (
      <View style={[styles.backBar, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <Pressable
          onPress={() => (step === 'payment' ? setStep('amount') : router.back())}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <ThemedText variant="subtitle" style={styles.headerTitle}>{title}</ThemedText>
        <Pressable style={styles.headerIcon}>
          {rightIcon ? <Ionicons name={rightIcon} size={23} color={colors.text} /> : null}
        </Pressable>
      </View>
    );
  }

  if (campaignLoading) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        {renderHeader('Doar para campanha')}
        <Loading label="Carregando campanha..." />
      </View>
    );
  }

  if (step === 'success') {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <ScreenContainer scrollable>
          <View style={[styles.successScreen, { paddingTop: insets.top + theme.spacing.xl }]}>
            <View style={[styles.successIcon, { backgroundColor: colors.primary }]}>
              <Ionicons name="checkmark" size={44} color={colors.surface} />
            </View>
            <View style={styles.successText}>
              <ThemedText variant="title" style={styles.centered}>
                Doação realizada com sucesso!
              </ThemedText>
              <ThemedText variant="body" color={colors.textMuted} style={styles.centered}>
                Muito obrigado por transformar vidas. Sua solidariedade aquece o inverno de muitas crianças.
              </ThemedText>
            </View>

            <Card variant="elevated" style={styles.receiptCard}>
              <View style={styles.receiptHeader}>
                <ThemedText variant="caption" style={styles.bold}>Recibo de doação</ThemedText>
                <ThemedText variant="caption" color={colors.textMuted}>{receiptCode}</ThemedText>
              </View>
              <ThemedText variant="title" color={colors.primary}>
                {formatCents(donatedAmount)}
              </ThemedText>
              {[
                ['Campanha', campaign?.title ?? 'Inverno Solidário 2026'],
                ['Instituição', campaign?.institution ?? 'Casa Lar Esperança'],
                ['Data', '30/09/2026 · 09:41'],
                ['Status', 'Pago'],
                ['Processado com', 'stripe'],
                ['ID da transação', receiptPaymentIntentId || 'Aguardando Stripe'],
              ].map(([label, value]) => (
                <View key={label} style={styles.receiptRow}>
                  <ThemedText variant="body" color={colors.textMuted}>{label}</ThemedText>
                  <ThemedText
                    variant="body"
                    color={value === 'stripe' ? colors.info : colors.text}
                    style={[styles.receiptValue, value === 'Pago' && { color: colors.success }]}>
                    {value}
                  </ThemedText>
                </View>
              ))}
            </Card>

            <View style={styles.receiptActions}>
              {[
                ['Compartilhar', 'share-social-outline'],
                ['Ver recibo', 'document-text-outline'],
                ['Baixar PDF', 'download-outline'],
              ].map(([label, icon]) => (
                <Pressable
                  key={label}
                  style={[styles.receiptActionButton, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={20} color={colors.icon} />
                  <ThemedText variant="caption">{label}</ThemedText>
                </Pressable>
              ))}
            </View>

            <View style={[styles.volunteerCard, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name="heart-outline" size={34} color={colors.primary} />
              <View style={styles.volunteerText}>
                <ThemedText variant="body" style={styles.bold}>Deseja ser voluntário também?</ThemedText>
                <ThemedText variant="caption" color={colors.textMuted}>
                  Sua ajuda pode ir além da doação.
                </ThemedText>
                <ThemedText variant="caption" color={colors.primary} style={styles.bold}>
                  Quero saber mais
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </View>

            <Button
              fullWidth
              leftSlot={<Ionicons name="chatbubble-outline" size={18} color={colors.surface} />}>
              Enviar mensagem
            </Button>
            <Pressable onPress={() => router.replace(routes.appCampaignDetail(id))}>
              <ThemedText variant="body" color={colors.primary} style={styles.centered}>
                Voltar para a campanha
              </ThemedText>
            </Pressable>
            <View style={styles.tabSpacer} />
          </View>
        </ScreenContainer>
        <FloatingTabBar activeKey="donations" items={DONATE_TABS} />
      </View>
    );
  }

  if (step === 'payment') {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        {renderHeader('Pagamento seguro')}
        <ScreenContainer scrollable>
          <View style={styles.container}>
            <Card variant="elevated">
              <View style={styles.paymentSummary}>
                <View style={[styles.summaryThumb, { backgroundColor: colors.primarySoft }]}>
                  <Ionicons name="image-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.summaryText}>
                  <ThemedText variant="body" style={styles.bold} numberOfLines={1}>
                    {campaign?.title ?? 'Inverno Solidário 2026'}
                  </ThemedText>
                  <View style={styles.verifiedLine}>
                    <ThemedText variant="caption" color={colors.textMuted}>
                      {campaign?.institution ?? 'Casa Lar Esperança'}
                    </ThemedText>
                    <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                  </View>
                </View>
                <View style={styles.summaryAmount}>
                  <ThemedText variant="subtitle">{formatCents(amountCents)}</ThemedText>
                  <ThemedText variant="caption" color={colors.textMuted}>
                    Processado com <ThemedText variant="caption" color={colors.info} style={styles.bold}>stripe</ThemedText>
                  </ThemedText>
                </View>
              </View>
            </Card>

            <View style={styles.section}>
              <ThemedText variant="body" style={styles.bold}>Método de pagamento</ThemedText>
              <View style={styles.methodGrid}>
                {[
                  { key: 'card', label: 'Cartão', icon: 'card-outline' },
                  { key: 'pix', label: 'Pix', icon: 'qr-code-outline' },
                ].map((method) => {
                  const selected = paymentMethod === method.key;

                  return (
                    <Pressable
                      key={method.key}
                      style={[
                        styles.methodButton,
                        {
                          backgroundColor: selected ? colors.primarySoft : colors.surface,
                          borderColor: selected ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setPaymentMethod(method.key as PaymentMethod)}>
                      <Ionicons name={method.icon as keyof typeof Ionicons.glyphMap} size={20} color={colors.primary} />
                      <ThemedText variant="body" style={styles.bold}>{method.label}</ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText variant="caption" style={styles.bold}>Número do cartão</ThemedText>
              <TextInput
                allowFontScaling={false}
                style={[styles.textField, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="number-pad"
                placeholder="1234 1234 1234 1234"
                placeholderTextColor={colors.textMuted}
              />
              <View style={styles.cardMetaGrid}>
                <View style={styles.cardMetaField}>
                  <ThemedText variant="caption" style={styles.bold}>Validade (MM/AA)</ThemedText>
                  <TextInput
                    allowFontScaling={false}
                    style={[styles.textField, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    value={cardExpiry}
                    onChangeText={setCardExpiry}
                    placeholder="MM / AA"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={styles.cardMetaField}>
                  <ThemedText variant="caption" style={styles.bold}>CVC</ThemedText>
                  <TextInput
                    allowFontScaling={false}
                    style={[styles.textField, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    value={cardCvc}
                    onChangeText={setCardCvc}
                    keyboardType="number-pad"
                    placeholder="123"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
              <ThemedText variant="caption" style={styles.bold}>Nome no cartão</ThemedText>
              <TextInput
                allowFontScaling={false}
                style={[styles.textField, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                value={cardName}
                onChangeText={setCardName}
                placeholder="Como impresso no cartão"
                placeholderTextColor={colors.textMuted}
              />
              <ThemedText variant="caption" style={styles.bold}>E-mail para recibo</ThemedText>
              <TextInput
                allowFontScaling={false}
                style={[styles.textField, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                value={receiptEmail}
                onChangeText={setReceiptEmail}
                keyboardType="email-address"
                placeholder="joao@email.com"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={[styles.feeBox, { backgroundColor: colors.surfaceMuted }]}>
              <Checkbox
                checked={coverFees}
                onCheckedChange={setCoverFees}
                label="Quero cobrir as taxas"
                helperText="Sua doação será 100% destinada à causa."
              />
              <Ionicons name="information-circle-outline" size={20} color={colors.icon} />
            </View>

            <View style={styles.secureRow}>
              <Ionicons name="lock-closed" size={24} color={colors.primary} />
              <View>
                <ThemedText variant="body" style={styles.bold}>Pagamento seguro com Stripe</ThemedText>
                <ThemedText variant="caption" color={colors.textMuted}>Seus dados estão protegidos.</ThemedText>
              </View>
            </View>

            {apiError ? <ThemedText variant="caption" color={colors.danger}>{apiError}</ThemedText> : null}

            <Button
              fullWidth
              loading={submitting}
              leftSlot={<Ionicons name="lock-closed-outline" size={18} color={colors.surface} />}
              onPress={handleDonate}>
              {`Doar ${formatCentsShort(amountCents)}`}
            </Button>

            <Pressable
              style={styles.saveRow}
              onPress={() => setSavePaymentData((value) => !value)}>
              <Ionicons
                name={savePaymentData ? 'shield-checkmark-outline' : 'shield-outline'}
                size={18}
                color={colors.primary}
              />
              <ThemedText variant="body" color={colors.primary} style={styles.bold}>
                Salvar dados para próximas doações
              </ThemedText>
            </Pressable>
            <View style={styles.tabSpacer} />
          </View>
        </ScreenContainer>
        <FloatingTabBar activeKey="donations" items={DONATE_TABS} />
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      {renderHeader('Doar para campanha', 'heart-outline')}
      <ScreenContainer scrollable>
        <View style={styles.container}>
          <View style={[styles.campaignCover, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="image-outline" size={30} color={colors.primary} />
            <Tag label="Urgente" variant="success" style={styles.coverTag} />
          </View>

          <View style={styles.campaignIdentity}>
            <Avatar name={campaign?.institution} size="lg" />
            <View style={styles.campaignIdentityText}>
              <View style={styles.verifiedLine}>
                <ThemedText variant="subtitle">{campaign?.institution ?? 'Casa Lar Esperança'}</ThemedText>
                <Ionicons name="checkmark-circle" size={17} color={colors.success} />
              </View>
              <ThemedText variant="caption" color={colors.textMuted}>
                ONG · Recife, PE · Acolhimento de crianças e adolescentes
              </ThemedText>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText variant="subtitle">{campaign?.title ?? 'Inverno Solidário 2026'}</ThemedText>
            <ThemedText variant="body" color={colors.textMuted}>
              Doe cobertores e kits de inverno para crianças e adolescentes.
            </ThemedText>
            <View style={styles.progressHeader}>
              <ThemedText variant="body" color={colors.primary} style={styles.bold}>
                {campaign?.raisedFormatted ?? 'R$ 6.400'} arrecadados
              </ThemedText>
              <ThemedText variant="body" color={colors.primary} style={styles.bold}>
                {campaign?.progress ?? 64}%
              </ThemedText>
            </View>
            <ProgressBar value={campaign?.progress ?? 64} />
          </View>

          <View style={styles.section}>
            <ThemedText variant="body" style={styles.bold}>Escolha o valor da doação</ThemedText>
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
                    <ThemedText variant="body" style={styles.bold} color={isSelected ? colors.primary : colors.text}>
                      {cents === 0 ? 'Outro valor' : formatCentsShort(cents)}
                    </ThemedText>
                  </Pressable>
                );
              })}
              <Pressable
                style={[
                  styles.presetChip,
                  {
                    borderColor: selectedPreset === null ? colors.primary : colors.border,
                    backgroundColor: selectedPreset === null ? colors.primarySoft : colors.surface,
                  },
                ]}
                onPress={() => {
                  setSelectedPreset(null);
                  setCustomRaw(customRaw || '125');
                }}>
                <ThemedText variant="body" style={styles.bold} color={selectedPreset === null ? colors.primary : colors.text}>
                  Outro valor
                </ThemedText>
              </Pressable>
            </View>
            <View style={[styles.customAmountBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <ThemedText variant="caption" color={colors.textMuted}>Outro valor (R$)</ThemedText>
              <View style={styles.customAmountRow}>
                <View style={[styles.currencyBadge, { backgroundColor: colors.surfaceMuted }]}>
                  <ThemedText variant="caption" style={styles.bold}>R$</ThemedText>
                </View>
                <TextInput
                  allowFontScaling={false}
                  style={[styles.customAmountInput, { color: colors.text }]}
                  value={customRaw}
                  onChangeText={handleCustomChange}
                  keyboardType="decimal-pad"
                  placeholder="125"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
            {amountError ? <ThemedText variant="caption" color={colors.danger}>{amountError}</ThemedText> : null}
          </View>

          <View style={[styles.impactMessage, { backgroundColor: colors.primarySoft }]}>
            <View style={[styles.impactIcon, { backgroundColor: colors.surface }]}>
              <Ionicons name="heart-outline" size={24} color={colors.primary} />
            </View>
            <ThemedText variant="body" style={styles.impactCopy}>
              Com {formatCentsShort(amountCents || 12500)} você ajuda com cobertores e kits de inverno.
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText variant="body" style={styles.bold}>Tipo de doação</ThemedText>
            <View style={styles.methodGrid}>
              {[
                { key: 'single', label: 'Doação única', icon: 'heart-outline' },
                { key: 'monthly', label: 'Mensal', icon: 'calendar-outline' },
              ].map((kind) => {
                const selected = donationKind === kind.key;

                return (
                  <Pressable
                    key={kind.key}
                    style={[
                      styles.methodButton,
                      {
                        borderColor: selected ? colors.primary : colors.border,
                        backgroundColor: selected ? colors.primarySoft : colors.surface,
                      },
                    ]}
                    onPress={() => setDonationKind(kind.key as DonationKind)}>
                    <Ionicons name={kind.icon as keyof typeof Ionicons.glyphMap} size={20} color={colors.primary} />
                    <ThemedText variant="body" style={styles.bold}>{kind.label}</ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Button fullWidth onPress={handleContinueToPayment}>
            Continuar
          </Button>
          <View style={styles.tabSpacer} />
        </View>
      </ScreenContainer>
      <FloatingTabBar activeKey="donations" items={DONATE_TABS} />
    </View>
  );
}
