import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Avatar, Button, Card, Divider, ScreenContainer, Tag, ThemedText } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getHomeRouteForRole } from '@/navigation/routes';
import { getPreferredInitialRole, getSessionRoles, roleLabels, type UserRole } from '@/navigation/session';
import { ApiError } from '@/services/api';
import { authService } from '@/services/auth';
import { useActiveRole, useAppStore } from '@/store';
import { theme } from '@/theme';

import { styles } from './styles';

type MenuItemProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress?: () => void;
};

function MenuItem({ icon, label, onPress }: MenuItemProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  return (
    <Pressable onPress={onPress}>
      <View style={styles.menuItem}>
        <Ionicons name={icon} size={20} color={colors.icon} />
        <ThemedText variant="body" style={styles.menuLabel}>
          {label}
        </ThemedText>
        <Ionicons name="chevron-forward" size={16} color={colors.border} />
      </View>
    </Pressable>
  );
}

export function ProfileScreen() {
  const logout = useAppStore((state) => state.logout);
  const authToken = useAppStore((state) => state.authToken);
  const refreshToken = useAppStore((state) => state.refreshToken);
  const user = useAppStore((state) => state.user);
  const setActiveRole = useAppStore((state) => state.setActiveRole);
  const setPreferredRole = useAppStore((state) => state.setPreferredRole);
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const availableRoles = getSessionRoles(user);
  const activeRole = useActiveRole();
  const preferredRole = getPreferredInitialRole(user);
  const [savingPreferredRole, setSavingPreferredRole] = useState<UserRole | null>(null);
  const [settingsError, setSettingsError] = useState('');

  async function handleLogout() {
    try {
      await authService.logout(authToken, refreshToken);
    } catch {
      // ignore backend logout errors and clear local session
    } finally {
      logout();
    }
  }

  function handleChangeActiveRole(role: UserRole) {
    if (role === activeRole) return;

    setActiveRole(role);
    router.replace(getHomeRouteForRole(role));
  }

  async function handleChangePreferredRole(role: UserRole) {
    if (role === preferredRole || savingPreferredRole) return;

    setSettingsError('');
    setSavingPreferredRole(role);

    try {
      const updatedUser = await authService.updatePreferredRole(role, authToken);
      setPreferredRole(updatedUser.preferredRole ?? role);
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        setSettingsError('Essa tela inicial não está disponível para sua conta.');
      } else {
        setSettingsError('Não foi possível salvar sua preferência.');
      }
    } finally {
      setSavingPreferredRole(null);
    }
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>

        {/* Identidade */}
        <Card>
          <View style={styles.identity}>
            <Avatar name={user?.name} size="lg" />
            <View style={styles.identityInfo}>
              <ThemedText variant="title" style={styles.centered}>
                {user?.name}
              </ThemedText>
              <ThemedText variant="body" color={colors.textMuted} style={styles.centered}>
                {user?.email}
              </ThemedText>
              {user && (
                <Tag label={roleLabels[activeRole]} variant="success" />
              )}
            </View>
          </View>
        </Card>

        {user && availableRoles.length > 1 ? (
          <View style={styles.section}>
            <ThemedText variant="subtitle">Visualização atual</ThemedText>
            <Card>
              <View style={styles.roleSwitcher}>
                {availableRoles.map((role) => {
                  const selected = role === activeRole;

                  return (
                    <Pressable
                      key={role}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => handleChangeActiveRole(role)}
                      style={[
                        styles.roleOption,
                        {
                          backgroundColor: selected ? colors.primary : colors.surfaceMuted,
                          borderColor: selected ? colors.primary : colors.border,
                        },
                      ]}>
                      <Ionicons
                        name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                        size={16}
                        color={selected ? colors.surface : colors.icon}
                      />
                      <ThemedText
                        variant="caption"
                        color={selected ? colors.surface : colors.text}>
                        {roleLabels[role]}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </Card>
          </View>
        ) : null}

        {user && availableRoles.length > 1 ? (
          <View style={styles.section}>
            <ThemedText variant="subtitle">Tela inicial após login</ThemedText>
            <Card>
              <View style={styles.roleSwitcher}>
                {availableRoles.map((role) => {
                  const selected = role === preferredRole;
                  const saving = role === savingPreferredRole;

                  return (
                    <Pressable
                      key={role}
                      accessibilityRole="button"
                      accessibilityState={{ selected, disabled: Boolean(savingPreferredRole) }}
                      disabled={Boolean(savingPreferredRole)}
                      onPress={() => handleChangePreferredRole(role)}
                      style={[
                        styles.roleOption,
                        {
                          backgroundColor: selected ? colors.primary : colors.surfaceMuted,
                          borderColor: selected ? colors.primary : colors.border,
                          opacity: savingPreferredRole && !saving ? 0.64 : 1,
                        },
                      ]}>
                      <Ionicons
                        name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                        size={16}
                        color={selected ? colors.surface : colors.icon}
                      />
                      <ThemedText
                        variant="caption"
                        color={selected ? colors.surface : colors.text}>
                        {saving ? 'Salvando...' : roleLabels[role]}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
              {settingsError ? (
                <ThemedText variant="caption" color={colors.danger} style={styles.settingsError}>
                  {settingsError}
                </ThemedText>
              ) : null}
            </Card>
          </View>
        ) : null}

        {/* Conta */}
        <View style={styles.section}>
          <ThemedText variant="subtitle">Conta</ThemedText>
          <Card padding="none">
            <MenuItem icon="person-outline" label="Meus dados" />
            <Divider />
            <MenuItem icon="notifications-outline" label="Notificações" />
            <Divider />
            <MenuItem icon="lock-closed-outline" label="Privacidade e segurança" />
            <Divider />
            <MenuItem icon="help-circle-outline" label="Ajuda e suporte" />
          </Card>
        </View>

        {/* Sair */}
        <Button variant="danger" onPress={handleLogout}>
          Sair da conta
        </Button>

      </View>
    </ScreenContainer>
  );
}
