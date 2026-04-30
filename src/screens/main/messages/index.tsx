import { View } from 'react-native';

import { Card, ScreenContainer, Tag, ThemedText } from '@/components';
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
          </View>
        </Card>
      </View>
    </ScreenContainer>
  );
}
