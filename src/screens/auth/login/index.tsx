import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Divider, Input, ScreenContainer, Tag, ThemedText } from '@/components';
import { getHomeRouteForRole, routes } from '@/navigation/routes';
import { authService } from '@/services/auth';
import { ApiError } from '@/services/api';
import { getActiveRole, type SessionUser, type UserRole } from '@/navigation/session';
import { useAppStore } from '@/store';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { theme } from '@/theme';
import { getPasswordPolicyError } from '@/services/auth/password-policy';
import { logger } from '@/services/logger';

import { styles } from './styles';

const loginLogger = logger.child('GoogleLogin');

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

type PasswordChangeSession = {
  accessToken: string;
  currentPassword: string;
  refreshToken: string;
  user: SessionUser;
};

function validate(email: string, password: string) {
  const errors: { email?: string; password?: string } = {};
  if (!email.trim()) errors.email = 'E-mail é obrigatório.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    errors.email = 'Informe um e-mail válido.';
  if (!password) errors.password = 'Senha é obrigatória.';
  return errors;
}

function getApiPayloadValue(error: ApiError, key: string) {
  if (
    error.payload &&
    typeof error.payload === 'object' &&
    key in error.payload
  ) {
    const value = error.payload[key as keyof typeof error.payload];
    return typeof value === 'string' ? value : '';
  }

  return '';
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
  const [pendingActivationEmail, setPendingActivationEmail] = useState('');
  const [activationSentMessage, setActivationSentMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendingActivation, setResendingActivation] = useState(false);
  const [devLoadingRole, setDevLoadingRole] = useState<UserRole | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [passwordChangeSession, setPasswordChangeSession] = useState<PasswordChangeSession | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  function finishLogin(accessToken: string, user: SessionUser, refreshToken: string, currentPassword: string) {
    if (user.passwordChangeRequired) {
      setPasswordChangeSession({
        accessToken,
        currentPassword,
        refreshToken,
        user,
      });
      setNewPassword('');
      setNewPasswordConfirmation('');
      setChangePasswordError('');
      return;
    }

    setSession(accessToken, user, refreshToken);
    router.replace(getHomeRouteForRole(getActiveRole(user)));
  }

  async function handleSubmit() {
    setApiError('');
    setActivationSentMessage('');
    setPendingActivationEmail('');
    const errors = validate(email, password);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const { accessToken, refreshToken, user } = await authService.login({ email: email.trim(), password });
      finishLogin(accessToken, user, refreshToken, password);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        const code = getApiPayloadValue(error, 'code');
        const message = getApiPayloadValue(error, 'message');

        if (code === 'ACCOUNT_PENDING_VERIFICATION') {
          setApiError('Sua conta ainda não foi ativada. Verifique seu e-mail para liberar o acesso.');
          setPendingActivationEmail(email.trim());
        } else if (message.includes('pending approval')) {
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
    setActivationSentMessage('');
    setPendingActivationEmail('');
    setLoading(false);
    setDevLoadingRole(entry.role);

    try {
      const { accessToken, refreshToken, user } = await authService.login({
        email: entry.email.trim(),
        password: entry.password,
      });
      finishLogin(accessToken, user, refreshToken, entry.password);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        const code = getApiPayloadValue(error, 'code');
        setApiError(
          code === 'ACCOUNT_PENDING_VERIFICATION'
            ? 'Conta dev pendente de ativação.'
            : 'Usuário dev sem acesso ativo ou credenciais inválidas.',
        );
      } else {
        setApiError('Não foi possível conectar. Tente novamente.');
      }
    } finally {
      setDevLoadingRole(null);
    }
  }

  async function handleGoogleLogin() {
    setApiError('');
    setActivationSentMessage('');
    setPendingActivationEmail('');
    setGoogleLoading(true);

    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();

      if (signInResult.type === 'cancelled') {
        return;
      }

      const idToken = signInResult.data.idToken;

      if (!idToken) {
        setApiError('Não foi possível obter as credenciais do Google.');
        return;
      }

      const result = await authService.loginWithGoogle({ idToken });

      if ('status' in result) {
        router.push(
          `${routes.authGoogleOnboarding}?onboardingToken=${encodeURIComponent(result.onboardingToken)}&name=${encodeURIComponent(result.name)}&email=${encodeURIComponent(result.email)}` as Href,
        );
        return;
      }

      finishLogin(result.accessToken, result.user, result.refreshToken, '');
    } catch (error) {
      const errorCode =
        error && typeof error === 'object' && 'code' in error
          ? (error as { code?: string }).code
          : undefined;

      if (errorCode === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }

      loginLogger.error('Google sign-in failed', {
        code: errorCode,
        message: error instanceof Error ? error.message : String(error),
      });
      setApiError('Não foi possível entrar com o Google. Tente novamente.');
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleResendActivation() {
    if (!pendingActivationEmail) return;

    setResendingActivation(true);
    setActivationSentMessage('');

    try {
      await authService.resendActivation({ email: pendingActivationEmail });
      setActivationSentMessage('Enviamos um novo link de ativação para seu e-mail.');
    } catch {
      setApiError('Não foi possível reenviar o link agora. Tente novamente.');
    } finally {
      setResendingActivation(false);
    }
  }

  async function handleChangePassword() {
    if (!passwordChangeSession) return;

    setChangePasswordError('');

    const passwordError = getPasswordPolicyError(newPassword);
    if (passwordError) {
      setChangePasswordError(passwordError);
      return;
    }

    if (newPassword !== newPasswordConfirmation) {
      setChangePasswordError('As senhas não conferem.');
      return;
    }

    if (newPassword === passwordChangeSession.currentPassword) {
      setChangePasswordError('Escolha uma senha diferente da senha temporária.');
      return;
    }

    setChangePasswordLoading(true);
    try {
      const { accessToken, refreshToken, user } = await authService.changePassword(
        {
          currentPassword: passwordChangeSession.currentPassword,
          newPassword,
        },
        passwordChangeSession.accessToken,
      );
      setPasswordChangeSession(null);
      setSession(accessToken, user, refreshToken);
      router.replace(getHomeRouteForRole(getActiveRole(user)));
    } catch {
      setChangePasswordError('Não foi possível trocar a senha. Entre novamente com a senha temporária.');
    } finally {
      setChangePasswordLoading(false);
    }
  }

  if (passwordChangeSession) {
    return (
      <ScreenContainer scrollable>
        <View style={styles.container}>
          <View style={[styles.activationCard, { backgroundColor: colors.primarySoft }]}>
            <View style={[styles.logoMark, { backgroundColor: colors.surface }]}>
              <Ionicons name="shield-checkmark-outline" size={30} color={colors.primary} />
            </View>
            <ThemedText variant="subtitle" style={styles.title}>
              Conta verificada
            </ThemedText>
            <ThemedText variant="body" color={colors.textMuted} style={styles.centerText}>
              Confirmamos o acesso. Agora crie uma senha nova para substituir a senha inicial recebida por e-mail.
            </ThemedText>
          </View>

          <View style={styles.form}>
            <Input
              value={newPassword}
              onChangeText={(v) => {
                setNewPassword(v);
                setChangePasswordError('');
              }}
              secureTextEntry
              placeholder="Mínimo 8 caracteres"
              returnKeyType="next"
            />

            <Input
              value={newPasswordConfirmation}
              onChangeText={(v) => {
                setNewPasswordConfirmation(v);
                setChangePasswordError('');
              }}
              secureTextEntry
              placeholder="Digite novamente"
              returnKeyType="done"
              onSubmitEditing={handleChangePassword}
            />

            {changePasswordError ? (
              <View style={[styles.securityBox, { backgroundColor: colors.secondarySoft, borderColor: colors.secondary }]}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.secondary} />
                <ThemedText variant="caption" color={colors.text}>
                  {changePasswordError}
                </ThemedText>
              </View>
            ) : null}

            <Button fullWidth loading={changePasswordLoading} onPress={handleChangePassword}>
              Salvar e entrar
            </Button>
            <View style={[styles.securityBox, { backgroundColor: colors.secondarySoft, borderColor: colors.secondary }]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.secondary} />
              <ThemedText variant="caption" color={colors.text}>
                Segurança: nunca compartilhe seus dados de acesso. O EloDoar não solicita sua senha por e-mail.
              </ThemedText>
            </View>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        {/* Branding */}
        <View style={styles.loginHero}>
          <View style={[styles.logoMark, { backgroundColor: colors.primary }]}>
            <Ionicons name="heart-outline" size={32} color={colors.surface} />
          </View>
          <ThemedText variant="title" style={styles.title}>
            Bem-vindo(a) de volta
          </ThemedText>
          <ThemedText variant="body" color={colors.textMuted}>
            Entre para continuar doando.
          </ThemedText>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
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
            leftSlot={
              <View style={styles.inputIcon}>
                <Ionicons name="mail-outline" size={18} color={colors.icon} />
              </View>
            }
          />

          <Input
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
            leftSlot={
              <View style={styles.inputIcon}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.icon} />
              </View>
            }
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

          {pendingActivationEmail ? (
            <Button
              fullWidth
              variant="ghost"
              loading={resendingActivation}
              onPress={handleResendActivation}>
              Reenviar email de ativação
            </Button>
          ) : null}

          {activationSentMessage ? (
            <ThemedText variant="caption" color={colors.success} style={styles.apiError}>
              {activationSentMessage}
            </ThemedText>
          ) : null}

          <Pressable
            onPress={() => router.push(routes.authForgotPassword)}
            style={styles.forgotLink}>
            <ThemedText variant="caption" color={colors.primary}>
              Esqueci minha senha
            </ThemedText>
          </Pressable>

          <Button
            fullWidth
            disabled={Boolean(devLoadingRole) || googleLoading}
            loading={loading}
            onPress={handleSubmit}>
            Entrar
          </Button>

          <View style={styles.orRow}>
            <Divider style={styles.orLine} />
            <ThemedText variant="caption" color={colors.textMuted}>
              ou
            </ThemedText>
            <Divider style={styles.orLine} />
          </View>

          <Button
            fullWidth
            variant="ghost"
            disabled={loading || Boolean(devLoadingRole)}
            loading={googleLoading}
            leftSlot={<Ionicons name="logo-google" size={18} color={colors.text} />}
            onPress={handleGoogleLogin}>
            Continuar com Google
          </Button>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText variant="caption" color={colors.textMuted}>
            Ainda não tem conta?
          </ThemedText>
          <Pressable onPress={() => router.push(routes.authAccess)}>
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
                    disabled={!configured || loading || Boolean(devLoadingRole) || googleLoading}
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
