import { View } from 'react-native';

import { Button, Card, ScreenContainer, Tag, ThemedText } from '@/components';
import { useAppStore } from '@/store';

import { styles } from './styles';

export function CampaignsScreen() {
  const user = useAppStore((state) => state.user);
  const isAdmin = user?.role === 'platform-admin';

  return (
    <ScreenContainer scrollable>
      <View style={styles.section}>
        <ThemedText variant="title">{isAdmin ? 'Instituicoes' : 'Campanhas'}</ThemedText>
        <ThemedText variant="body">
          {isAdmin
            ? 'Area reservada para aprovacao e acompanhamento de instituicoes.'
            : 'Area central para busca, criacao ou acompanhamento de campanhas.'}
        </ThemedText>

        <Card>
          <View style={styles.section}>
            <Tag label={isAdmin ? 'Pendente' : 'Ativa'} variant={isAdmin ? 'warning' : 'success'} />
            <ThemedText variant="subtitle">
              {isAdmin ? 'Instituto Novo Caminho' : 'Campanha do Agasalho'}
            </ThemedText>
            <ThemedText variant="body">
              Placeholder do fluxo principal. A implementacao detalhada vem nas proximas HUs.
            </ThemedText>
            <Button variant="secondary">{isAdmin ? 'Ver detalhes' : 'Acessar campanha'}</Button>
          </View>
        </Card>
      </View>
    </ScreenContainer>
  );
}
