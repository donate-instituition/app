import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import {
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
import {
  campaignsService,
  type Campaign,
  type CampaignCategory,
  type CampaignFilters,
  type Institution,
  type PendingInstitution,
} from '@/services/campaigns';
import { institutionStaffService } from '@/services/institution-staff';
import { logger } from '@/services/logger';
import { useActiveRole, useAppStore } from '@/store';
import { theme } from '@/theme';

import { styles } from './styles';

// ─── Constants ────────────────────────────────────────────────────────────────

const CAMPAIGN_CATEGORIES: (CampaignCategory | 'Todos')[] = [
  'Todos',
  'Educação',
  'Alimentação',
  'Saúde',
  'Moradia',
  'Meio Ambiente',
];

type Mode = 'campaigns' | 'institutions';

const exploreLogger = logger.child('Explore');

const campaignImages: Partial<Record<CampaignCategory, string>> = {
  Alimentação:
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=360&q=80',
  Educação:
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=360&q=80',
  Moradia:
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=360&q=80',
  Saúde:
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=360&q=80',
  'Meio Ambiente':
    'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=360&q=80',
  Outros:
    'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?auto=format&fit=crop&w=360&q=80',
};

function getCampaignImage(item: Campaign) {
  if (item.title.toLowerCase().includes('inverno')) {
    return 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=360&q=80';
  }

  if (item.title.toLowerCase().includes('escolar')) {
    return 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=360&q=80';
  }

  return campaignImages[item.category] ?? campaignImages.Outros;
}

function getInstitutionIcon(category: CampaignCategory) {
  const icons: Record<CampaignCategory, keyof typeof Ionicons.glyphMap> = {
    Alimentação: 'restaurant-outline',
    Educação: 'school-outline',
    'Meio Ambiente': 'leaf-outline',
    Moradia: 'home-outline',
    Outros: 'business-outline',
    Saúde: 'medkit-outline',
  };

  return icons[category];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type ModeToggleProps = {
  mode: Mode;
  onChange: (m: Mode) => void;
};

function ModeToggle({ mode, onChange }: ModeToggleProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  return (
    <View style={[styles.modeToggle, { backgroundColor: colors.surfaceMuted }]}>
      {(['campaigns', 'institutions'] as Mode[]).map((m) => {
        const active = mode === m;
        return (
          <Pressable
            key={m}
            style={[
              styles.modeButton,
              active && [
                styles.modeButtonActive,
                {
                  backgroundColor: colors.surface,
                  shadowColor: colors.primaryStrong,
                },
              ],
            ]}
            onPress={() => onChange(m)}>
              <ThemedText
                variant="caption"
                style={[styles.modeButtonText, active && styles.modeButtonTextActive]}
                color={active ? colors.primary : colors.textMuted}
                numberOfLines={1}>
              {m === 'campaigns' ? 'Campanhas' : 'Instituições'}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

type CampaignCardProps = { item: Campaign; onPress: () => void };

function CampaignCard({ item, onPress }: CampaignCardProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  return (
    <Pressable onPress={onPress}>
      <Card variant="elevated" style={styles.exploreCard}>
        <View style={styles.campaignCard}>
          <View style={[styles.campaignThumb, { backgroundColor: colors.primarySoft }]}>
            <Image
              source={getCampaignImage(item)}
              style={styles.campaignImage}
              contentFit="cover"
              transition={150}
            />
          </View>
          <View style={styles.campaignInfo}>
            <View style={styles.cardHeader}>
              <ThemedText variant="subtitle" style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </ThemedText>
              {!item.active ? <Tag label="Encerrada" variant="neutral" /> : null}
            </View>
            <View style={styles.metaLine}>
              <View style={[styles.metaIcon, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="business-outline" size={14} color={colors.textMuted} />
              </View>
              <ThemedText variant="body" color={colors.textMuted} numberOfLines={1} style={styles.metaText}>
                {item.institution}
              </ThemedText>
            </View>
            <ProgressBar value={item.progress} />
            <View style={styles.goalRow}>
              <ThemedText variant="body" color={colors.primary} style={styles.bold}>
                {item.progress}%
              </ThemedText>
              <ThemedText
                variant="caption"
                color={colors.textMuted}
                style={styles.goalText}
                numberOfLines={1}>
                meta {item.goalFormatted}
              </ThemedText>
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

type InstitutionCardProps = { item: Institution; onPress: () => void };

function InstitutionCard({ item, onPress }: InstitutionCardProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  return (
    <Pressable onPress={onPress}>
      <Card variant="elevated" style={styles.exploreCard}>
        <View style={styles.institutionCard}>
          <View style={[styles.institutionAvatar, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name={getInstitutionIcon(item.category)} size={34} color={colors.primary} />
          </View>
          <View style={styles.institutionInfo}>
            <View style={styles.institutionTopRow}>
              <Tag label={item.category} variant="info" />
              {item.verified ? (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <ThemedText variant="body" color={colors.success} numberOfLines={1}>
                    Verificada
                  </ThemedText>
                </View>
              ) : null}
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>
            <ThemedText variant="subtitle" numberOfLines={2}>
              {item.name}
            </ThemedText>
            <View style={styles.institutionMeta}>
              <Ionicons name="location-outline" size={15} color={colors.textMuted} />
              <ThemedText variant="body" color={colors.textMuted} numberOfLines={1}>
                {item.city}, {item.state}
              </ThemedText>
            </View>
            <ThemedText variant="body" color={colors.textMuted} numberOfLines={2}>
              {item.description}
            </ThemedText>
            <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />
            <View style={styles.institutionFooter}>
              <Ionicons name="megaphone-outline" size={16} color={colors.primary} />
              <ThemedText variant="body" color={colors.primary} numberOfLines={1}>
                {item.activeCampaigns}{' '}
                {item.activeCampaigns === 1 ? 'campanha ativa' : 'campanhas ativas'}
              </ThemedText>
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function CampaignsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const authToken = useAppStore((state) => state.authToken);
  const activeRole = useActiveRole();

  const router = useRouter();
  const [mode, setMode] = useState<Mode>('campaigns');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<CampaignCategory | 'Todos'>('Todos');
  const [nearMeEnabled, setNearMeEnabled] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [updatingRecurring, setUpdatingRecurring] = useState(false);

  // Memoised fetchers — change when filters change
  const campaignFetcher = useCallback<() => Promise<Campaign[]>>(
    () => {
      if (activeRole === 'platform-admin') return Promise.resolve([]);
      const filters: CampaignFilters = {
        search,
        category: activeCategory,
        nearMe: nearMeEnabled && userLocation ? userLocation : undefined,
      };
      return campaignsService.listCampaigns(filters);
    },
    [activeRole, search, activeCategory, nearMeEnabled, userLocation]
  );

  const institutionFetcher = useCallback(
    () => {
      if (activeRole === 'platform-admin') return Promise.resolve([]);
      return campaignsService.listInstitutions({
        search,
        nearMe: nearMeEnabled && userLocation ? userLocation : undefined,
      });
    },
    [activeRole, search, nearMeEnabled, userLocation]
  );

  const campaigns = useFetch(campaignFetcher);
  const institutions = useFetch(institutionFetcher);
  const adminInstitutions = useFetch(
    useCallback(() => {
      if (activeRole !== 'platform-admin') return Promise.resolve([]);
      return campaignsService.listAdminInstitutions(authToken);
    }, [activeRole, authToken])
  );
  const staffMemberships = useFetch(
    useCallback(() => {
      if (activeRole !== 'institution-staff') return Promise.resolve([]);
      return institutionStaffService.listMyMemberships(authToken);
    }, [activeRole, authToken]),
  );
  const currentInstitutionId = staffMemberships.data?.[0]?.institutionId;
  const currentInstitution = useFetch(
    useCallback(() => {
      if (!currentInstitutionId) return Promise.resolve(null);
      return campaignsService.getInstitutionById(currentInstitutionId);
    }, [currentInstitutionId]),
  );

  const active = mode === 'campaigns' ? campaigns : institutions;
  const count = active.data?.length ?? 0;

  async function handleNearMePress() {
    if (locationLoading) return;

    if (nearMeEnabled) {
      setNearMeEnabled(false);
      setUserLocation(null);
      setLocationError(null);
      exploreLogger.debug('Near me disabled');
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    try {
      exploreLogger.debug('Requesting foreground location permission');
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== 'granted') {
        setNearMeEnabled(false);
        setUserLocation(null);
        setLocationError('Permita o acesso à localização para usar o filtro perto de mim.');
        exploreLogger.warn('Foreground location permission denied', {
          canAskAgain: permission.canAskAgain,
          status: permission.status,
        });
        Alert.alert(
          'Permissão de localização',
          'Para encontrar campanhas e instituições próximas, permita o acesso à localização nas configurações do aparelho.',
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setActiveCategory('Todos');
      setUserLocation(coords);
      setNearMeEnabled(true);
      exploreLogger.info('Near me location captured', coords);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      setNearMeEnabled(false);
      setUserLocation(null);
      setLocationError('Não foi possível obter sua localização agora.');
      exploreLogger.error('Failed to capture near me location', { message });
      Alert.alert('Localização indisponível', 'Não foi possível obter sua localização agora. Tente novamente.');
    } finally {
      setLocationLoading(false);
    }
  }

  async function handleToggleRecurringDonations() {
    if (!currentInstitutionId || updatingRecurring) return;

    const nextValue = currentInstitution.data?.acceptsRecurringDonations === false;
    setUpdatingRecurring(true);

    try {
      await campaignsService.updateInstitutionRecurringDonations(
        currentInstitutionId,
        nextValue,
        authToken,
      );
      currentInstitution.refetch();
      campaigns.refetch();
      Alert.alert(
        'Configuração atualizada',
        nextValue
          ? 'A instituição agora aceita doações mensais.'
          : 'A instituição agora aceita somente doações únicas por campanha.',
      );
    } catch (error) {
      Alert.alert(
        'Não foi possível salvar',
        error instanceof Error ? error.message : 'Tente novamente em instantes.',
      );
    } finally {
      setUpdatingRecurring(false);
    }
  }

  // ─── Render helpers ───────────────────────────────────────────────────────

  function renderContent() {
    if (active.loading) {
      return <Loading label="Carregando..." style={styles.centered} />;
    }

    if (active.error) {
      return (
        <EmptyState
          title="Não foi possível carregar"
          description={active.error}
          illustration={
            <Ionicons name="cloud-offline-outline" size={56} color={colors.border} />
          }
          action={
            <Button variant="secondary" size="sm" onPress={active.refetch}>
              Tentar novamente
            </Button>
          }
        />
      );
    }

    if (!active.data || active.data.length === 0) {
      return (
        <EmptyState
          title="Nenhum resultado encontrado"
          description={
            search
              ? `Nenhum resultado para "${search}". Tente outros termos.`
              : 'Não há itens disponíveis no momento.'
          }
          illustration={
            <Ionicons name="search-circle-outline" size={56} color={colors.border} />
          }
        />
      );
    }

    return (
      <View style={styles.list}>
        {mode === 'campaigns'
          ? (active.data as Campaign[]).map((item) => (
              <CampaignCard
                key={item.id}
                item={item}
                onPress={() => router.push(routes.appCampaignDetail(item.id))}
              />
            ))
          : (active.data as Institution[]).map((item) => (
              <InstitutionCard
                key={item.id}
                item={item}
                onPress={() => router.push(routes.appInstitutionDetail(item.id))}
              />
            ))}
      </View>
    );
  }

  // ─── JSX ──────────────────────────────────────────────────────────────────

  if (activeRole === 'platform-admin') {
    const data = adminInstitutions.data as PendingInstitution[] | null;

    return (
      <ScreenContainer scrollable>
        <View style={styles.container}>
          <View style={styles.section}>
            <ThemedText variant="title">Instituições</ThemedText>
            <ThemedText variant="body" color={colors.textMuted}>
              Cadastros, validações e status das instituições.
            </ThemedText>
          </View>

          {adminInstitutions.loading && <Loading label="Carregando instituições..." />}

          {adminInstitutions.error && (
            <EmptyState
              title="Não foi possível carregar"
              description={adminInstitutions.error}
              illustration={<Ionicons name="cloud-offline-outline" size={56} color={colors.border} />}
              action={<Button variant="secondary" size="sm" onPress={adminInstitutions.refetch}>Tentar novamente</Button>}
            />
          )}

          {!adminInstitutions.loading && !adminInstitutions.error && (
            <View style={styles.list}>
              {(data ?? []).map((item) => (
                <Card key={item.id} variant="outlined">
                  <View style={styles.institutionCard}>
                    <View style={styles.cardHeader}>
                      <Tag
                        label={
                          item.status === 'ACTIVE'
                            ? 'Aprovada'
                            : item.status === 'REJECTED'
                              ? 'Rejeitada'
                              : 'Pendente'
                        }
                        variant={item.status === 'ACTIVE' ? 'success' : item.status === 'REJECTED' ? 'danger' : 'warning'}
                      />
                    </View>
                    <ThemedText variant="subtitle">{item.name}</ThemedText>
                    <ThemedText variant="caption" color={colors.textMuted}>
                      CNPJ {item.cnpj}
                    </ThemedText>
                    <ThemedText variant="caption" color={colors.textMuted}>
                      {item.email}
                    </ThemedText>
                    {item.status === 'PENDING_APPROVAL' ? (
                      <View style={styles.adminActions}>
                        <Button
                          size="sm"
                          variant="secondary"
                          onPress={async () => {
                            await campaignsService.rejectInstitution(item.id, authToken);
                            adminInstitutions.refetch();
                          }}>
                          Rejeitar
                        </Button>
                        <Button
                          size="sm"
                          onPress={async () => {
                            await campaignsService.approveInstitution(item.id, authToken);
                            adminInstitutions.refetch();
                          }}>
                          Aprovar
                        </Button>
                      </View>
                    ) : null}
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScreenContainer>
    );
  }

  if (activeRole === 'institution-staff') {
    const institutionCampaigns = campaigns.data ?? [];
    const acceptsRecurring = currentInstitution.data?.acceptsRecurringDonations !== false;

    return (
      <ScreenContainer scrollable>
        <View style={styles.container}>
          <View style={styles.header}>
            <ThemedText variant="title">Campanhas</ThemedText>
            <ThemedText variant="caption" color={colors.textMuted}>
              Gerencie campanhas, metas e prestação de contas.
            </ThemedText>
          </View>

          <Card variant="elevated">
            <View style={styles.newCampaignCard}>
              <View style={styles.stepper}>
                <View style={[styles.stepDot, { backgroundColor: colors.primary }]}>
                  <ThemedText variant="caption" color={colors.surface}>1</ThemedText>
                </View>
                <View style={[styles.stepLine, { backgroundColor: colors.primarySoft }]} />
                <View style={[styles.stepDot, { backgroundColor: colors.surfaceMuted }]}>
                  <ThemedText variant="caption" color={colors.textMuted}>2</ThemedText>
                </View>
                <View style={[styles.stepLine, { backgroundColor: colors.primarySoft }]} />
                <View style={[styles.stepDot, { backgroundColor: colors.surfaceMuted }]}>
                  <ThemedText variant="caption" color={colors.textMuted}>3</ThemedText>
                </View>
              </View>
              <View style={[styles.uploadBox, { borderColor: colors.border }]}>
                <Ionicons name="image-outline" size={26} color={colors.icon} />
                <ThemedText variant="body">Adicionar imagem de capa</ThemedText>
                <ThemedText variant="caption" color={colors.textMuted}>
                  Formatos: JPG, PNG · Máx. 5MB
                </ThemedText>
              </View>
              <View style={styles.mockField}>
                <ThemedText variant="caption" color={colors.textMuted}>Título da campanha</ThemedText>
                <View style={[styles.fakeInput, { borderColor: colors.border }]}>
                  <ThemedText variant="body">Inverno Solidário 2026</ThemedText>
                </View>
              </View>
              <View style={styles.categories}>
                {['Crianças', 'Inverno', 'Urgente', 'Educação'].map((label, index) => (
                  <Tag key={label} label={label} variant={index === 0 ? 'success' : 'neutral'} />
                ))}
              </View>
              <Pressable
                style={[
                  styles.recurringSetting,
                  {
                    backgroundColor: acceptsRecurring ? colors.primarySoft : colors.surfaceMuted,
                    borderColor: acceptsRecurring ? colors.primary : colors.border,
                  },
                ]}
                disabled={updatingRecurring || !currentInstitutionId}
                onPress={handleToggleRecurringDonations}>
                <View style={styles.recurringSettingText}>
                  <ThemedText variant="body" style={styles.bold}>
                    {acceptsRecurring ? 'Aceita doações mensais' : 'Somente doação única'}
                  </ThemedText>
                  <ThemedText variant="caption" color={colors.textMuted}>
                    {acceptsRecurring
                      ? 'Doadores podem escolher pagamento único ou mensal.'
                      : 'Doadores verão apenas pagamento único nas campanhas.'}
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.recurringToggle,
                    { backgroundColor: acceptsRecurring ? colors.primary : colors.border },
                  ]}>
                  <Ionicons
                    name={acceptsRecurring ? 'checkmark' : 'close'}
                    size={18}
                    color={colors.surface}
                  />
                </View>
              </Pressable>
              <Button fullWidth>Continuar</Button>
            </View>
          </Card>

          {campaigns.loading && <Loading label="Carregando campanhas..." />}

          {campaigns.error && (
            <EmptyState
              title="Não foi possível carregar"
              description={campaigns.error}
              illustration={<Ionicons name="cloud-offline-outline" size={56} color={colors.border} />}
              action={<Button variant="secondary" size="sm" onPress={campaigns.refetch}>Tentar novamente</Button>}
            />
          )}

          {!campaigns.loading && !campaigns.error && (
            <View style={styles.section}>
              <ThemedText variant="subtitle">Campanhas ativas</ThemedText>
              <View style={styles.list}>
                {institutionCampaigns.map((item) => (
                  <CampaignCard
                    key={item.id}
                    item={item}
                    onPress={() => router.push(routes.appCampaignDetail(item.id))}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText variant="title">
            Explorar
          </ThemedText>
          <ThemedText variant="caption" color={colors.textMuted}>
            Busque por campanhas, instituições ou causas perto de você.
          </ThemedText>
        </View>

        {/* Busca */}
        <Input
          value={search}
          onChangeText={setSearch}
          fieldStyle={styles.searchField}
          placeholder={
            mode === 'campaigns'
              ? 'Buscar campanhas ou instituições...'
              : 'Buscar instituições...'
          }
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          leftSlot={
            <View style={styles.searchIcon}>
              <Ionicons name="search-outline" size={18} color={colors.icon} />
            </View>
          }
        />

        {/* Toggle de modo */}
        <ModeToggle mode={mode} onChange={(m) => { setMode(m); setSearch(''); }} />

        {/* Filtros de categoria — apenas em campanhas */}
        {mode === 'campaigns' && (
          <View style={styles.filterBlock}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categories}>
              <Pressable onPress={handleNearMePress}>
                <View
                  style={[
                    styles.nearbyChip,
                    { backgroundColor: nearMeEnabled ? colors.primary : colors.surfaceMuted },
                    locationLoading ? styles.nearbyChipLoading : undefined,
                  ]}>
                  <Ionicons
                    name={locationLoading ? 'navigate-circle-outline' : 'location-outline'}
                    size={14}
                    color={nearMeEnabled ? colors.surface : colors.text}
                  />
                  <ThemedText
                    variant="caption"
                    color={nearMeEnabled ? colors.surface : colors.text}>
                    {locationLoading ? 'Localizando' : 'Perto de mim'}
                  </ThemedText>
                </View>
              </Pressable>
              {CAMPAIGN_CATEGORIES.map((cat) => (
                cat === 'Todos' ? null : <Pressable key={cat} onPress={() => { setNearMeEnabled(false); setActiveCategory(cat); }}>
                  <Tag
                    label={cat}
                    variant={activeCategory === cat ? 'success' : 'neutral'}
                  />
                </Pressable>
              ))}
            </ScrollView>
            {locationError ? (
              <ThemedText variant="caption" color={colors.danger}>
                {locationError}
              </ThemedText>
            ) : null}
          </View>
        )}

        {/* Contagem de resultados */}
        {!active.loading && !active.error && (
          <View style={styles.resultsHeader}>
            <ThemedText variant="subtitle" style={styles.resultsTitle} numberOfLines={2}>
              {mode === 'campaigns' ? 'Campanhas em destaque' : 'Instituições'}
            </ThemedText>
            <ThemedText variant="caption" color={colors.textMuted} style={styles.resultsCount} numberOfLines={2}>
              {count} {count === 1 ? 'resultado' : 'resultados'}
            </ThemedText>
          </View>
        )}

        {/* Conteúdo principal */}
        {renderContent()}

      </View>
    </ScreenContainer>
  );
}
