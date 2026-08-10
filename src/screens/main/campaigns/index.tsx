import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

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
type FeedbackToast = {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
};

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

function getCampaignDescription(item: Campaign) {
  if (item.title.toLowerCase().includes('inverno')) {
    return 'Leve carinho e conforto para quem mais precisa neste inverno.';
  }

  if (item.title.toLowerCase().includes('escolar')) {
    return 'Kit escolar completo para crianças sonharem mais longe.';
  }

  return `Apoie essa campanha de ${item.category.toLowerCase()} e acompanhe o impacto.`;
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
        <View style={styles.featureCampaignCard}>
          <View style={[styles.featureCampaignThumb, { backgroundColor: colors.primarySoft }]}>
            <Image
              source={getCampaignImage(item)}
              style={styles.campaignImage}
              contentFit="cover"
              transition={150}
            />
          </View>
          <View style={styles.featureCampaignInfo}>
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
            <ThemedText variant="caption" color={colors.textMuted} numberOfLines={2}>
              {getCampaignDescription(item)}
            </ThemedText>
            <ProgressBar value={item.progress} />
            <View style={styles.featureStatsRow}>
              <View>
                <ThemedText variant="subtitle" color={colors.primary} style={styles.bold}>
                  {item.progress}%
                </ThemedText>
                <ThemedText variant="caption" color={colors.textMuted}>da meta</ThemedText>
              </View>
              <View style={styles.featureGoal}>
                <ThemedText variant="body" color={colors.text}>
                  {item.goalFormatted}
                </ThemedText>
                <ThemedText variant="caption" color={colors.textMuted}>meta</ThemedText>
              </View>
            </View>
            <View style={styles.featureFooter}>
              <View style={styles.supportersRow}>
                {[0, 1, 2].map((offset) => (
                  <View
                    key={offset}
                    style={[
                      styles.supporterAvatar,
                      {
                        backgroundColor: offset === 0 ? colors.primarySoft : colors.surfaceMuted,
                        borderColor: colors.surface,
                        marginLeft: offset === 0 ? 0 : -8,
                      },
                    ]}>
                    <ThemedText variant="caption" color={colors.primary} style={styles.bold}>
                      {offset === 2 ? '+24' : ''}
                    </ThemedText>
                  </View>
                ))}
                <ThemedText variant="caption" color={colors.textMuted} numberOfLines={1}>
                  356 apoiadores
                </ThemedText>
              </View>
              {item.active ? (
                <Button size="sm" style={styles.featureDonateButton} onPress={onPress}>
                  Doar agora
                </Button>
              ) : (
                <Button size="sm" variant="secondary" style={styles.featureDonateButton} onPress={onPress}>
                  Ver impacto
                </Button>
              )}
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
        <View style={styles.recommendedInstitutionCard}>
          <View style={[styles.institutionAvatar, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name={getInstitutionIcon(item.category)} size={34} color={colors.primary} />
          </View>
          <View style={styles.institutionInfo}>
            <View style={styles.institutionTopRow}>
              <ThemedText variant="subtitle" numberOfLines={1}>
                {item.name}
              </ThemedText>
              {item.verified ? (
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              ) : null}
            </View>
            <ThemedText variant="body" color={colors.textMuted} numberOfLines={1}>
              {item.description}
            </ThemedText>
            <View style={styles.institutionMeta}>
              <Ionicons name="location-outline" size={15} color={colors.textMuted} />
              <ThemedText variant="body" color={colors.textMuted} numberOfLines={1}>
                {item.city}, {item.state} · 1,2 km
              </ThemedText>
            </View>
          </View>
          <Button size="sm" variant="secondary" style={styles.followButton}>
            Seguir
          </Button>
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
  const [institutionCampaignFilter, setInstitutionCampaignFilter] = useState<'active' | 'drafts' | 'ended'>('active');
  const [nearMeEnabled, setNearMeEnabled] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [updatingRecurring, setUpdatingRecurring] = useState(false);
  const [toast, setToast] = useState<FeedbackToast | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  function showToast(nextToast: FeedbackToast) {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setToast(nextToast);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3600);
  }

  // Memoised fetchers — change when filters change
  const campaignFetcher = useCallback<() => Promise<Campaign[]>>(
    () => {
      if (activeRole === 'platform-admin') return Promise.resolve([]);
      const filters: CampaignFilters = {
        search,
        category: activeCategory,
        nearMe: nearMeEnabled && userLocation ? userLocation : undefined,
      };
      if (activeRole === 'institution-staff') {
        return campaignsService.listMyInstitutionCampaigns(authToken, filters);
      }
      return campaignsService.listCampaigns(filters);
    },
    [activeRole, authToken, search, activeCategory, nearMeEnabled, userLocation]
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
        showToast({
          title: 'Permissão de localização',
          message: 'Permita o acesso à localização nas configurações do aparelho.',
          type: 'error',
        });
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
      showToast({
        title: 'Localização indisponível',
        message: 'Não foi possível obter sua localização agora. Tente novamente.',
        type: 'error',
      });
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
      showToast({
        title: 'Configuração atualizada',
        message: nextValue
          ? 'A instituição agora aceita doações mensais.'
          : 'A instituição agora aceita somente doações únicas por campanha.',
        type: 'success',
      });
    } catch (error) {
      showToast({
        title: 'Não foi possível salvar',
        message: error instanceof Error ? error.message : 'Tente novamente em instantes.',
        type: 'error',
      });
    } finally {
      setUpdatingRecurring(false);
    }
  }

  // ─── Render helpers ───────────────────────────────────────────────────────

  function renderToast() {
    if (!toast) return null;

    const isError = toast.type === 'error';
    const isSuccess = toast.type === 'success';
    const accentColor = isError ? colors.danger : isSuccess ? colors.primary : colors.info;

    return (
      <View
        style={[
          styles.toast,
          {
            backgroundColor: isError ? colors.secondarySoft : isSuccess ? colors.primarySoft : colors.infoSoft,
            borderColor: accentColor,
          },
        ]}>
        <Ionicons
          name={isError ? 'alert-circle-outline' : isSuccess ? 'checkmark-circle-outline' : 'information-circle-outline'}
          size={22}
          color={accentColor}
        />
        <View style={styles.toastText}>
          <ThemedText variant="body" color={accentColor} style={styles.toastTitle}>
            {toast.title}
          </ThemedText>
          <ThemedText variant="caption" color={colors.text}>
            {toast.message}
          </ThemedText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar aviso"
          onPress={() => setToast(null)}
          style={styles.toastClose}>
          <Ionicons name="close" size={18} color={colors.icon} />
        </Pressable>
      </View>
    );
  }

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
    const institutionCampaigns = (campaigns.data ?? []).filter((item) =>
      currentInstitutionId ? item.institutionId === currentInstitutionId : true,
    );
    const acceptsRecurring = currentInstitution.data?.acceptsRecurringDonations !== false;
    const filteredInstitutionCampaigns = institutionCampaigns.filter((item) => {
      if (institutionCampaignFilter === 'ended') return ['FINISHED', 'CANCELED'].includes(item.status ?? '') || !item.active;
      if (institutionCampaignFilter === 'drafts') return ['DRAFT', 'IN_REVIEW'].includes(item.status ?? '');
      return item.status === 'PUBLISHED' && item.active;
    });
    const campaignsInReview = institutionCampaigns.filter((item) => item.status === 'IN_REVIEW').length;

    return (
      <ScreenContainer scrollable>
        <View style={styles.container}>
          {renderToast()}

          <View style={styles.institutionCampaignHeader}>
            <View style={styles.institutionCampaignIntro}>
              <ThemedText variant="caption" color={colors.primary}>Bem-vindo, equipe!</ThemedText>
              <Button
                size="sm"
                variant="primary"
                leftSlot={<Ionicons name="add" size={18} color={colors.surface} />}
                onPress={() => router.push(routes.institutionCreate)}>
                Nova campanha
              </Button>
            </View>
            <ThemedText variant="title">Campanhas</ThemedText>
            <ThemedText variant="caption" color={colors.textMuted}>
              Gerencie campanhas, metas e prestação de contas.
            </ThemedText>
          </View>

          <View style={[styles.institutionTabs, { borderColor: colors.border }]}>
            {[
              ['active', 'Ativas'],
              ['drafts', 'Rascunhos'],
              ['ended', 'Encerradas'],
            ].map(([key, label]) => {
              const selected = institutionCampaignFilter === key;

              return (
                <Pressable
                  key={key}
                  style={[styles.institutionTabButton, { backgroundColor: selected ? colors.primarySoft : 'transparent' }]}
                  onPress={() => setInstitutionCampaignFilter(key as typeof institutionCampaignFilter)}>
                  <ThemedText variant="body" color={selected ? colors.primary : colors.textMuted} style={styles.bold}>
                    {label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

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
            <View style={styles.list}>
              {filteredInstitutionCampaigns.map((item) => (
                <Card key={item.id} variant="elevated" style={styles.institutionCampaignCard}>
                  <View style={styles.institutionCampaignTop}>
                    <View style={[styles.institutionCampaignIcon, { backgroundColor: colors.primarySoft }]}>
                      <Ionicons
                        name={item.title.toLowerCase().includes('escolar') ? 'bag-outline' : 'snow-outline'}
                        size={34}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.institutionCampaignTitle}>
                      <View style={styles.cardHeader}>
                        <ThemedText variant="subtitle" style={styles.cardTitle} numberOfLines={2}>
                          {item.title}
                        </ThemedText>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Ver detalhes de ${item.title}`}
                          onPress={() => router.push(routes.appCampaignDetail(item.id))}
                          style={styles.iconButton}>
                          <Ionicons name="ellipsis-horizontal" size={22} color={colors.icon} />
                        </Pressable>
                      </View>
                      <Tag
                        label={
                          item.status === 'IN_REVIEW'
                            ? 'Em revisão'
                            : item.active
                              ? 'Ativa'
                              : 'Encerrada'
                        }
                        variant={item.status === 'IN_REVIEW' ? 'warning' : item.active ? 'success' : 'neutral'}
                      />
                    </View>
                  </View>
                  <View style={styles.goalRow}>
                    <ThemedText variant="body" color={colors.primary} style={styles.bold}>
                      {item.progress}%
                    </ThemedText>
                    <ThemedText variant="body" style={styles.bold}>
                      {item.raisedFormatted} de {item.goalFormatted}
                    </ThemedText>
                  </View>
                  <ProgressBar value={item.progress} />

                  {item.status === 'IN_REVIEW' ? (
                    <View style={styles.institutionCampaignActions}>
                      <Button
                        size="sm"
                        variant="ghost"
                        style={styles.campaignActionButton}
                        onPress={() => router.push(routes.appCampaignDetail(item.id))}>
                        Detalhes
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        style={styles.campaignActionButton}
                        onPress={() => router.push('/institution/create?mode=campaign' as never)}>
                        Revisar
                      </Button>
                    </View>
                  ) : item.active ? (
                    <>
                      <View style={styles.institutionCampaignStats}>
                        <View style={styles.statBlock}>
                          <View style={[styles.metaIcon, { backgroundColor: colors.primarySoft }]}>
                            <Ionicons name="people" size={18} color={colors.primary} />
                          </View>
                          <View>
                            <ThemedText variant="subtitle">{item.donationsCount ?? 0}</ThemedText>
                            <ThemedText variant="caption" color={colors.textMuted}>doações</ThemedText>
                          </View>
                        </View>
                        <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.statBlock}>
                          <View style={[styles.metaIcon, { backgroundColor: colors.primarySoft }]}>
                            <Ionicons name="heart" size={18} color={colors.primary} />
                          </View>
                          <View>
                            <ThemedText variant="subtitle">{item.followersCount ?? 0}</ThemedText>
                            <ThemedText variant="caption" color={colors.textMuted}>apoiadores</ThemedText>
                          </View>
                        </View>
                      </View>
                      <View style={styles.institutionCampaignActions}>
                        <Button
                          size="sm"
                          variant="ghost"
                          style={styles.campaignActionButton}
                          onPress={() => router.push(routes.appCampaignDetail(item.id))}>
                          Detalhes
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          style={styles.campaignActionButton}
                          onPress={() => router.push('/institution/create?mode=post' as never)}>
                          Posts
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          style={styles.campaignActionButton}
                          onPress={() => router.push(routes.institutionDonations)}>
                          Doações
                        </Button>
                      </View>
                    </>
                  ) : (
                    <Button fullWidth variant="ghost" onPress={() => router.push(routes.appCampaignDetail(item.id))}>
                      Ver impacto
                    </Button>
                  )}
                </Card>
              ))}

              {institutionCampaignFilter === 'drafts' && campaignsInReview > 0 ? (
                <Pressable onPress={() => router.push(routes.institutionCreate)}>
                  <Card variant="outlined" style={styles.draftCard}>
                    <View style={[styles.institutionCampaignIcon, { backgroundColor: colors.primarySoft }]}>
                      <Ionicons name="document-text-outline" size={28} color={colors.primary} />
                    </View>
                    <View style={styles.institutionCampaignTitle}>
                      <ThemedText variant="body" style={styles.bold}>Rascunhos</ThemedText>
                      <ThemedText variant="caption" color={colors.textMuted}>
                        {campaignsInReview} {campaignsInReview === 1 ? 'campanha aguardando' : 'campanhas aguardando'} revisão
                      </ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={22} color={colors.primary} />
                  </Card>
                </Pressable>
              ) : null}

              {filteredInstitutionCampaigns.length === 0 && institutionCampaignFilter !== 'drafts' ? (
                <EmptyState
                  title="Nenhuma campanha nesta aba"
                  description="Quando houver campanhas nesse estado, elas aparecerão aqui."
                  illustration={<Ionicons name="flag-outline" size={48} color={colors.border} />}
                />
              ) : null}
            </View>
          )}

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
                Controle se doadores podem assinar contribuições mensais.
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
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <View style={styles.exploreHeader}>
          <View style={styles.headerText}>
            <ThemedText variant="title">Explorar</ThemedText>
            <ThemedText variant="caption" color={colors.textMuted}>
              Descubra posts, instituições e campanhas que combinam com você.
            </ThemedText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notificações"
            onPress={() => router.push(routes.appNotifications)}
            style={styles.headerIconButton}>
            <Ionicons name="notifications-outline" size={30} color={colors.primaryStrong} />
          </Pressable>
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
              <View style={[styles.moreChip, { backgroundColor: colors.surfaceMuted }]}>
                <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
              </View>
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
            <Pressable>
              <ThemedText variant="body" color={colors.primary} style={styles.bold}>
                Ver todas
              </ThemedText>
            </Pressable>
          </View>
        )}

        {/* Conteúdo principal */}
        {renderContent()}

        {mode === 'campaigns' && !institutions.loading && !institutions.error && institutions.data && institutions.data.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.resultsHeader}>
              <ThemedText variant="subtitle" style={styles.resultsTitle}>
                Instituições recomendadas
              </ThemedText>
              <Pressable onPress={() => setMode('institutions')}>
                <ThemedText variant="body" color={colors.primary} style={styles.bold}>
                  Ver todas
                </ThemedText>
              </Pressable>
            </View>
            <View style={styles.list}>
              {institutions.data.slice(0, 2).map((item) => (
                <InstitutionCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push(routes.appInstitutionDetail(item.id))}
                />
              ))}
            </View>
          </View>
        ) : null}

      </View>
    </ScreenContainer>
  );
}
