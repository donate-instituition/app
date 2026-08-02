import { View } from 'react-native';

import { Button, Card, FeedbackState, ScreenContainer, ScreenState, Tag, ThemedText } from '@/components';
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

        <ThemedText variant="subtitle">Estados visuais</ThemedText>

        <Card>
          <ScreenState loading loadingLabel="Carregando doacoes">
            <ThemedText>Conteudo carregado</ThemedText>
          </ScreenState>
        </Card>

        <Card>
          <ScreenState
            empty
            emptyState={{
              title: 'Nenhuma doacao encontrada',
              description: 'Quando houver registros, eles aparecerao aqui.',
            }}>
            <ThemedText>Lista de doacoes</ThemedText>
          </ScreenState>
        </Card>

        <FeedbackState
          variant="error"
          title="Erro ao carregar"
          description="Exemplo de feedback de erro padronizado."
          primaryAction={<Button variant="secondary">Tentar novamente</Button>}
        />

        <FeedbackState
          variant="success"
          title="Status atualizado"
          description="Exemplo de feedback de sucesso apos uma acao."
        />
      </View>
    </ScreenContainer>
  );
}
