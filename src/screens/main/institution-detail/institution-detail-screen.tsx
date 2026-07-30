import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Button, Card, Divider, EmptyState, Loading, ProgressBar, Tag, ThemedText } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFetch } from '@/hooks/use-fetch';
import { routes } from '@/navigation/routes';
import { campaignsService, type Campaign } from '@/services/campaigns';
import { chatService } from '@/services/chat';
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

  const fetcher = useCallback(() => campaignsService.getInstitutionById(id), [id]);
  const { data: institution, loading, error, refetch } = useFetch(fetcher);

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
        <Card>
          <View style={styles.identity}>
            <Avatar name={institution.name} size="lg" />
            <View style={styles.identityInfo}>
              <View style={styles.nameRow}>
                <ThemedText variant="title" style={styles.textCentered}>
                  {institution.name}
                </ThemedText>
                {institution.verified && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                )}
              </View>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                <ThemedText variant="caption" color={colors.textMuted}>
                  {institution.city}, {institution.state}
                </ThemedText>
              </View>
              <View style={styles.tagRow}>
                <Tag label={institution.category} variant="info" />
                {institution.verified && <Tag label="Verificada" variant="success" />}
              </View>
            </View>
          </View>
        </Card>

        {/* Sobre */}
        <View style={styles.section}>
          <ThemedText variant="subtitle">Sobre a instituição</ThemedText>
          <ThemedText variant="body" color={colors.textMuted}>
            {institution.description}
          </ThemedText>
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

        {/* Campanhas ativas */}
        {activeCampaigns.length > 0 && (
          <View style={styles.section}>
            <ThemedText variant="subtitle">
              Campanhas ativas ({activeCampaigns.length})
            </ThemedText>
            <Card padding="none">
              {activeCampaigns.map((c, index) => (
                <View key={c.id}>
                  <CampaignRow
                    item={c}
                    onPress={() => router.push(routes.appCampaignDetail(c.id))}
                  />
                  {index < activeCampaigns.length - 1 && <Divider />}
                </View>
              ))}
            </Card>
          </View>
        )}

        <View style={styles.actionBarSpacer} />
      </ScrollView>

      {/* Action bar fixa */}
      <View style={[
        styles.actionBar,
        { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 16) },
      ]}>
        <Button
          variant="primary"
          style={styles.actionButton}
          leftSlot={<Ionicons name="chatbubble-outline" size={16} color={colors.surface} />}
          onPress={() => {
            const conversationId = chatService.ensureConversation(
              institution.id,
              institution.name
            );
            router.push(routes.appChat(conversationId));
          }}>
          Conversar com a Instituição
        </Button>
      </View>
    </View>
  );
}
