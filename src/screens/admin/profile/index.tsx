import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import {
  Avatar,
  Button,
  Card,
  ScreenContainer,
  Tag,
  ThemedText,
} from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { routes } from '@/navigation/routes';
import { authService } from '@/services/auth';
import { useAppStore } from '@/store';
import { theme } from '@/theme';

import { styles } from './styles';

export function AdminProfileScreen() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const authToken = useAppStore((state) => state.authToken);
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  async function handleLogout() {
    await authService.logout();
    useAppStore.getState().logout();
    router.replace(routes.authAccess);
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText variant="title">Configurações</ThemedText>
          <ThemedText variant="caption" color={colors.textMuted}>
            Conta, segurança, notificações e suporte.
          </ThemedText>
        </View>

        {/* User Info */}
        <Card variant="elevated">
          <View style={styles.userCard}>
            <Avatar name={user?.name} size="lg" />
            <View style={styles.userInfo}>
              <ThemedText variant="body" style={styles.bold}>
                {user?.name ?? 'Admin Dev'}
              </ThemedText>
              <ThemedText variant="caption" color={colors.textMuted}>
                {user?.email ?? 'dev.admin@elodoar.local'}
              </ThemedText>
              <Tag label="Admin plataforma" variant="info" />
            </View>
          </View>
        </Card>

        {/* View Mode */}
        <View style={styles.section}>
          <ThemedText variant="subtitle">Visualização atual</ThemedText>
          <View style={styles.viewModeGrid}>
            <Pressable
              style={[
                styles.viewModeButton,
                styles.viewModeActive,
                { backgroundColor: colors.primary },
              ]}>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <ThemedText variant="body" style={{ color: '#fff' }}>
                Admin plataforma
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.viewModeButton,
                { backgroundColor: colors.surface },
              ]}>
              <Ionicons
                name="radio-button-off-outline"
                size={20}
                color={colors.text}
              />
              <ThemedText variant="body">Usuário padrão</ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Initial Screen */}
        <View style={styles.section}>
          <ThemedText variant="subtitle">Tela inicial após login</ThemedText>
          <View style={styles.viewModeGrid}>
            <Pressable
              style={[
                styles.viewModeButton,
                { backgroundColor: colors.surface },
              ]}>
              <Ionicons
                name="radio-button-off-outline"
                size={20}
                color={colors.text}
              />
              <ThemedText variant="body">Admin plataforma</ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.viewModeButton,
                styles.viewModeActive,
                { backgroundColor: colors.primary },
              ]}>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <ThemedText variant="body" style={{ color: '#fff' }}>
                Usuário padrão
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <ThemedText variant="subtitle">Conta</ThemedText>
          <Card variant="outlined">
            <Pressable
              style={styles.menuItem}
              onPress={() => router.push(routes.profileMe)}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="person-outline" size={20} color={colors.icon} />
                <ThemedText variant="body">Meus dados</ThemedText>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => router.push(routes.profileNotifications)}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="notifications-outline" size={20} color={colors.icon} />
                <ThemedText variant="body">Preferências de notificação</ThemedText>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => router.push(routes.profilePrivacy)}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="shield-outline" size={20} color={colors.icon} />
                <ThemedText variant="body">Privacidade e segurança</ThemedText>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => router.push(routes.profileHelp)}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="help-circle-outline" size={20} color={colors.icon} />
                <ThemedText variant="body">Ajuda e suporte</ThemedText>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          </Card>
        </View>

        {/* Logout */}
        <Button variant="danger" onPress={handleLogout}>
          Sair da conta
        </Button>
      </View>
    </ScreenContainer>
  );
}
