import { View } from 'react-native';

import { Card, ProgressBar, ScreenContainer, Tag, ThemedText } from '@/components';
import { roleLabels } from '@/navigation/session';
import { useAppStore } from '@/store';

import { styles } from './styles';

export function DashboardScreen() {
  const user = useAppStore((state) => state.user);

  return (
    <ScreenContainer scrollable>
      <View style={styles.section}>
        <View style={styles.header}>
          <Tag label={user ? roleLabels[user.role] : 'Visitante'} variant="success" />
          <ThemedText variant="title">Ola, {user?.name}</ThemedText>
          <ThemedText variant="body">
            Esta e a entrada mockada da area logada. O conteudo muda conforme o perfil escolhido no
            login.
          </ThemedText>
        </View>

        <View style={styles.grid}>
          <Card style={styles.metric}>
            <ThemedText variant="caption">Campanhas</ThemedText>
            <ThemedText variant="subtitle">{user?.role === 'platform-admin' ? '25' : '4'}</ThemedText>
          </Card>
          <Card style={styles.metric}>
            <ThemedText variant="caption">Doacoes</ThemedText>
            <ThemedText variant="subtitle">{user?.role === 'donor' ? '14' : '120'}</ThemedText>
          </Card>
          <Card style={styles.metric}>
            <ThemedText variant="caption">Valor movimentado</ThemedText>
            <ThemedText variant="subtitle">R$ 12.500</ThemedText>
          </Card>
          <Card style={styles.metric}>
            <ThemedText variant="caption">Entrega</ThemedText>
            <ThemedText variant="subtitle">98%</ThemedText>
          </Card>
        </View>

        <Card>
          <View style={styles.section}>
            <ThemedText variant="subtitle">Meta em destaque</ThemedText>
            <ProgressBar value={64} />
            <ThemedText variant="body">
              A navegacao principal ja esta preparada para receber os fluxos centrais do usuario.
            </ThemedText>
          </View>
        </Card>
      </View>
    </ScreenContainer>
  );
}
