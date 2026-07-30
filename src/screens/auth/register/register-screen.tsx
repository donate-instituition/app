import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Input, ScreenContainer, ThemedText } from '@/components';
import { ApiError } from '@/services/api';
import { authService } from '@/services/auth';
import { useAppStore } from '@/store';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { routes } from '@/navigation/routes';
import { theme } from '@/theme';

import { styles } from './styles';

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
): FieldErrors {
  const errors: FieldErrors = {};

  if (!name.trim()) {
    errors.name = 'Nome é obrigatório.';
  }

  if (!email.trim()) {
    errors.email = 'E-mail é obrigatório.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Informe um e-mail válido.';
  }

  if (!password) {
    errors.password = 'Senha é obrigatória.';
  } else if (password.length < 8) {
    errors.password = 'Mínimo de 8 caracteres.';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirme sua senha.';
  } else if (confirmPassword !== password) {
    errors.confirmPassword = 'As senhas não coincidem.';
  }

  return errors;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function RegisterScreen() {
  const setSession = useAppStore((state) => state.setSession);
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit() {
    setApiError('');
    const errors = validate(name, email, password, confirmPassword);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      // TODO: when backend is ready, this call is already wired — just update EXPO_PUBLIC_API_URL
      const { token, user } = await authService.register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      setSession(token, user);
      router.replace(routes.appDashboard);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setApiError('Este e-mail já está cadastrado.');
      } else {
        setApiError('Não foi possível criar a conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logoMark, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="person-add" size={28} color={colors.primary} />
          </View>
          <ThemedText variant="title" style={styles.title}>
            Criar conta
          </ThemedText>
          <ThemedText variant="body" color={colors.textMuted} style={styles.subtitle}>
            Preencha os dados abaixo para começar a usar o EloDoar.
          </ThemedText>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Nome completo"
            value={name}
            onChangeText={(v) => { setName(v); clearFieldError('name'); }}
            error={fieldErrors.name}
            autoCapitalize="words"
            placeholder="Seu nome completo"
            returnKeyType="next"
          />

          <Input
            label="E-mail"
            value={email}
            onChangeText={(v) => { setEmail(v); clearFieldError('email'); }}
            error={fieldErrors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="seu@email.com"
            returnKeyType="next"
          />

          <Input
            label="Senha"
            value={password}
            onChangeText={(v) => { setPassword(v); clearFieldError('password'); }}
            error={fieldErrors.password}
            secureTextEntry={!showPassword}
            placeholder="Mínimo 8 caracteres"
            returnKeyType="next"
            rightSlot={
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                style={styles.eyeButton}
                accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.icon}
                />
              </Pressable>
            }
          />

          <Input
            label="Confirmar senha"
            value={confirmPassword}
            onChangeText={(v) => { setConfirmPassword(v); clearFieldError('confirmPassword'); }}
            error={fieldErrors.confirmPassword}
            secureTextEntry={!showConfirm}
            placeholder="Repita a senha"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            rightSlot={
              <Pressable
                onPress={() => setShowConfirm((v) => !v)}
                style={styles.eyeButton}
                accessibilityLabel={showConfirm ? 'Ocultar confirmação' : 'Mostrar confirmação'}>
                <Ionicons
                  name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.icon}
                />
              </Pressable>
            }
          />

          {apiError ? (
            <ThemedText variant="caption" color={colors.danger} style={styles.apiError}>
              {apiError}
            </ThemedText>
          ) : null}

          <Button fullWidth loading={loading} onPress={handleSubmit}>
            Criar conta
          </Button>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText variant="caption" color={colors.textMuted}>
            Já tem uma conta?
          </ThemedText>
          <Pressable onPress={() => router.back()}>
            <ThemedText variant="caption" color={colors.primary} style={styles.linkBold}>
              Entrar
            </ThemedText>
          </Pressable>
        </View>

      </View>
    </ScreenContainer>
  );
}
