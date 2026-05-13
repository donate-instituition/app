import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Input, ScreenContainer, ThemedText } from '@/components';
import { routes } from '@/navigation/routes';
import { authService } from '@/services/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { theme } from '@/theme';

import { styles } from './styles';

export function ForgotPasswordScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    setApiError('');
    if (!email.trim()) {
      setEmailError('E-mail é obrigatório.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Informe um e-mail válido.');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword({ email: email.trim() });
      setSent(true);
    } catch {
      setApiError('Não foi possível enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <ScreenContainer>
        <View style={styles.successContainer}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="mail-outline" size={36} color={colors.primary} />
          </View>
          <ThemedText variant="title" style={styles.title}>
            Verifique seu e-mail
          </ThemedText>
          <ThemedText variant="body" color={colors.textMuted} style={styles.subtitle}>
            Enviamos as instruções de recuperação para{' '}
            <ThemedText variant="body" color={colors.text}>
              {email.trim()}
            </ThemedText>
            . Verifique sua caixa de entrada e a pasta de spam.
          </ThemedText>
          <Button fullWidth onPress={() => router.replace(routes.authLogin)}>
            Voltar para o login
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name="lock-closed-outline" size={28} color={colors.accent} />
          </View>
          <ThemedText variant="title" style={styles.title}>
            Recuperar senha
          </ThemedText>
          <ThemedText variant="body" color={colors.textMuted} style={styles.subtitle}>
            Informe seu e-mail cadastrado e enviaremos as instruções para redefinir sua senha.
          </ThemedText>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="E-mail"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              setEmailError('');
            }}
            error={emailError}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="seu@email.com"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />

          {apiError ? (
            <ThemedText variant="caption" color={colors.danger} style={styles.apiError}>
              {apiError}
            </ThemedText>
          ) : null}

          <Button fullWidth loading={loading} onPress={handleSubmit}>
            Enviar instruções
          </Button>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Ionicons name="arrow-back-outline" size={16} color={colors.primary} />
            <ThemedText variant="caption" color={colors.primary} style={styles.linkBold}>
              Voltar para o login
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}
