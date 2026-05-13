import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Avatar, Divider, EmptyState, ScreenContainer, ThemedText } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { theme } from '@/theme';

import { styles } from './styles';

const conversations = [
  { id: '1', name: 'Instituto Esperança', preview: 'Sua doação chegou! Muito obrigado pelo apoio.', time: '10:32', unread: 2 },
  { id: '2', name: 'Casa do Pão', preview: 'Olá! Sua doação está sendo processada...', time: 'Ontem', unread: 0 },
  { id: '3', name: 'Educação Viva', preview: 'Atualizamos a meta da campanha. Confira!', time: 'Seg', unread: 1 },
  { id: '4', name: 'Lar Aconchego', preview: 'Obrigado por participar da Campanha do Inverno.', time: '28 abr', unread: 0 },
];

export function MessagesScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <ThemedText variant="title">Chat</ThemedText>

        {conversations.length === 0 ? (
          <EmptyState
            title="Nenhuma conversa ainda"
            description="Suas trocas de mensagens com instituições aparecerão aqui."
            illustration={
              <Ionicons name="chatbubbles-outline" size={56} color={colors.border} />
            }
          />
        ) : (
          <View>
            {conversations.map((item, index) => (
              <Pressable key={item.id}>
                <View style={styles.conversationItem}>
                  <Avatar name={item.name} size="md" />
                  <View style={styles.conversationContent}>
                    <View style={styles.conversationHeader}>
                      <ThemedText variant="body" style={styles.bold}>
                        {item.name}
                      </ThemedText>
                      <ThemedText variant="caption" color={colors.textMuted}>
                        {item.time}
                      </ThemedText>
                    </View>
                    <View style={styles.conversationFooter}>
                      <ThemedText
                        variant="caption"
                        color={item.unread > 0 ? colors.text : colors.textMuted}
                        style={[styles.preview, item.unread > 0 && styles.bold]}
                        numberOfLines={1}>
                        {item.preview}
                      </ThemedText>
                      {item.unread > 0 && (
                        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                          <ThemedText variant="caption" color={colors.surface} style={styles.badgeText}>
                            {item.unread}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                {index < conversations.length - 1 && <Divider />}
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

