import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, EmptyState, Loading, ScreenContainer, ThemedText } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFetch } from '@/hooks/use-fetch';
import { routes } from '@/navigation/routes';
import { termsService } from '@/services/terms';
import { useAppStore } from '@/store';
import { theme } from '@/theme';

import { styles } from './styles';

export function TermsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string | string[] }>();
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const authToken = useAppStore((state) => state.authToken);
  const setTermsAccepted = useAppStore((state) => state.setTermsAccepted);
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState('');
  const mode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const requiresAcceptance = mode === 'accept';
  const fetcher = useCallback(() => termsService.getCurrentTerm(), []);
  const { data: term, loading, error, refetch } = useFetch(fetcher);

  async function handleAccept() {
    setAcceptError('');
    setAccepting(true);

    try {
      const response = await termsService.acceptCurrentTerm(authToken);
      setTermsAccepted(response.acceptedTermsVersion, response.termsAcceptedAt);
      router.replace(routes.appDashboard);
    } catch {
      setAcceptError('Não foi possível registrar o aceite. Tente novamente.');
    } finally {
      setAccepting(false);
    }
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          {!requiresAcceptance ? (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
          ) : (
            <View style={styles.backButton} />
          )}
          <ThemedText variant="subtitle" style={styles.headerTitle}>
            Termos
          </ThemedText>
          <View style={styles.backButton} />
        </View>

        {loading ? <Loading label="Carregando termos..." /> : null}

        {error ? (
          <EmptyState
            title="Não foi possível carregar"
            description={error}
            illustration={<Ionicons name="document-text-outline" size={56} color={colors.border} />}
            action={<Button variant="secondary" onPress={refetch}>Tentar novamente</Button>}
          />
        ) : null}

        {term && !loading && !error ? (
          <>
            <View style={styles.titleBlock}>
              <ThemedText variant="title">{term.title}</ThemedText>
              <ThemedText variant="caption" color={colors.textMuted}>
                Versão {term.version}
              </ThemedText>
            </View>

            <View style={[styles.contentBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <ThemedText variant="body" color={colors.text}>
                {term.content}
              </ThemedText>
            </View>

            {acceptError ? (
              <ThemedText variant="caption" color={colors.danger} style={styles.centered}>
                {acceptError}
              </ThemedText>
            ) : null}

            {requiresAcceptance ? (
              <Button fullWidth loading={accepting} onPress={handleAccept}>
                Aceitar e continuar
              </Button>
            ) : null}
          </>
        ) : null}
      </View>
    </ScreenContainer>
  );
}
