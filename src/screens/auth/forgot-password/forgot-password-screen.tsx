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
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'code' | 'done'>('email');

  async function handleSubmitEmail() {
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
      setStep('code');
    } catch {
      setApiError('Não foi possível enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmCode() {
    setApiError('');
    const normalizedCode = code.trim();

    if (!/^\d{6}$/.test(normalizedCode)) {
      setCodeError('Informe o código de 6 dígitos.');
      return;
    }

    setLoading(true);
    try {
      await authService.confirmForgotPassword({
        code: normalizedCode,
        email: email.trim(),
      });
      setStep('done');
    } catch {
      setApiError('Código inválido ou expirado. Solicite um novo código e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'done') {
    return (
      <ScreenContainer>
        <View style={styles.successContainer}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="mail-outline" size={36} color={colors.primary} />
          </View>
          <ThemedText variant="title" style={styles.title}>
            Senha temporária enviada
          </ThemedText>
          <ThemedText variant="body" color={colors.textMuted} style={styles.subtitle}>
            Enviamos uma nova senha temporária para{' '}
            <ThemedText variant="body" color={colors.text}>
              {email.trim()}
            </ThemedText>
            . Ao entrar no app com ela, você precisará criar uma senha definitiva.
          </ThemedText>
          <Button fullWidth onPress={() => router.replace(routes.authLogin)}>
            Voltar para o login
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  if (step === 'code') {
    return (
      <ScreenContainer scrollable>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name="keypad-outline" size={28} color={colors.primary} />
            </View>
            <ThemedText variant="title" style={styles.title}>
              Confirme o código
            </ThemedText>
            <ThemedText variant="body" color={colors.textMuted} style={styles.subtitle}>
              Enviamos um código de 6 dígitos para {email.trim()}.
            </ThemedText>
          </View>

          <View style={styles.form}>
            <Input
              label="Código"
              value={code}
              onChangeText={(v) => {
                setCode(v.replace(/\D/g, '').slice(0, 6));
                setCodeError('');
              }}
              error={codeError}
              keyboardType="number-pad"
              placeholder="000000"
              returnKeyType="done"
              onSubmitEditing={handleConfirmCode}
            />

            {apiError ? (
              <ThemedText variant="caption" color={colors.danger} style={styles.apiError}>
                {apiError}
              </ThemedText>
            ) : null}

            <Button fullWidth loading={loading} onPress={handleConfirmCode}>
              Confirmar código
            </Button>
          </View>

          <View style={styles.footer}>
            <Pressable onPress={() => setStep('email')} style={styles.backLink}>
              <Ionicons name="arrow-back-outline" size={16} color={colors.primary} />
              <ThemedText variant="caption" color={colors.primary} style={styles.linkBold}>
                Alterar e-mail
              </ThemedText>
            </Pressable>
          </View>
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
            onSubmitEditing={handleSubmitEmail}
          />

          {apiError ? (
            <ThemedText variant="caption" color={colors.danger} style={styles.apiError}>
              {apiError}
            </ThemedText>
          ) : null}

          <Button fullWidth loading={loading} onPress={handleSubmitEmail}>
            Enviar código
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
