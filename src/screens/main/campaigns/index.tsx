import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
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
} from '@/services/campaigns';
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
              active && { backgroundColor: colors.surface },
            ]}
            onPress={() => onChange(m)}>
            <ThemedText
              variant="caption"
              style={[styles.modeButtonText, active && styles.modeButtonTextActive]}
              color={active ? colors.primary : colors.textMuted}>
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
      <Card variant="outlined">
        <View style={styles.campaignCard}>
          <View style={styles.cardHeader}>
            <Tag label={item.category} variant="info" />
            {!item.active && <Tag label="Encerrada" variant="neutral" />}
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </View>
          <ThemedText variant="subtitle">{item.title}</ThemedText>
          <ThemedText variant="caption" color={colors.textMuted}>
            {item.institution}
          </ThemedText>
          <ProgressBar value={item.progress} />
          <View style={styles.goalRow}>
            <ThemedText variant="caption" color={colors.primary}>
              {item.raisedFormatted}
            </ThemedText>
            <ThemedText variant="caption" color={colors.textMuted}>
              de {item.goalFormatted} · {item.progress}%
            </ThemedText>
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
      <Card variant="outlined">
        <View style={styles.institutionCard}>
          <View style={styles.cardHeader}>
            <Tag label={item.category} variant="info" />
            {item.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <ThemedText variant="caption" color={colors.success}>
                  Verificada
                </ThemedText>
              </View>
            )}
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </View>
          <ThemedText variant="subtitle">{item.name}</ThemedText>
          <View style={styles.institutionMeta}>
            <Ionicons name="location-outline" size={13} color={colors.textMuted} />
            <ThemedText variant="caption" color={colors.textMuted}>
              {item.city}, {item.state}
            </ThemedText>
          </View>
          <ThemedText variant="caption" color={colors.textMuted} numberOfLines={2}>
            {item.description}
          </ThemedText>
          <View style={styles.institutionFooter}>
            <Ionicons name="megaphone-outline" size={13} color={colors.primary} />
            <ThemedText variant="caption" color={colors.primary}>
              {item.activeCampaigns}{' '}
              {item.activeCampaigns === 1 ? 'campanha ativa' : 'campanhas ativas'}
            </ThemedText>
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

  const router = useRouter();
  const [mode, setMode] = useState<Mode>('campaigns');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<CampaignCategory | 'Todos'>('Todos');

  // Memoised fetchers — change when filters change
  const campaignFetcher = useCallback<() => Promise<Campaign[]>>(
    () => {
      const filters: CampaignFilters = { search, category: activeCategory };
      return campaignsService.listCampaigns(filters);
    },
    [search, activeCategory]
  );

  const institutionFetcher = useCallback(
    () => campaignsService.listInstitutions({ search }),
    [search]
  );

  const campaigns = useFetch(campaignFetcher);
  const institutions = useFetch(institutionFetcher);

  const active = mode === 'campaigns' ? campaigns : institutions;
  const count = active.data?.length ?? 0;

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

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>

        {/* Busca */}
        <Input
          value={search}
          onChangeText={setSearch}
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categories}>
            {CAMPAIGN_CATEGORIES.map((cat) => (
              <Pressable key={cat} onPress={() => setActiveCategory(cat)}>
                <Tag
                  label={cat}
                  variant={activeCategory === cat ? 'success' : 'neutral'}
                />
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Contagem de resultados */}
        {!active.loading && !active.error && (
          <ThemedText variant="caption" color={colors.textMuted}>
            {count} {count === 1 ? 'resultado' : 'resultados'}
          </ThemedText>
        )}

        {/* Conteúdo principal */}
        {renderContent()}

      </View>
    </ScreenContainer>
  );
}
