import { View } from 'react-native';

import { Card, ScreenContainer, Tag, ThemedText } from '@/components';
import { useAppStore } from '@/store';

import { styles } from './styles';

export function DonationsScreen() {
  const user = useAppStore((state) => state.user);
  const title = user?.role === 'platform-admin' ? 'Usuarios' : 'Doacoes';

  return (
    <ScreenContainer scrollable>
      <View style={styles.section}>
        <ThemedText variant="title">{title}</ThemedText>
        <ThemedText variant="body">
          {user?.role === 'platform-admin'
            ? 'Base para gerenciamento de usuarios da plataforma.'
            : 'Base para acompanhamento de doacoes realizadas ou recebidas.'}
        </ThemedText>

        <Card>
          <View style={styles.section}>
            <Tag label="Mock" variant="info" />
            <ThemedText variant="subtitle">Registro #000123</ThemedText>
            <ThemedText variant="body">Status: em transito</ThemedText>
          </View>
        </Card>
      </View>
    </ScreenContainer>
  );
}
