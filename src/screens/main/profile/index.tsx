import { View } from 'react-native';

import { Avatar, Button, Card, ProgressBar, ScreenContainer, Tag, ThemedText, ThemedView } from '@/components';
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
              {user ? <Tag label={roleLabels[user.role]} variant="info" /> : null}
            </View>
          </View>
        </Card>

        <ThemedView style={styles.panel}>
          <ThemedText variant="subtitle">ThemedView</ThemedText>
          <ThemedText variant="body">
            Este bloco usa o fundo padrao do tema e demonstra composicao com componentes base.
          </ThemedText>
          <ProgressBar value={72} variant="success" />
        </ThemedView>

        <Button variant="danger" onPress={logout}>
          Sair
        </Button>
      </View>
    </ScreenContainer>
  );
}
