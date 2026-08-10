import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Button, Card, Divider, EmptyState, Loading, ProgressBar, Tag, ThemedText } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFetch } from '@/hooks/use-fetch';
import { routes } from '@/navigation/routes';
import { campaignsService, type Campaign } from '@/services/campaigns';
import { chatService } from '@/services/chat';
import { followsService } from '@/services/follows';
import { institutionStaffService } from '@/services/institution-staff';
import { useActiveRole, useAppStore } from '@/store';
import { theme } from '@/theme';

import { styles } from './styles';

type CampaignRowProps = { item: Campaign; onPress: () => void };

function CampaignRow({ item, onPress }: CampaignRowProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  return (
    <Pressable onPress={onPress}>
      <View style={styles.campaignRow}>
        <View style={styles.campaignRowInfo}>
          <ThemedText variant="body" style={styles.bold}>
            {item.title}
          </ThemedText>
          <ProgressBar value={item.progress} />
          <View style={styles.campaignRowMeta}>
            <ThemedText variant="caption" color={colors.primary}>
              {item.raisedFormatted}
            </ThemedText>
            <ThemedText variant="caption" color={colors.textMuted}>
              de {item.goalFormatted} · {item.progress}%
            </ThemedText>
          </View>
        </View>
        {!item.active && <Tag label="Encerrada" variant="neutral" />}
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

export function InstitutionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const insets = useSafeAreaInsets();
  const authToken = useAppStore((state) => state.authToken);
  const activeRole = useActiveRole();
  const [openingChat, setOpeningChat] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const fetcher = useCallback(() => campaignsService.getInstitutionById(id), [id]);
  const { data: institution, loading, error, refetch } = useFetch(fetcher);
  const followsFetcher = useCallback(() => followsService.listMyFollows(authToken), [authToken]);
  const { data: follows, refetch: refetchFollows } = useFetch(followsFetcher);
  const staffMemberships = useFetch(
    useCallback(() => {
      if (activeRole !== 'institution-staff') return Promise.resolve([]);
      return institutionStaffService.listMyMemberships(authToken);
    }, [activeRole, authToken]),
  );

  // ─── States ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <View style={[styles.backBar, { paddingTop: insets.top }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        </View>
        <Loading label="Carregando instituição..." style={styles.centered} />
      </View>
    );
  }

  if (error || !institution) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <View style={[styles.backBar, { paddingTop: insets.top }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        </View>
        <EmptyState
          title="Não foi possível carregar"
          description={error ?? 'Instituição não encontrada.'}
          illustration={<Ionicons name="cloud-offline-outline" size={56} color={colors.border} />}
          action={
            <Button variant="secondary" size="sm" onPress={refetch}>
              Tentar novamente
            </Button>
          }
        />
      </View>
    );
  }

  // ─── Content ───────────────────────────────────────────────────────────────

  const activeCampaigns = institution.campaigns.filter((c) => c.active);
  const institutionId = institution.id;
  const isOwnInstitution = Boolean(
    staffMemberships.data?.some((membership) => membership.institutionId === institutionId),
  );
  const isFollowing = Boolean(
    follows?.some((follow) => follow.targetType === 'INSTITUTION' && follow.targetId === institutionId),
  );
  const locationLabel = `${institution.name}, ${institution.city}, ${institution.state}`;
  const hasCoordinates = Boolean(institution.location);

  async function toggleFollow() {
    if (followLoading) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await followsService.unfollow('INSTITUTION', institutionId, authToken);
      } else {
        await followsService.follow(
          { targetType: 'INSTITUTION', targetId: institutionId },
          authToken,
        );
      }

      await refetchFollows();
    } finally {
      setFollowLoading(false);
    }
  }

  async function openMaps() {
    if (!institution) return;

    const encodedLabel = encodeURIComponent(locationLabel);
    const fallbackUrl = institution.location
      ? `https://www.google.com/maps/search/?api=1&query=${institution.location.latitude},${institution.location.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodedLabel}`;
    const mapUrl = institution.location
      ? Platform.select({
          android: `geo:${institution.location.latitude},${institution.location.longitude}?q=${institution.location.latitude},${institution.location.longitude}(${encodedLabel})`,
          ios: `http://maps.apple.com/?ll=${institution.location.latitude},${institution.location.longitude}&q=${encodedLabel}`,
          default: fallbackUrl,
        }) ?? fallbackUrl
      : fallbackUrl;

    try {
      await Linking.openURL(mapUrl);
    } catch {
      await Linking.openURL(fallbackUrl);
    }
  }

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Header bar */}
      <View style={[styles.backBar, { paddingTop: insets.top, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <ThemedText variant="subtitle" numberOfLines={1} style={styles.headerTitle}>
          {institution.name}
        </ThemedText>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Identidade */}
        <View style={styles.identity}>
          <View style={[styles.cover, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="image-outline" size={32} color={colors.primary} />
          </View>
          <Avatar
            name={institution.name}
            size="lg"
            style={[styles.identityAvatar, { borderColor: colors.surface }]}
          />
          <View style={styles.identityInfo}>
            <View style={styles.nameRow}>
              <ThemedText variant="subtitle">
                {institution.name}
              </ThemedText>
              {institution.verified ? (
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              ) : null}
            </View>
            <ThemedText variant="caption" color={colors.textMuted}>
              ONG · {institution.city}, {institution.state} · {institution.category}
            </ThemedText>
            <View style={styles.profileStats}>
              <View>
                <ThemedText variant="body" style={styles.bold}>
                  {institution.followersCount ?? 0}
                </ThemedText>
                <ThemedText variant="caption" color={colors.textMuted}>seguidores</ThemedText>
              </View>
              <View>
                <ThemedText variant="body" style={styles.bold}>{institution.campaigns.length}</ThemedText>
                <ThemedText variant="caption" color={colors.textMuted}>campanhas</ThemedText>
              </View>
            </View>
            {!isOwnInstitution ? (
              <View style={styles.profileActions}>
                <Button
                  size="sm"
                  variant={isFollowing ? 'ghost' : 'primary'}
                  disabled={followLoading}
                  style={styles.profileButton}
                  onPress={toggleFollow}>
                  {isFollowing ? 'Seguindo' : 'Seguir'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  style={styles.profileButton}
                  leftSlot={<Ionicons name="mail-outline" size={15} color={colors.primary} />}
                  disabled={openingChat}
                  onPress={async () => {
                    if (openingChat) return;
                    setOpeningChat(true);
                    try {
                      const conversationId = await chatService.ensureConversation(
                        institution.id,
                        institution.name,
                        authToken,
                      );
                      router.push(routes.appChat(conversationId));
                    } finally {
                      setOpeningChat(false);
                    }
                  }}>
                  Mensagem
                </Button>
              </View>
            ) : null}
          </View>
        </View>

        {/* Informações */}
        <View style={styles.section}>
          <ThemedText variant="subtitle">Informações</ThemedText>
          <Card padding="none">
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color={colors.icon} />
              <ThemedText variant="body">Fundada em {institution.foundedYear}</ThemedText>
            </View>
            <Divider />
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={18} color={colors.icon} />
              <ThemedText variant="body" color={colors.primary}>{institution.email}</ThemedText>
            </View>
            {institution.website && (
              <>
                <Divider />
                <View style={styles.infoRow}>
                  <Ionicons name="globe-outline" size={18} color={colors.icon} />
                  <ThemedText variant="body" color={colors.primary}>{institution.website}</ThemedText>
                </View>
              </>
            )}
          </Card>
        </View>

        {/* Localização */}
        <View style={styles.section}>
          <ThemedText variant="subtitle">Localização</ThemedText>
          <Pressable accessibilityRole="button" onPress={() => void openMaps()}>
            <Card style={styles.mapCard}>
              <View style={[styles.mapPreview, { backgroundColor: colors.primarySoft }]}>
                <View style={[styles.mapRoad, styles.mapRoadPrimary, { backgroundColor: colors.surface }]} />
                <View style={[styles.mapRoad, styles.mapRoadSecondary, { backgroundColor: colors.surface }]} />
                <View style={[styles.mapPin, { backgroundColor: colors.primary }]}>
                  <Ionicons name="location" size={22} color={colors.surface} />
                </View>
              </View>
              <View style={styles.mapInfo}>
                <ThemedText variant="body" style={styles.bold}>{institution.city}, {institution.state}</ThemedText>
                <ThemedText variant="caption" color={colors.textMuted}>
                  {hasCoordinates ? 'Toque para abrir no aplicativo de mapas.' : 'Toque para buscar esta localização no mapa.'}
                </ThemedText>
              </View>
              <Ionicons name="open-outline" size={20} color={colors.primary} />
            </Card>
          </Pressable>
        </View>

        {/* Campanhas ativas */}
        {activeCampaigns.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText variant="subtitle">Campanhas ativas</ThemedText>
              <ThemedText variant="caption" color={colors.primary}>Ver todas</ThemedText>
            </View>
            <View style={styles.campaignList}>
              {activeCampaigns.map((c, index) => (
                <View key={c.id}>
                  <CampaignRow
                    item={c}
                    onPress={() => router.push(routes.appCampaignDetail(c.id))}
                  />
                  {index < activeCampaigns.length - 1 && <Divider />}
                </View>
              ))}
            </View>
          </View>
        )}

        {!isOwnInstitution ? <View style={styles.actionBarSpacer} /> : null}
      </ScrollView>

      {/* Action bar fixa */}
      {!isOwnInstitution ? (
        <View style={[
          styles.actionBar,
          { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 16) },
        ]}>
          <Button
            variant="primary"
            style={styles.actionButton}
            leftSlot={<Ionicons name="chatbubble-outline" size={16} color={colors.surface} />}
            disabled={openingChat}
            onPress={async () => {
              if (openingChat) return;
              setOpeningChat(true);
              try {
                const conversationId = await chatService.ensureConversation(
                  institution.id,
                  institution.name,
                  authToken,
                );
                router.push(routes.appChat(conversationId));
              } finally {
                setOpeningChat(false);
              }
            }}>
            Conversar com a Instituição
          </Button>
        </View>
      ) : null}
    </View>
  );
}
