import { View } from 'react-native';

import { Card, Divider, EmptyState, Loading, ScreenContainer, Tag, ThemedText } from '@/components';
import { useAppStore } from '@/store';

import { styles } from './styles';

export function MessagesScreen() {
  const user = useAppStore((state) => state.user);
  const isAdmin = user?.role === 'platform-admin';

  return (
    <ScreenContainer scrollable>
      <View style={styles.section}>
        <ThemedText variant="title">{isAdmin ? 'Auditoria' : 'Chat'}</ThemedText>
        <ThemedText variant="body">
          {isAdmin
            ? 'Base para logs, moderacao e rastreabilidade.'
            : 'Base para conversas entre usuarios, instituicoes e suporte.'}
        </ThemedText>

        <Card>
          <View style={styles.section}>
            <Tag label={isAdmin ? 'Sistema' : 'Conversa'} variant="neutral" />
            <ThemedText variant="subtitle">
              {isAdmin ? 'Log de atualizacao' : 'Instituicao Esperanca'}
            </ThemedText>
            <ThemedText variant="body">Conteudo mockado para validar a navegacao principal.</ThemedText>
            <Divider />
            <ThemedText variant="caption">Divider padronizado separando blocos de conteudo.</ThemedText>
          </View>
        </Card>

        <Card variant="filled">
          <Loading label={isAdmin ? 'Carregando logs' : 'Carregando conversas'} size="small" />
        </Card>

        <Card variant="outlined">
          <EmptyState
            title={isAdmin ? 'Nenhum log encontrado' : 'Nenhuma conversa encontrada'}
            description="Exemplo de estado vazio em listagens."
          />
        </Card>
      </View>
    </ScreenContainer>
  );
}
