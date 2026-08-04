import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, View } from 'react-native';

import { Avatar, Button, Card, Divider, EmptyState, Loading, ScreenContainer, ThemedText } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFetch } from '@/hooks/use-fetch';
import { notificationsService, type AppNotification } from '@/services/notifications';
import { useAppStore } from '@/store';
import { theme } from '@/theme';

import { styles } from './styles';

function formatRelativeDate(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  return `${days} d`;
}

function getIcon(type: AppNotification['type']) {
  switch (type) {
    case 'CAMPAIGN_UPDATE': return 'megaphone-outline';
    case 'DONATION_STATUS_UPDATED': return 'heart-outline';
    case 'NEW_FOLLOWER': return 'person-add-outline';
    case 'NEW_MESSAGE': return 'chatbubble-outline';
    default: return 'notifications-outline';
  }
}

export function NotificationsScreen() {
  const router = useRouter();
  const authToken = useAppStore((state) => state.authToken);
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  const notifications = useFetch(
    useCallback(() => notificationsService.listMine(authToken), [authToken]),
  );

  async function handleNotificationPress(notification: AppNotification) {
    if (!notification.readAt) {
      await notificationsService.markAsRead(notification.id, authToken);
      void notifications.refetch();
    }
  }

  const items = notifications.data ?? [];

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={26} color={colors.primaryStrong} />
          </Pressable>
          <View style={styles.headerText}>
            <ThemedText variant="title">Notificações</ThemedText>
            <ThemedText variant="body" color={colors.textMuted}>
              Curtidas, comentários, mensagens e novidades das campanhas que você acompanha.
            </ThemedText>
          </View>
        </View>

        {notifications.loading && <Loading label="Carregando notificações..." />}

        {notifications.error ? (
          <EmptyState
            title="Não foi possível carregar"
            description={notifications.error}
            illustration={<Ionicons name="cloud-offline-outline" size={56} color={colors.border} />}
            action={<Button size="sm" variant="secondary" onPress={notifications.refetch}>Tentar novamente</Button>}
          />
        ) : null}

        {!notifications.loading && !notifications.error && items.length === 0 ? (
          <EmptyState
            title="Nenhuma notificação"
            description="Quando houver curtidas, comentários, mensagens ou campanhas novas, elas aparecerão aqui."
            illustration={<Ionicons name="notifications-outline" size={56} color={colors.border} />}
          />
        ) : null}

        {!notifications.loading && !notifications.error && items.length > 0 ? (
          <Card padding="none" style={styles.listCard}>
            {items.map((item, index) => {
              const unread = !item.readAt;

              return (
                <View key={item.id}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => void handleNotificationPress(item)}
                    style={[
                      styles.notificationRow,
                      unread ? { backgroundColor: colors.primarySoft } : undefined,
                    ]}>
                    <View style={styles.avatarWrap}>
                      <Avatar name={item.title} size="sm" />
                      <View style={[styles.typeIcon, { backgroundColor: colors.primary }]}>
                        <Ionicons name={getIcon(item.type)} size={13} color={colors.surface} />
                      </View>
                    </View>
                    <View style={styles.notificationContent}>
                      <View style={styles.notificationTitleRow}>
                        <ThemedText variant="body" style={styles.bold} numberOfLines={1}>
                          {item.title}
                        </ThemedText>
                        {unread ? <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} /> : null}
                      </View>
                      <ThemedText variant="caption" color={colors.textMuted} numberOfLines={2}>
                        {item.body}
                      </ThemedText>
                      <ThemedText variant="caption" color={colors.textMuted}>
                        {formatRelativeDate(item.createdAt)}
                      </ThemedText>
                    </View>
                  </Pressable>
                  {index < items.length - 1 ? <Divider /> : null}
                </View>
              );
            })}
          </Card>
        ) : null}
      </View>
    </ScreenContainer>
  );
}
