import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Card, Divider, EmptyState, Loading, ScreenContainer, ThemedText } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFetch } from '@/hooks/use-fetch';
import { adminService, type AuditLog } from '@/services/admin';
import { useAppStore } from '@/store';
import { theme } from '@/theme';

import { styles } from './styles';

function formatDateTime(iso?: string) {
  if (!iso) return 'Sem data';

  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getActorLabel(log: AuditLog) {
  const actor = log.metadata?.actorEmail ?? log.metadata?.email ?? log.metadata?.userEmail;

  if (typeof actor === 'string' && actor.trim()) {
    return actor;
  }

  return log.actorUserId ?? 'Sistema';
}

function getMetadataText(metadata?: Record<string, unknown>) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return '';
  }

  return JSON.stringify(metadata, null, 2);
}

function detailRows(log: AuditLog) {
  return [
    { label: 'Ação', value: log.action },
    { label: 'Data', value: formatDateTime(log.createdAt) },
    { label: 'Ator', value: getActorLabel(log) },
    { label: 'ID do ator', value: log.actorUserId ?? 'Não informado' },
    { label: 'Tipo do alvo', value: log.targetType },
    { label: 'ID do alvo', value: log.targetId ?? 'Não informado' },
    { label: 'IP', value: log.ip ?? 'Não informado' },
    { label: 'User agent', value: log.userAgent ?? 'Não informado' },
  ];
}

export function AdminAuditDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const authToken = useAppStore((state) => state.authToken);

  const fetcher = useCallback(
    () => adminService.getAuditLog(id, authToken),
    [authToken, id],
  );
  const { data, loading, error, refetch } = useFetch(fetcher);

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.container}>
          <View style={styles.backBar}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
          </View>
          <Loading label="Carregando evento..." />
        </View>
      </ScreenContainer>
    );
  }

  if (error || !data) {
    return (
      <ScreenContainer>
        <View style={styles.container}>
          <View style={styles.backBar}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
          </View>
          <EmptyState
            title="Não foi possível carregar"
            description={error ?? 'Evento de auditoria não encontrado.'}
            illustration={<Ionicons name="shield-outline" size={56} color={colors.border} />}
            action={
              <Pressable onPress={refetch}>
                <ThemedText variant="body" color={colors.primary} style={styles.bold}>
                  Tentar novamente
                </ThemedText>
              </Pressable>
            }
          />
        </View>
      </ScreenContainer>
    );
  }

  const metadataText = getMetadataText(data.metadata);

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <View style={styles.backBar}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <ThemedText variant="subtitle" numberOfLines={1} style={styles.backTitle}>
            Detalhe da auditoria
          </ThemedText>
          <View style={styles.backButton} />
        </View>

        <Card style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={[styles.heroIcon, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name="shield-checkmark-outline" size={28} color={colors.primary} />
            </View>
            <View style={styles.heroText}>
              <ThemedText variant="title" numberOfLines={2}>
                {data.action}
              </ThemedText>
              <ThemedText variant="body" color={colors.textMuted}>
                {formatDateTime(data.createdAt)}
              </ThemedText>
            </View>
          </View>

          <View style={[styles.eventCode, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
            <ThemedText variant="caption" color={colors.textMuted}>ID do evento</ThemedText>
            <ThemedText variant="body" style={styles.bold} numberOfLines={2}>
              {data.id}
            </ThemedText>
          </View>
        </Card>

        <View style={styles.section}>
          <ThemedText variant="subtitle">Informações</ThemedText>
          <Card padding="none" style={styles.listCard}>
            {detailRows(data).map((item, index, rows) => (
              <View key={item.label}>
                <View style={styles.row}>
                  <ThemedText variant="caption" color={colors.textMuted}>{item.label}</ThemedText>
                  <ThemedText variant="body" numberOfLines={item.label === 'User agent' ? 4 : 2}>
                    {item.value}
                  </ThemedText>
                </View>
                {index < rows.length - 1 ? <Divider /> : null}
              </View>
            ))}
          </Card>
        </View>

        <View style={styles.section}>
          <ThemedText variant="subtitle">Metadata</ThemedText>
          {metadataText ? (
            <Card style={styles.metadataCard}>
              <Text style={[styles.metadataLine, { backgroundColor: colors.surfaceMuted, color: colors.text }]}>
                {metadataText}
              </Text>
            </Card>
          ) : (
            <Card style={styles.emptyCard}>
              <Ionicons name="document-text-outline" size={36} color={colors.border} />
              <ThemedText variant="body" style={styles.bold}>Sem metadata</ThemedText>
            </Card>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
