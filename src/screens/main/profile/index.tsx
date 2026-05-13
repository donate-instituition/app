import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Avatar, Button, Card, Divider, ScreenContainer, Tag, ThemedText } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { roleLabels } from '@/navigation/session';
import { useAppStore } from '@/store';
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
  const user = useAppStore((state) => state.user);
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

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
                <Tag label={roleLabels[user.role]} variant="success" />
              )}
            </View>
          </View>
        </Card>

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
        <Button variant="danger" onPress={logout}>
          Sair da conta
        </Button>

      </View>
    </ScreenContainer>
  );
}

