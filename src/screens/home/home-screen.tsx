import { StyleSheet, View } from 'react-native';

import { ThemedText, ThemedView } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { theme } from '@/theme';

export function HomeScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
        <ThemedText variant="caption" color={colors.primaryStrong}>
          Plataforma de doacoes
        </ThemedText>
      </View>

      <View style={styles.content}>
        <ThemedText variant="title">Doe com confianca</ThemedText>
        <ThemedText variant="body" color={colors.textMuted}>
          Arquitetura inicial pronta para organizar telas, componentes, hooks, servicos, estado e
          tema da aplicacao.
        </ThemedText>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ThemedText variant="subtitle">Base do projeto</ThemedText>
        <ThemedText variant="body" color={colors.textMuted}>
          Esta tela substitui o conteudo padrao do Expo e passa a consumir apenas a estrutura em
          src.
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.xl,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  content: {
    gap: theme.spacing.md,
  },
  card: {
    borderWidth: theme.borderWidths.sm,
    borderRadius: theme.radius.md,
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
});
