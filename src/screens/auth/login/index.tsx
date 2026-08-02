import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Divider, Input, ScreenContainer, Tag, ThemedText } from '@/components';
import { getHomeRouteForRole, routes } from '@/navigation/routes';
import { authService } from '@/services/auth';
import { ApiError } from '@/services/api';
import { getActiveRole, type UserRole } from '@/navigation/session';
import { useAppStore } from '@/store';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { theme } from '@/theme';

import { styles } from './styles';

// ─── Dev Helpers ──────────────────────────────────────────────────────────────
// Removido em produção via __DEV__ do React Native.

const DEV_USERS: { role: UserRole; label: string; email?: string; password?: string }[] = [
  {
    role: 'donor',
    label: 'Doador',
    email: process.env.EXPO_PUBLIC_DEV_DONOR_EMAIL ?? 'dev.doador@elodoar.local',
    password: process.env.EXPO_PUBLIC_DEV_DONOR_PASSWORD ?? '12345678',
  },
  {
    role: 'institution-staff',
    label: 'Instituição',
    email: process.env.EXPO_PUBLIC_DEV_INSTITUTION_EMAIL ?? 'dev.instituicao@elodoar.local',
    password: process.env.EXPO_PUBLIC_DEV_INSTITUTION_PASSWORD ?? '12345678',
  },
  {
    role: 'platform-admin',
    label: 'Admin',
    email: process.env.EXPO_PUBLIC_DEV_ADMIN_EMAIL ?? 'dev.admin@elodoar.local',
    password: process.env.EXPO_PUBLIC_DEV_ADMIN_PASSWORD ?? '12345678',
  },
];

function validate(email: string, password: string) {
  const errors: { email?: string; password?: string } = {};
  if (!email.trim()) errors.email = 'E-mail é obrigatório.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    errors.email = 'Informe um e-mail válido.';
  if (!password) errors.password = 'Senha é obrigatória.';
  return errors;
}

export function LoginScreen() {
  const setSession = useAppStore((state) => state.setSession);
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [devLoadingRole, setDevLoadingRole] = useState<UserRole | null>(null);

  async function handleSubmit() {
    setApiError('');
    const errors = validate(email, password);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const { accessToken, refreshToken, user } = await authService.login({ email: email.trim(), password });
      setSession(accessToken, user, refreshToken);
      router.replace(getHomeRouteForRole(getActiveRole(user)));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        const message =
          error.payload &&
          typeof error.payload === 'object' &&
          'message' in error.payload &&
          typeof error.payload.message === 'string'
            ? error.payload.message
            : '';

        if (message.includes('pending approval')) {
          setApiError('Sua instituição ainda está em análise pela plataforma.');
        } else {
          setApiError('E-mail ou senha incorretos.');
        }
      } else {
        setApiError('Não foi possível conectar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDevLogin(entry: (typeof DEV_USERS)[number]) {
    if (!entry.email || !entry.password) {
      setApiError('Credenciais dev não configuradas.');
      return;
    }

    setApiError('');
    setLoading(false);
    setDevLoadingRole(entry.role);

    try {
      const { accessToken, refreshToken, user } = await authService.login({
        email: entry.email.trim(),
        password: entry.password,
      });
      setSession(accessToken, user, refreshToken);
      router.replace(getHomeRouteForRole(getActiveRole(user)));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setApiError('Usuário dev sem acesso ativo ou credenciais inválidas.');
      } else {
        setApiError('Não foi possível conectar. Tente novamente.');
      }
    } finally {
      setDevLoadingRole(null);
    }
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        {/* Branding */}
        <View style={styles.header}>
          <View style={[styles.logoMark, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="heart" size={32} color={colors.primary} />
          </View>
          <ThemedText variant="title" style={styles.title}>
            Entrar no EloDoar
          </ThemedText>
          <ThemedText variant="body" color={colors.textMuted}>
            Bem-vindo de volta. Informe suas credenciais para continuar.
          </ThemedText>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="E-mail"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              setFieldErrors((e) => ({ ...e, email: undefined }));
            }}
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
            onChangeText={(v) => {
              setPassword(v);
              setFieldErrors((e) => ({ ...e, password: undefined }));
            }}
            error={fieldErrors.password}
            secureTextEntry={!showPassword}
            placeholder="Sua senha"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
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

          {apiError ? (
            <ThemedText variant="caption" color={colors.danger} style={styles.apiError}>
              {apiError}
            </ThemedText>
          ) : null}

          <Pressable
            onPress={() => router.push(routes.authForgotPassword)}
            style={styles.forgotLink}>
            <ThemedText variant="caption" color={colors.primary}>
              Esqueci minha senha
            </ThemedText>
          </Pressable>

          <Button fullWidth disabled={Boolean(devLoadingRole)} loading={loading} onPress={handleSubmit}>
            Entrar
          </Button>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText variant="caption" color={colors.textMuted}>
            Ainda não tem conta?
          </ThemedText>
          <Pressable onPress={() => router.push(routes.authRegister)}>
            <ThemedText variant="caption" color={colors.primary} style={styles.linkBold}>
              Criar conta
            </ThemedText>
          </Pressable>
        </View>

        {/* Acesso rápido — só visível em desenvolvimento */}
        {__DEV__ && (
          <View style={[styles.devBox, { borderColor: colors.accent, backgroundColor: colors.accentSoft }]}>
            <View style={styles.devHeader}>
              <Ionicons name="bug-outline" size={14} color={colors.warning} />
              <ThemedText variant="caption" color={colors.warning} style={styles.linkBold}>
                Acesso rápido (dev)
              </ThemedText>
              <Tag label="DEV" variant="warning" />
            </View>
            <Divider />
            <View style={styles.devButtons}>
              {DEV_USERS.map((entry, index) => {
                const configured = Boolean(entry.email && entry.password);

                return (
                  <Button
                    key={entry.role}
                    variant={index === 0 ? 'primary' : 'secondary'}
                    size="sm"
                    disabled={!configured || loading || Boolean(devLoadingRole)}
                    loading={devLoadingRole === entry.role}
                    onPress={() => handleDevLogin(entry)}>
                    {entry.label}
                  </Button>
                );
              })}
            </View>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
