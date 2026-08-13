import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button, ScreenContainer, ThemedText } from '@/components';
import { routes } from '@/navigation/routes';
import { authService } from '@/services/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { theme } from '@/theme';

import { styles } from '@/screens/auth/forgot-password/styles';

export default function ActivateAccountRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const token = Array.isArray(params.token) ? params.token[0] : params.token;

    if (!token) {
      setStatus('error');
      return;
    }

    let mounted = true;

    authService
      .activateAccount({ token })
      .then(() => {
        if (mounted) setStatus('success');
      })
      .catch(() => {
        if (mounted) setStatus('error');
      });

    return () => {
      mounted = false;
    };
  }, [params.token]);

  const isSuccess = status === 'success';
  const isLoading = status === 'loading';

  return (
    <ScreenContainer>
      <View style={styles.successContainer}>
        <View style={[styles.iconCircle, { backgroundColor: isSuccess ? colors.primarySoft : colors.secondarySoft }]}>
          <Ionicons
            name={isSuccess ? 'checkmark-circle' : isLoading ? 'time-outline' : 'alert-circle-outline'}
            size={34}
            color={isSuccess ? colors.primary : colors.secondary}
          />
        </View>
        <ThemedText variant="title" style={styles.title}>
          {isSuccess ? 'Conta ativada' : isLoading ? 'Ativando conta' : 'Link inválido'}
        </ThemedText>
        <ThemedText variant="body" color={colors.textMuted} style={styles.subtitle}>
          {isSuccess
            ? 'Sua conta foi ativada com sucesso. Agora você já pode entrar no EloDoar.'
            : isLoading
              ? 'Estamos confirmando seu acesso. Isso leva só alguns segundos.'
              : 'Não foi possível ativar sua conta. O link pode ter expirado ou estar incompleto.'}
        </ThemedText>
        <Button fullWidth disabled={isLoading} onPress={() => router.replace(routes.authLogin)}>
          Ir para o login
        </Button>
      </View>
    </ScreenContainer>
  );
}
