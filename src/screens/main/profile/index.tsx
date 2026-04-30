import { View } from 'react-native';

import { Avatar, Button, Card, ScreenContainer, ThemedText } from '@/components';
import { roleLabels } from '@/navigation/session';
import { useAppStore } from '@/store';

import { styles } from './styles';

export function ProfileScreen() {
  const logout = useAppStore((state) => state.logout);
  const user = useAppStore((state) => state.user);

  return (
    <ScreenContainer scrollable>
      <View style={styles.section}>
        <Card>
          <View style={styles.identity}>
            <Avatar name={user?.name} size="lg" />
            <View style={styles.identity}>
              <ThemedText variant="title">{user?.name}</ThemedText>
              <ThemedText variant="body">{user?.email}</ThemedText>
              {user ? <ThemedText variant="caption">{roleLabels[user.role]}</ThemedText> : null}
            </View>
          </View>
        </Card>

        <Button variant="danger" onPress={logout}>
          Sair
        </Button>
      </View>
    </ScreenContainer>
  );
}
