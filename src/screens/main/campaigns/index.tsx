import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, Share, TextInput, View } from 'react-native';

import {
  Avatar,
  Button,
  Card,
  Divider,
  EmptyState,
  Input,
  Loading,
  ProgressBar,
  ScreenContainer,
  SegmentedToggle,
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
  type GeoLocation,
  type Institution,
  type PendingInstitution,
} from '@/services/campaigns';
import { followsService, type Follow } from '@/services/follows';
import { institutionStaffService } from '@/services/institution-staff';
import { logger } from '@/services/logger';
import { postsService, type FeedPost, type PostComment } from '@/services/posts';
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

type AdminInstitutionStatusFilter = 'all' | 'approved' | 'pending' | 'rejected';
type AdminInstitutionSort = 'recent' | 'activity' | 'name';
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

function formatFeedDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getPostAuthorLabel(post: FeedPost): string {
  return post.authorType === 'INSTITUTION' ? 'Instituição' : 'Doador';
}

type PostCommentTarget = { id: string; title: string };

function getCommentAuthorName(comment: PostComment) {
  return comment.author?.fullName?.trim() || comment.author?.email?.trim() || 'Usuário';
}

// A single vertical feed mixing campaigns, institutions and posts by
// recency (or by distance, when "Perto de mim" is active) — Explorar is
// meant to feel like one fluid stream to discover/connect with, not three
// siloed lists behind a toggle.
type ExploreFeedItem =
  | { kind: 'campaign'; id: string; createdAt: string; location?: GeoLocation; data: Campaign }
  | { kind: 'institution'; id: string; createdAt: string; location?: GeoLocation; data: Institution }
  | { kind: 'post'; id: string; createdAt: string; location?: GeoLocation; data: FeedPost };

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceInKm(from: GeoLocation, to: GeoLocation) {
  const earthRadiusKm = 6371;
  const deltaLatitude = toRadians(to.latitude - from.latitude);
  const deltaLongitude = toRadians(to.longitude - from.longitude);
  const originLatitude = toRadians(from.latitude);
  const destinationLatitude = toRadians(to.latitude);

  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(deltaLongitude / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function sortFeedByDistance(items: ExploreFeedItem[], nearMe?: GeoLocation) {
  if (!nearMe) return items;

  return [...items].sort((a, b) => {
    if (!a.location && !b.location) return 0;
    if (!a.location) return 1;
    if (!b.location) return -1;

    return distanceInKm(nearMe, a.location) - distanceInKm(nearMe, b.location);
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type CampaignCardProps = { item: Campaign; onPress: () => void };

function getDonorInitials(name?: string) {
  if (!name) return '?';

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function CampaignCard({ item, onPress }: CampaignCardProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  const donorsFetcher = useCallback(
    () => campaignsService.getCampaignRecentDonors(item.id, 3),
    [item.id],
  );
  const { data: recentDonors } = useFetch(donorsFetcher);
  const shownDonors = recentDonors?.donors ?? [];
  const donorsCount = recentDonors?.totalCount ?? 0;
  const extraDonorsCount = Math.max(donorsCount - shownDonors.length, 0);

  return (
    <Pressable onPress={onPress}>
      <Card variant="elevated" style={styles.exploreCard}>
        <View style={styles.featureCampaignCard}>
          <View style={[styles.featureCampaignThumb, { backgroundColor: colors.primarySoft }]}>
            <Image
              source={item.bannerUrl || getCampaignImage(item)}
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
                {shownDonors.map((donor, index) => (
                  <View
                    key={donor.id}
                    style={[
                      styles.supporterAvatar,
                      {
                        backgroundColor: colors.primarySoft,
                        borderColor: colors.surface,
                        marginLeft: index === 0 ? 0 : -8,
                        overflow: 'hidden',
                      },
                    ]}>
                    {donor.profilePhotoUrl ? (
                      <Image source={{ uri: donor.profilePhotoUrl }} style={styles.supporterAvatarImage} />
                    ) : (
                      <ThemedText variant="caption" color={colors.primary} style={styles.bold}>
                        {getDonorInitials(donor.name)}
                      </ThemedText>
                    )}
                  </View>
                ))}
                {extraDonorsCount > 0 ? (
                  <View
                    style={[
                      styles.supporterAvatar,
                      {
                        backgroundColor: colors.surfaceMuted,
                        borderColor: colors.surface,
                        marginLeft: shownDonors.length > 0 ? -8 : 0,
                      },
                    ]}>
                    <ThemedText variant="caption" color={colors.primary} style={styles.bold}>
                      +{extraDonorsCount}
                    </ThemedText>
                  </View>
                ) : null}
                <ThemedText variant="caption" color={colors.textMuted} numberOfLines={1} style={styles.supportersLabel}>
                  {donorsCount === 1 ? '1 apoiador' : `${donorsCount} apoiadores`}
                </ThemedText>
              </View>
              {item.active ? (
                <Button size="sm" style={styles.featureDonateButton} onPress={onPress}>
                  Doar agora
                </Button>
              ) : (
                <Button size="sm" variant="ghost" style={styles.featureDonateButton} onPress={onPress}>
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

type InstitutionCardProps = {
  item: Institution;
  isFollowing: boolean;
  followPending: boolean;
  onPress: () => void;
  onToggleFollow: () => void;
};

function InstitutionCard({ item, isFollowing, followPending, onPress, onToggleFollow }: InstitutionCardProps) {
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
                {item.city}, {item.state}
              </ThemedText>
            </View>
          </View>
          <Button
            size="sm"
            variant="ghost"
            disabled={followPending}
            style={[
              styles.followButton,
              isFollowing ? { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft } : undefined,
            ]}
            onPress={onToggleFollow}>
            {isFollowing ? 'Seguindo' : 'Seguir'}
          </Button>
        </View>
      </Card>
    </Pressable>
  );
}

type PostCardProps = {
  item: FeedPost;
  liked: boolean;
  onOpenComments: () => void;
  onPressDonate: (campaignId: string) => void;
  onShare: () => void;
  onToggleLike: () => void;
};

function PostCard({ item, liked, onOpenComments, onPressDonate, onShare, onToggleLike }: PostCardProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const mediaUrl = item.media?.[0]?.url;

  return (
    <Card variant="elevated" style={styles.exploreCard}>
      <View style={styles.postAuthor}>
        <Avatar name={getPostAuthorLabel(item)} size="sm" />
        <View style={styles.postAuthorText}>
          <ThemedText variant="body" style={styles.bold} numberOfLines={1}>
            {getPostAuthorLabel(item)}
          </ThemedText>
          <ThemedText variant="caption" color={colors.textMuted}>
            {formatFeedDate(item.createdAt)}
          </ThemedText>
        </View>
        <Ionicons name="ellipsis-horizontal" size={18} color={colors.icon} />
      </View>

      <ThemedText variant="body">{item.content}</ThemedText>

      {mediaUrl ? (
        <Image source={{ uri: mediaUrl }} style={styles.postImage} contentFit="cover" transition={150} />
      ) : null}

      <View style={styles.postStats}>
        <ThemedText variant="caption" color={colors.textMuted}>
          {item.stats.likesCount ?? 0} curtidas
        </ThemedText>
        <ThemedText variant="caption" color={colors.textMuted}>
          {item.stats.commentsCount ?? 0} comentários
        </ThemedText>
      </View>

      <View style={styles.feedActions}>
        <Pressable style={styles.feedAction} onPress={onToggleLike}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={22} color={liked ? colors.primary : colors.icon} />
          <ThemedText variant="body" color={liked ? colors.primary : colors.textMuted}>Curtir</ThemedText>
        </Pressable>
        <Pressable style={styles.feedAction} onPress={onOpenComments}>
          <Ionicons name="chatbubble-outline" size={22} color={colors.icon} />
          <ThemedText variant="body" color={colors.textMuted}>Comentar</ThemedText>
        </Pressable>
        <Pressable style={styles.feedAction} onPress={onShare}>
          <Ionicons name="paper-plane-outline" size={22} color={colors.icon} />
          <ThemedText variant="body" color={colors.textMuted}>Compartilhar</ThemedText>
        </Pressable>
        {item.campaignId ? (
          <Pressable style={styles.feedAction} onPress={() => onPressDonate(item.campaignId!)}>
            <Ionicons name="heart-circle-outline" size={22} color={colors.primary} />
            <ThemedText variant="body" color={colors.primary}>Doar</ThemedText>
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function CampaignsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const authToken = useAppStore((state) => state.authToken);
  const activeRole = useActiveRole();

  const router = useRouter();
  const [search, setSearch] = useState('');
  const [adminInstitutionStatus, setAdminInstitutionStatus] =
    useState<AdminInstitutionStatusFilter>('all');
  const [adminInstitutionState, setAdminInstitutionState] = useState('all');
  const [adminInstitutionSort, setAdminInstitutionSort] =
    useState<AdminInstitutionSort>('activity');
  const [adminFilterOpen, setAdminFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CampaignCategory | 'Todos'>('Todos');
  const [institutionCampaignFilter, setInstitutionCampaignFilter] = useState<'active' | 'drafts' | 'ended'>('active');
  const [nearMeEnabled, setNearMeEnabled] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [updatingRecurring, setUpdatingRecurring] = useState(false);
  const [toast, setToast] = useState<FeedbackToast | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [followPendingIds, setFollowPendingIds] = useState<Set<string>>(new Set());
  const [commentTarget, setCommentTarget] = useState<PostCommentTarget | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentsError, setCommentsError] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [exploreFilterOpen, setExploreFilterOpen] = useState(false);
  const activeExploreFiltersCount = (activeCategory !== 'Todos' ? 1 : 0) + (nearMeEnabled ? 1 : 0);

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

  type ExploreExtras = { follows: Follow[]; likedPostIds: string[]; posts: FeedPost[] };
  const exploreExtrasFetcher = useCallback<() => Promise<ExploreExtras>>(
    () => {
      if (activeRole !== 'donor') {
        return Promise.resolve({ follows: [], likedPostIds: [], posts: [] });
      }
      return Promise.all([
        followsService.listMyFollows(authToken),
        postsService.getMyLikedPostIds(authToken),
        postsService.listFeed(authToken),
      ]).then(([follows, likedPostIds, posts]) => ({ follows, likedPostIds, posts }));
    },
    [activeRole, authToken]
  );
  const exploreExtras = useFetch(exploreExtrasFetcher);

  useEffect(() => {
    if (!exploreExtras.data) return;
    setLikedPosts(new Set(exploreExtras.data.likedPostIds));
    setFollowingIds(
      new Set(
        exploreExtras.data.follows
          .filter((follow) => follow.targetType === 'INSTITUTION')
          .map((follow) => follow.targetId)
      )
    );
  }, [exploreExtras.data]);

  const exploreItems = useMemo<ExploreFeedItem[]>(() => {
    if (activeRole !== 'donor') return [];

    const campaignItems: ExploreFeedItem[] = (campaigns.data ?? []).map((item) => ({
      kind: 'campaign',
      id: `campaign-${item.id}`,
      createdAt: item.createdAt ?? new Date(0).toISOString(),
      location: item.location,
      data: item,
    }));

    const filteredInstitutions = (institutions.data ?? []).filter(
      (item) => activeCategory === 'Todos' || item.category === activeCategory
    );
    const institutionItems: ExploreFeedItem[] = filteredInstitutions.map((item) => ({
      kind: 'institution',
      id: `institution-${item.id}`,
      createdAt: item.createdAt ?? new Date(0).toISOString(),
      location: item.location,
      data: item,
    }));

    const query = search.trim().toLowerCase();
    const posts = exploreExtras.data?.posts ?? [];
    const filteredPosts = query ? posts.filter((post) => post.content.toLowerCase().includes(query)) : posts;
    const postItems: ExploreFeedItem[] = filteredPosts.map((item) => ({
      kind: 'post',
      id: `post-${item.id}`,
      createdAt: item.createdAt,
      data: item,
    }));

    const merged = [...campaignItems, ...institutionItems, ...postItems];

    if (nearMeEnabled && userLocation) {
      return sortFeedByDistance(merged, userLocation);
    }

    return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activeRole, campaigns.data, institutions.data, exploreExtras.data, activeCategory, search, nearMeEnabled, userLocation]);

  const exploreLoading = campaigns.loading || institutions.loading || exploreExtras.loading;
  const exploreError = campaigns.error || institutions.error || exploreExtras.error;

  function refetchExplore() {
    campaigns.refetch();
    institutions.refetch();
    exploreExtras.refetch();
  }

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

  async function togglePostLike(post: FeedPost) {
    const isLiked = likedPosts.has(post.id);

    setLikedPosts((current) => {
      const next = new Set(current);
      if (isLiked) next.delete(post.id);
      else next.add(post.id);
      return next;
    });

    try {
      if (isLiked) await postsService.unlikePost(post.id, authToken);
      else await postsService.likePost({ postId: post.id }, authToken);
      await exploreExtras.refetch();
    } catch {
      setLikedPosts((current) => {
        const next = new Set(current);
        if (isLiked) next.add(post.id);
        else next.delete(post.id);
        return next;
      });
    }
  }

  async function sharePost(post: FeedPost) {
    await Share.share({ message: post.content });
    await postsService.sharePost(post.id);
    await exploreExtras.refetch();
  }

  async function openPostComments(target: PostCommentTarget) {
    setCommentTarget(target);
    setCommentText('');
    setComments([]);
    setCommentsError('');
    setCommentsLoading(true);

    try {
      const nextComments = await postsService.listComments(target.id, authToken);
      setComments(nextComments);
    } catch (error) {
      setCommentsError(error instanceof Error ? error.message : 'Não foi possível carregar os comentários.');
    } finally {
      setCommentsLoading(false);
    }
  }

  async function submitPostComment() {
    if (!commentTarget || !commentText.trim()) return;

    setCommentSubmitting(true);

    try {
      const createdComment = await postsService.createComment(
        { postId: commentTarget.id, content: commentText },
        authToken,
      );
      setComments((items) => [...items, createdComment]);
      setCommentText('');
      await exploreExtras.refetch();
    } catch (error) {
      setCommentsError(error instanceof Error ? error.message : 'Não foi possível enviar o comentário.');
    } finally {
      setCommentSubmitting(false);
    }
  }

  async function toggleFollowInstitution(institution: Institution) {
    const isFollowing = followingIds.has(institution.id);
    setFollowPendingIds((current) => new Set(current).add(institution.id));
    setFollowingIds((current) => {
      const next = new Set(current);
      if (isFollowing) next.delete(institution.id);
      else next.add(institution.id);
      return next;
    });

    try {
      if (isFollowing) {
        await followsService.unfollow('INSTITUTION', institution.id, authToken);
      } else {
        await followsService.follow({ targetType: 'INSTITUTION', targetId: institution.id }, authToken);
      }
    } catch {
      setFollowingIds((current) => {
        const next = new Set(current);
        if (isFollowing) next.add(institution.id);
        else next.delete(institution.id);
        return next;
      });
    } finally {
      setFollowPendingIds((current) => {
        const next = new Set(current);
        next.delete(institution.id);
        return next;
      });
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

  function renderExploreFeed() {
    if (exploreLoading) {
      return <Loading label="Carregando..." style={styles.centered} />;
    }

    if (exploreError) {
      return (
        <EmptyState
          title="Não foi possível carregar"
          description={exploreError}
          illustration={
            <Ionicons name="cloud-offline-outline" size={56} color={colors.border} />
          }
          action={
            <Button variant="secondary" size="sm" onPress={refetchExplore}>
              Tentar novamente
            </Button>
          }
        />
      );
    }

    if (exploreItems.length === 0) {
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
        {exploreItems.map((item) => {
          if (item.kind === 'campaign') {
            return (
              <CampaignCard
                key={item.id}
                item={item.data}
                onPress={() => router.push(routes.appCampaignDetail(item.data.id))}
              />
            );
          }

          if (item.kind === 'institution') {
            return (
              <InstitutionCard
                key={item.id}
                item={item.data}
                isFollowing={followingIds.has(item.data.id)}
                followPending={followPendingIds.has(item.data.id)}
                onPress={() => router.push(routes.appInstitutionDetail(item.data.id))}
                onToggleFollow={() => void toggleFollowInstitution(item.data)}
              />
            );
          }

          return (
            <PostCard
              key={item.id}
              item={item.data}
              liked={likedPosts.has(item.data.id)}
              onToggleLike={() => void togglePostLike(item.data)}
              onOpenComments={() => void openPostComments({ id: item.data.id, title: 'Post' })}
              onShare={() => void sharePost(item.data)}
              onPressDonate={(campaignId) => router.push(routes.appDonate(campaignId))}
            />
          );
        })}
      </View>
    );
  }

  // ─── JSX ──────────────────────────────────────────────────────────────────

  if (activeRole === 'platform-admin') {
    const data = adminInstitutions.data as PendingInstitution[] | null;
    const adminSearch = search.trim().toLowerCase();
    const allAdminInstitutions = data ?? [];
    const pendingCount = allAdminInstitutions.filter(
      (item) => item.status === 'PENDING_APPROVAL',
    ).length;
    const availableStates = Array.from(
      new Set(
        allAdminInstitutions
          .map((item) => item.state?.trim())
          .filter((state): state is string => Boolean(state)),
      ),
    ).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    const getInstitutionTimestamp = (item: PendingInstitution) => {
      const timestamp = item.createdAt ? new Date(item.createdAt).getTime() : 0;
      return Number.isNaN(timestamp) ? 0 : timestamp;
    };
    const getActivityWeight = (item: PendingInstitution) => {
      if (item.status === 'PENDING_APPROVAL') return 3;
      if (item.status === 'ACTIVE') return 2;
      if (item.status === 'REJECTED') return 1;
      return 0;
    };
    const filteredAdminInstitutions = allAdminInstitutions
      .filter((item) => {
        const matchesSearch =
          !adminSearch ||
          [item.name, item.cnpj, item.email, item.city, item.state]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(adminSearch));

        const matchesStatus =
          adminInstitutionStatus === 'all' ||
          (adminInstitutionStatus === 'approved' && item.status === 'ACTIVE') ||
          (adminInstitutionStatus === 'pending' && item.status === 'PENDING_APPROVAL') ||
          (adminInstitutionStatus === 'rejected' && item.status === 'REJECTED');
        const matchesState =
          adminInstitutionState === 'all' || item.state === adminInstitutionState;

        return matchesSearch && matchesStatus && matchesState;
      })
      .sort((a, b) => {
        if (adminInstitutionSort === 'name') {
          return a.name.localeCompare(b.name, 'pt-BR');
        }

        if (adminInstitutionSort === 'activity') {
          const weightDifference = getActivityWeight(b) - getActivityWeight(a);
          if (weightDifference !== 0) return weightDifference;
        }

        return getInstitutionTimestamp(b) - getInstitutionTimestamp(a);
      });
    const statusFilters: {
      label: string;
      value: AdminInstitutionStatusFilter;
    }[] = [
      { label: 'Todas', value: 'all' },
      { label: 'Aprovadas', value: 'approved' },
      { label: 'Em análise', value: 'pending' },
      { label: 'Rejeitadas', value: 'rejected' },
    ];
    const sortFilters: {
      label: string;
      description: string;
      value: AdminInstitutionSort;
    }[] = [
      {
        label: 'Atividade recente',
        description: 'Prioriza cadastros que precisam de atenção.',
        value: 'activity',
      },
      {
        label: 'Mais recentes',
        description: 'Ordena pela data de cadastro.',
        value: 'recent',
      },
      {
        label: 'Nome A-Z',
        description: 'Ordena alfabeticamente.',
        value: 'name',
      },
    ];
    const activeAdvancedFiltersCount =
      (adminInstitutionState !== 'all' ? 1 : 0) +
      (adminInstitutionSort !== 'activity' ? 1 : 0);

    return (
      <ScreenContainer scrollable>
        <View style={styles.container}>
          <View style={styles.adminInstitutionsHeader}>
            <View style={styles.adminInstitutionsIntro}>
              <View style={styles.headerText}>
                <ThemedText variant="caption" color={colors.textMuted}>
                  Bem-vindo(a) de volta 👋
                </ThemedText>
                <ThemedText variant="title">Instituições</ThemedText>
                <ThemedText variant="caption" color={colors.textMuted}>
                  Cadastros, validações e status das instituições.
                </ThemedText>
              </View>
              <View style={[styles.adminPendingBadge, { backgroundColor: colors.accentSoft }]}>
                <ThemedText variant="body" color={colors.warning} style={styles.bold}>
                  {pendingCount}
                </ThemedText>
                <ThemedText variant="caption" color={colors.warning}>
                  Pendente
                </ThemedText>
              </View>
            </View>
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
            <View style={styles.adminInstitutionsContent}>
              <View style={styles.adminSearchRow}>
                <View style={styles.adminSearchInputWrap}>
                  <Input
                    placeholder="Buscar instituição"
                    value={search}
                    onChangeText={setSearch}
                    leftSlot={<Ionicons name="search-outline" size={20} color={colors.icon} />}
                    fieldStyle={styles.adminSearchInput}
                  />
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setAdminFilterOpen(true)}
                  style={[styles.adminFilterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="options-outline" size={22} color={colors.primary} />
                  {activeAdvancedFiltersCount > 0 ? (
                    <View style={[styles.adminFilterBadge, { backgroundColor: colors.primary }]}>
                      <ThemedText variant="caption" color={colors.surface} style={styles.bold}>
                        {activeAdvancedFiltersCount}
                      </ThemedText>
                    </View>
                  ) : null}
                </Pressable>
              </View>

              <Modal
                transparent
                animationType="slide"
                visible={adminFilterOpen}
                onRequestClose={() => setAdminFilterOpen(false)}>
                <Pressable
                  style={styles.adminBottomSheetBackdrop}
                  onPress={() => setAdminFilterOpen(false)}>
                  <Pressable
                    style={[styles.adminBottomSheet, { backgroundColor: colors.surface }]}
                    onPress={(event) => event.stopPropagation()}>
                    <View style={[styles.adminBottomSheetHandle, { backgroundColor: colors.border }]} />

                    <View style={styles.adminBottomSheetHeader}>
                      <View style={styles.headerText}>
                        <ThemedText variant="subtitle">Filtros</ThemedText>
                        <ThemedText variant="caption" color={colors.textMuted}>
                          Refine a lista de instituições.
                        </ThemedText>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => {
                          setAdminInstitutionState('all');
                          setAdminInstitutionSort('activity');
                        }}>
                        <ThemedText variant="body" color={colors.primary} style={styles.bold}>
                          Limpar
                        </ThemedText>
                      </Pressable>
                    </View>

                    <View style={styles.adminBottomSheetSection}>
                      <ThemedText variant="body" style={styles.bold}>
                        Estado
                      </ThemedText>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.adminStateFilters}>
                        {['all', ...availableStates].map((state) => {
                          const selected = adminInstitutionState === state;
                          const label = state === 'all' ? 'Todos' : state;

                          return (
                            <Pressable
                              key={state}
                              accessibilityRole="button"
                              onPress={() => setAdminInstitutionState(state)}
                              style={[
                                styles.adminStatusFilter,
                                {
                                  backgroundColor: selected ? colors.primarySoft : colors.surface,
                                  borderColor: selected ? colors.primary : colors.border,
                                },
                              ]}>
                              <ThemedText
                                variant="caption"
                                color={selected ? colors.primary : colors.textMuted}
                                style={selected ? styles.bold : undefined}>
                                {label}
                              </ThemedText>
                            </Pressable>
                          );
                        })}
                      </ScrollView>
                    </View>

                    <View style={styles.adminBottomSheetSection}>
                      <ThemedText variant="body" style={styles.bold}>
                        Ordenar por
                      </ThemedText>
                      <View style={styles.adminSortOptions}>
                        {sortFilters.map((filter) => {
                          const selected = adminInstitutionSort === filter.value;

                          return (
                            <Pressable
                              key={filter.value}
                              accessibilityRole="button"
                              onPress={() => setAdminInstitutionSort(filter.value)}
                              style={[
                                styles.adminSortOption,
                                {
                                  backgroundColor: selected ? colors.primarySoft : colors.surface,
                                  borderColor: selected ? colors.primary : colors.border,
                                },
                              ]}>
                              <View style={styles.headerText}>
                                <ThemedText
                                  variant="body"
                                  color={selected ? colors.primary : colors.text}
                                  style={styles.bold}>
                                  {filter.label}
                                </ThemedText>
                                <ThemedText variant="caption" color={colors.textMuted}>
                                  {filter.description}
                                </ThemedText>
                              </View>
                              {selected ? (
                                <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                              ) : null}
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>

                    <Button onPress={() => setAdminFilterOpen(false)}>
                      Aplicar filtros
                    </Button>
                  </Pressable>
                </Pressable>
              </Modal>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.adminStatusFilters}>
                {statusFilters.map((filter) => {
                  const selected = adminInstitutionStatus === filter.value;

                  return (
                    <Pressable
                      key={filter.value}
                      accessibilityRole="button"
                      onPress={() => setAdminInstitutionStatus(filter.value)}
                      style={[
                        styles.adminStatusFilter,
                        {
                          backgroundColor: selected ? colors.primarySoft : colors.surface,
                          borderColor: selected ? colors.primary : colors.border,
                        },
                      ]}>
                      <ThemedText
                        variant="caption"
                        color={selected ? colors.primary : colors.textMuted}
                        style={selected ? styles.bold : undefined}>
                        {filter.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {filteredAdminInstitutions.length === 0 ? (
                <EmptyState
                  title="Nenhuma instituição encontrada"
                  description={
                    search
                      ? `Nenhum cadastro encontrado para "${search}".`
                      : 'Não há instituições nesse filtro.'
                  }
                  illustration={<Ionicons name="business-outline" size={56} color={colors.border} />}
                />
              ) : (
                <View style={styles.list}>
                  {filteredAdminInstitutions.map((item) => {
                    const statusLabel =
                      item.status === 'ACTIVE'
                        ? 'Aprovada'
                        : item.status === 'REJECTED'
                          ? 'Rejeitada'
                          : 'Em análise';
                    const statusVariant =
                      item.status === 'ACTIVE'
                        ? 'success'
                        : item.status === 'REJECTED'
                          ? 'danger'
                          : 'warning';

                    return (
                      <Pressable
                        key={item.id}
                        accessibilityRole="button"
                        onPress={() => router.push(routes.appInstitutionDetail(item.id))}>
                        <Card variant="elevated" style={styles.adminInstitutionCard}>
                          <View style={[styles.adminInstitutionIcon, { backgroundColor: colors.primarySoft }]}>
                            <Ionicons name="business-outline" size={26} color={colors.primary} />
                          </View>
                          <View style={styles.adminInstitutionInfo}>
                            <ThemedText variant="body" style={styles.bold} numberOfLines={1}>
                              {item.name}
                            </ThemedText>
                            <ThemedText variant="caption" color={colors.textMuted} numberOfLines={1}>
                              CNPJ {item.cnpj}
                            </ThemedText>
                            <View style={styles.adminLocationRow}>
                              <Ionicons name="location-outline" size={13} color={colors.textMuted} />
                              <ThemedText variant="caption" color={colors.textMuted} numberOfLines={1}>
                                {[item.city, item.state].filter(Boolean).join(', ') || item.email}
                              </ThemedText>
                            </View>
                          </View>
                          <Tag label={statusLabel} variant={statusVariant} style={styles.adminStatusTag} />
                          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                        </Card>
                        {item.status === 'PENDING_APPROVAL' ? (
                          <View style={styles.adminInlineActions}>
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
                      </Pressable>
                    );
                  })}
                </View>
              )}
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
              <ThemedText variant="caption" color={colors.primary}>Bem-vindo(a), equipe!</ThemedText>
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

          <SegmentedToggle
            value={institutionCampaignFilter}
            onChange={setInstitutionCampaignFilter}
            options={[
              { key: 'active', label: 'Ativas' },
              { key: 'drafts', label: 'Rascunhos' },
              { key: 'ended', label: 'Encerradas' },
            ]}
          />

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

        {/* Busca + filtros */}
        <View style={styles.adminSearchRow}>
          <View style={styles.adminSearchInputWrap}>
            <Input
              value={search}
              onChangeText={setSearch}
              fieldStyle={styles.searchField}
              placeholder="Buscar posts, campanhas ou instituições..."
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              leftSlot={
                <View style={styles.searchIcon}>
                  <Ionicons name="search-outline" size={18} color={colors.icon} />
                </View>
              }
            />
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => setExploreFilterOpen(true)}
            style={[styles.adminFilterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="options-outline" size={22} color={colors.primary} />
            {activeExploreFiltersCount > 0 ? (
              <View style={[styles.adminFilterBadge, { backgroundColor: colors.primary }]}>
                <ThemedText variant="caption" color={colors.surface} style={styles.bold}>
                  {activeExploreFiltersCount}
                </ThemedText>
              </View>
            ) : null}
          </Pressable>
        </View>

        {locationError ? (
          <ThemedText variant="caption" color={colors.danger}>
            {locationError}
          </ThemedText>
        ) : null}

        <Modal
          transparent
          animationType="slide"
          visible={exploreFilterOpen}
          onRequestClose={() => setExploreFilterOpen(false)}>
          <Pressable style={styles.adminBottomSheetBackdrop} onPress={() => setExploreFilterOpen(false)}>
            <Pressable
              style={[styles.adminBottomSheet, { backgroundColor: colors.surface }]}
              onPress={(event) => event.stopPropagation()}>
              <View style={[styles.adminBottomSheetHandle, { backgroundColor: colors.border }]} />

              <View style={styles.adminBottomSheetHeader}>
                <View style={styles.headerText}>
                  <ThemedText variant="subtitle">Filtros</ThemedText>
                  <ThemedText variant="caption" color={colors.textMuted}>
                    Refine o que aparece no seu feed.
                  </ThemedText>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setActiveCategory('Todos');
                    if (nearMeEnabled) void handleNearMePress();
                  }}>
                  <ThemedText variant="body" color={colors.primary} style={styles.bold}>
                    Limpar
                  </ThemedText>
                </Pressable>
              </View>

              <View style={styles.adminBottomSheetSection}>
                <ThemedText variant="body" style={styles.bold}>Categoria</ThemedText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.adminStateFilters}>
                  {CAMPAIGN_CATEGORIES.map((cat) => {
                    const selected = activeCategory === cat;

                    return (
                      <Pressable
                        key={cat}
                        accessibilityRole="button"
                        onPress={() => setActiveCategory(cat)}
                        style={[
                          styles.adminStatusFilter,
                          {
                            backgroundColor: selected ? colors.primarySoft : colors.surface,
                            borderColor: selected ? colors.primary : colors.border,
                          },
                        ]}>
                        <ThemedText
                          variant="caption"
                          color={selected ? colors.primary : colors.textMuted}
                          style={selected ? styles.bold : undefined}>
                          {cat}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.adminBottomSheetSection}>
                <ThemedText variant="body" style={styles.bold}>Localização</ThemedText>
                <Pressable
                  accessibilityRole="button"
                  onPress={handleNearMePress}
                  style={[
                    styles.adminSortOption,
                    {
                      backgroundColor: nearMeEnabled ? colors.primarySoft : colors.surface,
                      borderColor: nearMeEnabled ? colors.primary : colors.border,
                    },
                  ]}>
                  <View style={styles.headerText}>
                    <ThemedText
                      variant="body"
                      color={nearMeEnabled ? colors.primary : colors.text}
                      style={styles.bold}>
                      {locationLoading ? 'Localizando...' : 'Perto de mim'}
                    </ThemedText>
                    <ThemedText variant="caption" color={colors.textMuted}>
                      Ordena o feed pela sua localização atual.
                    </ThemedText>
                  </View>
                  {nearMeEnabled ? (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  ) : null}
                </Pressable>
              </View>

              <Button onPress={() => setExploreFilterOpen(false)}>
                Aplicar filtros
              </Button>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Feed unificado — posts, campanhas e instituições */}
        {renderExploreFeed()}

      </View>

      <Modal
        animationType="slide"
        transparent
        visible={Boolean(commentTarget)}
        onRequestClose={() => setCommentTarget(null)}>
        <View style={styles.commentBackdrop}>
          <View style={[styles.commentSheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.commentHandle, { backgroundColor: colors.border }]} />
            <View style={styles.commentHeader}>
              <View style={styles.commentHeaderText}>
                <ThemedText variant="subtitle">Comentários</ThemedText>
                <ThemedText variant="caption" color={colors.textMuted} numberOfLines={1}>
                  {commentTarget?.title}
                </ThemedText>
              </View>
              <Pressable style={styles.commentCloseButton} onPress={() => setCommentTarget(null)}>
                <Ionicons name="close" size={22} color={colors.icon} />
              </Pressable>
            </View>

            {commentsLoading ? (
              <Loading label="Carregando comentários..." />
            ) : commentsError ? (
              <View style={styles.commentEmpty}>
                <Ionicons name="warning-outline" size={36} color={colors.danger} />
                <ThemedText variant="body" style={styles.bold}>Não foi possível carregar</ThemedText>
                <ThemedText variant="caption" color={colors.textMuted}>
                  {commentsError}
                </ThemedText>
                {commentTarget ? (
                  <Button size="sm" variant="secondary" onPress={() => void openPostComments(commentTarget)}>
                    Tentar novamente
                  </Button>
                ) : null}
              </View>
            ) : comments.length === 0 ? (
              <View style={styles.commentEmpty}>
                <Ionicons name="chatbubble-outline" size={36} color={colors.border} />
                <ThemedText variant="body" style={styles.bold}>Nenhum comentário ainda</ThemedText>
                <ThemedText variant="caption" color={colors.textMuted}>
                  Seja a primeira pessoa a comentar.
                </ThemedText>
              </View>
            ) : (
              <ScrollView style={styles.commentList} showsVerticalScrollIndicator={false}>
                {comments.map((comment, index) => (
                  <View key={comment.id}>
                    <View style={styles.commentItem}>
                      <Avatar
                        name={getCommentAuthorName(comment)}
                        source={comment.author?.profilePhotoUrl ? { uri: comment.author.profilePhotoUrl } : undefined}
                        size="sm"
                      />
                      <View style={styles.commentBody}>
                        <ThemedText variant="body" style={styles.bold}>
                          {getCommentAuthorName(comment)}
                        </ThemedText>
                        <ThemedText variant="body">{comment.content}</ThemedText>
                        <ThemedText variant="caption" color={colors.textMuted}>
                          {formatFeedDate(comment.createdAt)}
                        </ThemedText>
                      </View>
                    </View>
                    {index < comments.length - 1 ? <Divider /> : null}
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={[styles.commentInputRow, { borderColor: colors.border }]}>
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Escreva um comentário..."
                placeholderTextColor={colors.textMuted}
                style={[styles.commentInput, { color: colors.text }]}
              />
              <Pressable
                disabled={commentSubmitting || !commentText.trim()}
                onPress={() => void submitPostComment()}
                style={[
                  styles.commentSendButton,
                  { backgroundColor: commentText.trim() ? colors.primary : colors.surfaceMuted },
                ]}>
                <Ionicons name="send" size={18} color={commentText.trim() ? '#FFFFFF' : colors.icon} />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
