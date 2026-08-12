import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Button, Card, EmptyState, Loading, ProgressBar, Tag, ThemedText } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFetch } from '@/hooks/use-fetch';
import { routes } from '@/navigation/routes';
import { campaignsService } from '@/services/campaigns';
import { chatService } from '@/services/chat';
import { useActiveRole, useAppStore } from '@/store';
import { theme } from '@/theme';

import { styles } from './styles';

function formatDate(iso?: string) {
  if (!iso) return null;
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

export function CampaignDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const insets = useSafeAreaInsets();
  const activeRole = useActiveRole();
  const authToken = useAppStore((state) => state.authToken);
  const [openingChat, setOpeningChat] = useState(false);

  const fetcher = useCallback(() => campaignsService.getCampaignById(id), [id]);
  const { data: campaign, loading, error, refetch } = useFetch(fetcher);

  // ─── States ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <View style={[styles.backBar, { paddingTop: insets.top }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        </View>
        <Loading label="Carregando campanha..." style={styles.centered} />
      </View>
    );
  }

  if (error || !campaign) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <View style={[styles.backBar, { paddingTop: insets.top }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        </View>
        <EmptyState
          title="Não foi possível carregar"
          description={error ?? 'Campanha não encontrada.'}
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

  const endsAt = formatDate(campaign.endsAt);

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Header bar */}
      <View style={[styles.backBar, { paddingTop: insets.top, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <ThemedText variant="subtitle" numberOfLines={1} style={styles.headerTitle}>
          {campaign.title}
        </ThemedText>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={[styles.cover, { backgroundColor: colors.primarySoft }]}>
          {campaign.bannerUrl ? (
            <Image
              source={campaign.bannerUrl}
              style={styles.coverImage}
              contentFit="cover"
              transition={150}
            />
          ) : (
            <Ionicons name="image-outline" size={36} color={colors.primary} />
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.tagsRow}>
            <Tag label={campaign.category} variant="info" />
            {endsAt ? <Tag label={`Encerra em ${endsAt}`} variant="warning" /> : null}
            {!campaign.active ? <Tag label="Encerrada" variant="neutral" /> : null}
          </View>
          <ThemedText variant="title">
            {campaign.title}
          </ThemedText>
          <Pressable
            style={styles.organizerInline}
            onPress={() => router.push(routes.appInstitutionDetail(campaign.institutionId))}>
            <Avatar name={campaign.institution} size="sm" />
            <ThemedText variant="body" style={styles.bold}>
              {campaign.institution}
            </ThemedText>
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary} />
          </Pressable>
          <ProgressBar value={campaign.progress} />
          <View style={styles.progressMeta}>
            <ThemedText variant="caption" color={colors.primary} style={styles.bold}>
              {campaign.raisedFormatted} arrecadados
            </ThemedText>
            <ThemedText variant="caption" color={colors.textMuted}>
              meta {campaign.goalFormatted}
            </ThemedText>
          </View>
          <View style={styles.statsGrid}>
            <View style={[styles.statPill, { backgroundColor: colors.surfaceMuted }]}>
              <ThemedText variant="subtitle">{campaign.donorsCount}</ThemedText>
              <ThemedText variant="caption" color={colors.textMuted}>doadores</ThemedText>
            </View>
            <View style={[styles.statPill, { backgroundColor: colors.surfaceMuted }]}>
              <ThemedText variant="subtitle">{campaign.progress}%</ThemedText>
              <ThemedText variant="caption" color={colors.textMuted}>da meta</ThemedText>
            </View>
          </View>
        </View>

        {/* Sobre a campanha */}
        <View style={styles.section}>
          <ThemedText variant="subtitle">Prestação e propósito</ThemedText>
          <ThemedText variant="body" color={colors.textMuted}>
            {campaign.description}
          </ThemedText>
        </View>

        {/* Instituição organizadora */}
        <View style={styles.section}>
          <ThemedText variant="subtitle">Organizado por</ThemedText>
          <Pressable onPress={() => router.push(routes.appInstitutionDetail(campaign.institutionId))}>
            <Card variant="outlined">
              <View style={styles.institutionRow}>
                <Avatar name={campaign.institution} size="md" />
                <View style={styles.institutionInfo}>
                  <ThemedText variant="body" style={styles.bold}>
                    {campaign.institution}
                  </ThemedText>
                  <ThemedText variant="caption" color={colors.primary}>
                    Ver instituição →
                  </ThemedText>
                </View>
              </View>
            </Card>
          </Pressable>
        </View>

        {/* Itens necessários */}
        {campaign.itemsNeeded && campaign.itemsNeeded.length > 0 && (
          <View style={styles.section}>
            <ThemedText variant="subtitle">O que precisamos</ThemedText>
            <View style={styles.itemsGrid}>
              {campaign.itemsNeeded.map((item) => (
                <View
                  key={item}
                  style={[styles.itemChip, { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }]}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                  <ThemedText variant="caption" color={colors.primaryStrong}>
                    {item}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Espaço para a action bar */}
        <View style={styles.actionBarSpacer} />
      </ScrollView>

      {/* Action bar fixa */}
      {campaign.active && activeRole === 'donor' && (
        <View style={[
          styles.actionBar,
          { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 16) }
        ]}>
          <Button
            variant="ghost"
            style={styles.actionButton}
            leftSlot={<Ionicons name="chatbubble-outline" size={16} color={colors.primary} />}
            disabled={openingChat}
            onPress={async () => {
              if (openingChat) return;
              setOpeningChat(true);
              try {
                const conversationId = await chatService.ensureConversation(
                  campaign.institutionId,
                  campaign.institution,
                  authToken,
                  campaign.id,
                );
                router.push(routes.appChat(conversationId));
              } finally {
                setOpeningChat(false);
              }
            }}>
            Conversar
          </Button>
          <Button
            variant="primary"
            style={styles.actionButton}
            leftSlot={<Ionicons name="heart-outline" size={16} color={colors.surface} />}
            onPress={() => {
              router.push(routes.appDonate(campaign.id));
            }}>
            Quero doar
          </Button>
        </View>
      )}
    </View>
  );
}
