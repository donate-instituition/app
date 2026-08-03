import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, DatePicker, Input, RadioGroup, ScreenContainer, ThemedText } from '@/components';
import { ApiError } from '@/services/api';
import {
  authService,
  type RegisterPendingInstitutionResponse,
  type RegisterPendingVerificationResponse,
  type RegisterResponse,
} from '@/services/auth';
import { useAppStore } from '@/store';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getHomeRouteForRole, routes } from '@/navigation/routes';
import { getActiveRole } from '@/navigation/session';
import { theme } from '@/theme';
import { getPasswordPolicyError } from '@/services/auth/password-policy';

import { styles } from './styles';

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldErrors = {
  accountType?: string;
  name?: string;
  cpf?: string;
  birthDate?: string;
  phone?: string;
  email?: string;
  institutionLegalName?: string;
  institutionDisplayName?: string;
  institutionCnpj?: string;
  institutionEmail?: string;
  institutionPhone?: string;
  password?: string;
  confirmPassword?: string;
};

type AccountType = 'DONOR' | 'INSTITUTION';

// ─── Validation ───────────────────────────────────────────────────────────────

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function formatCpf(value: string) {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatCnpj(value: string) {
  return onlyDigits(value)
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

function formatPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }

  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getApiMessage(error: ApiError) {
  if (
    error.payload &&
    typeof error.payload === 'object' &&
    'message' in error.payload
  ) {
    const { message } = error.payload;

    if (typeof message === 'string') {
      return message;
    }

    if (Array.isArray(message)) {
      return message.join(' ');
    }
  }

  return '';
}

function getRequestId(error: ApiError) {
  if (
    error.payload &&
    typeof error.payload === 'object' &&
    'requestId' in error.payload &&
    typeof error.payload.requestId === 'string'
  ) {
    return error.payload.requestId;
  }

  return '';
}

function getRegisterErrorMessage(error: ApiError) {
  const message = getApiMessage(error);
  const requestId = getRequestId(error);

  if (error.status === 409) {
    if (message.includes('CNPJ')) {
      return 'Este CNPJ já está cadastrado.';
    }

    if (message.includes('CPF')) {
      return 'Este CPF já está cadastrado.';
    }

    if (message.includes('Email')) {
      return 'Este e-mail já está cadastrado.';
    }

    return 'Já existe um cadastro com esses dados.';
  }

  if (error.status === 400) {
    return message || 'Revise os dados informados e tente novamente.';
  }

  if (error.status === 500) {
    return requestId
      ? `Erro interno no servidor ao criar conta. Código do erro: ${requestId}.`
      : 'Erro interno no servidor ao criar conta. Tente novamente em instantes.';
  }

  return message && error.status && error.status < 500
    ? message
    : 'Não foi possível criar a conta. Tente novamente.';
}

function isPendingInstitutionResponse(
  response:
    | RegisterResponse
    | RegisterPendingInstitutionResponse
    | RegisterPendingVerificationResponse,
): response is RegisterPendingInstitutionResponse {
  return 'status' in response && response.status === 'pending-approval';
}

function isPendingVerificationResponse(
  response:
    | RegisterResponse
    | RegisterPendingInstitutionResponse
    | RegisterPendingVerificationResponse,
): response is RegisterPendingVerificationResponse {
  return 'status' in response && response.status === 'pending-verification';
}

function validate(
  accountType: AccountType,
  name: string,
  cpf: string,
  birthDate: Date | null,
  phone: string,
  email: string,
  institutionLegalName: string,
  institutionDisplayName: string,
  institutionCnpj: string,
  institutionEmail: string,
  institutionPhone: string,
  password: string,
  confirmPassword: string,
): FieldErrors {
  const errors: FieldErrors = {};

  if (!name.trim()) {
    errors.name = 'Nome é obrigatório.';
  }

  if (!cpf.trim()) {
    errors.cpf = 'CPF é obrigatório para emissão de recibos.';
  } else if (onlyDigits(cpf).length !== 11) {
    errors.cpf = 'Informe um CPF válido.';
  }

  if (!birthDate) {
    errors.birthDate = 'Data de nascimento é obrigatória.';
  } else if (birthDate > new Date()) {
    errors.birthDate = 'Informe uma data de nascimento válida.';
  }

  if (!phone.trim()) {
    errors.phone = 'Telefone é obrigatório.';
  } else if (![10, 11].includes(onlyDigits(phone).length)) {
    errors.phone = 'Informe um telefone válido.';
  }

  if (!email.trim()) {
    errors.email = 'E-mail é obrigatório.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Informe um e-mail válido.';
  }

  if (accountType === 'INSTITUTION') {
    if (!institutionLegalName.trim()) {
      errors.institutionLegalName = 'Razão social é obrigatória.';
    }

    if (!institutionDisplayName.trim()) {
      errors.institutionDisplayName = 'Nome fantasia é obrigatório.';
    }

    if (!institutionCnpj.trim()) {
      errors.institutionCnpj = 'CNPJ é obrigatório.';
    } else if (onlyDigits(institutionCnpj).length !== 14) {
      errors.institutionCnpj = 'Informe um CNPJ válido.';
    }

    if (!institutionEmail.trim()) {
      errors.institutionEmail = 'E-mail da instituição é obrigatório.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(institutionEmail.trim())) {
      errors.institutionEmail = 'Informe um e-mail válido.';
    }

    if (institutionPhone.trim() && ![10, 11].includes(onlyDigits(institutionPhone).length)) {
      errors.institutionPhone = 'Informe um telefone válido.';
    }
  }

  if (!password) {
    errors.password = 'Senha é obrigatória.';
  } else {
    const passwordError = getPasswordPolicyError(password);
    if (passwordError) {
      errors.password = passwordError;
    }
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
  const logout = useAppStore((state) => state.logout);
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  const [accountType, setAccountType] = useState<AccountType>('DONOR');
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [institutionLegalName, setInstitutionLegalName] = useState('');
  const [institutionDisplayName, setInstitutionDisplayName] = useState('');
  const [institutionCnpj, setInstitutionCnpj] = useState('');
  const [institutionEmail, setInstitutionEmail] = useState('');
  const [institutionPhone, setInstitutionPhone] = useState('');
  const [institutionDescription, setInstitutionDescription] = useState('');
  const [institutionWebsite, setInstitutionWebsite] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState('');
  const [pendingInstitutionName, setPendingInstitutionName] = useState('');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit() {
    setApiError('');
    const errors = validate(
      accountType,
      name,
      cpf,
      birthDate,
      phone,
      email,
      institutionLegalName,
      institutionDisplayName,
      institutionCnpj,
      institutionEmail,
      institutionPhone,
      password,
      confirmPassword,
    );
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const response = await authService.register({
        accountType,
        name: name.trim(),
        cpf: onlyDigits(cpf),
        birthDate: toIsoDate(birthDate as Date),
        phone: onlyDigits(phone),
        email: email.trim(),
        password,
        ...(accountType === 'INSTITUTION'
          ? {
              institutionLegalName: institutionLegalName.trim(),
              institutionDisplayName: institutionDisplayName.trim(),
              institutionCnpj: onlyDigits(institutionCnpj),
              institutionEmail: institutionEmail.trim(),
              institutionPhone: onlyDigits(institutionPhone),
              institutionDescription: institutionDescription.trim() || undefined,
              institutionWebsite: institutionWebsite.trim() || undefined,
            }
          : {}),
      });

      if (isPendingInstitutionResponse(response)) {
        logout();
        setPendingInstitutionName(response.institution.name);
        return;
      }

      if (isPendingVerificationResponse(response)) {
        logout();
        setPendingVerificationEmail(response.email);
        return;
      }

      const { accessToken, refreshToken, user } = response;
      setSession(accessToken, user, refreshToken);
      router.replace(getHomeRouteForRole(getActiveRole(user)));
    } catch (error) {
      if (error instanceof ApiError) {
        setApiError(getRegisterErrorMessage(error));
      } else {
        setApiError('Não foi possível criar a conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResendActivation() {
    if (!pendingVerificationEmail) return;

    setResendLoading(true);
    setResendMessage('');

    try {
      await authService.resendActivation({ email: pendingVerificationEmail });
      setResendMessage('Enviamos um novo link de ativação para seu e-mail.');
    } catch {
      setResendMessage('Não foi possível reenviar agora. Tente novamente pelo login.');
    } finally {
      setResendLoading(false);
    }
  }

  if (pendingInstitutionName) {
    return (
      <ScreenContainer>
        <View style={[styles.container, styles.pendingContainer]}>
          <View style={[styles.logoMark, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="shield-checkmark" size={28} color={colors.primary} />
          </View>
          <ThemedText variant="title" style={styles.title}>
            Cadastro em análise
          </ThemedText>
          <ThemedText variant="body" color={colors.textMuted} style={styles.subtitle}>
            Recebemos o cadastro de {pendingInstitutionName}. O admin da plataforma precisa validar a instituição antes do acesso ser liberado.
          </ThemedText>
          <Button fullWidth onPress={() => router.replace(routes.authLogin)}>
            Voltar para login
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  if (pendingVerificationEmail) {
    return (
      <ScreenContainer>
        <View style={[styles.container, styles.pendingContainer]}>
          <View style={[styles.logoMark, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="mail-unread-outline" size={28} color={colors.primary} />
          </View>
          <ThemedText variant="title" style={styles.title}>
            Ative sua conta
          </ThemedText>
          <ThemedText variant="body" color={colors.textMuted} style={styles.subtitle}>
            Enviamos um e-mail para {pendingVerificationEmail}. Ative sua conta antes de entrar no EloDoar.
          </ThemedText>
          {resendMessage ? (
            <ThemedText variant="caption" color={colors.textMuted} style={styles.subtitle}>
              {resendMessage}
            </ThemedText>
          ) : null}
          <Button fullWidth variant="secondary" loading={resendLoading} onPress={handleResendActivation}>
            Reenviar e-mail
          </Button>
          <Button fullWidth onPress={() => router.replace(routes.authLogin)}>
            Voltar para login
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
          <RadioGroup
            label="Tipo de cadastro"
            value={accountType}
            onValueChange={(value) => {
              setAccountType(value as AccountType);
              clearFieldError('accountType');
            }}
            options={[
              {
                label: 'Doador',
                value: 'DONOR',
                description: 'Pessoa física que doa e recebe comprovantes em seu CPF.',
              },
              {
                label: 'Instituição',
                value: 'INSTITUTION',
                description: 'Responsável por cadastrar uma instituição para análise da plataforma.',
              },
            ]}
          />

          <Input
            label="Nome completo"
            value={name}
            onChangeText={(v) => { setName(v); clearFieldError('name'); }}
            error={fieldErrors.name}
            autoCapitalize="words"
            placeholder="Seu nome completo"
            returnKeyType="next"
          />

          <DatePicker
            label="Data de nascimento"
            value={birthDate}
            onChange={(date) => {
              setBirthDate(date);
              clearFieldError('birthDate');
            }}
            error={fieldErrors.birthDate}
            maxDate={new Date()}
            minDate={new Date(1900, 0, 1)}
            placeholder="Selecione sua data de nascimento"
          />

          <Input
            label="CPF"
            value={cpf}
            onChangeText={(v) => { setCpf(formatCpf(v)); clearFieldError('cpf'); }}
            error={fieldErrors.cpf}
            keyboardType="number-pad"
            placeholder="000.000.000-00"
            returnKeyType="next"
          />

          <Input
            label="Telefone"
            value={phone}
            onChangeText={(v) => { setPhone(formatPhone(v)); clearFieldError('phone'); }}
            error={fieldErrors.phone}
            keyboardType="phone-pad"
            placeholder="(00) 00000-0000"
            returnKeyType="next"
          />

          {accountType === 'INSTITUTION' ? (
            <View style={styles.group}>
              <ThemedText variant="subtitle">Dados da instituição</ThemedText>

              <Input
                label="Razão social"
                value={institutionLegalName}
                onChangeText={(v) => { setInstitutionLegalName(v); clearFieldError('institutionLegalName'); }}
                error={fieldErrors.institutionLegalName}
                placeholder="Nome legal da instituição"
                returnKeyType="next"
              />

              <Input
                label="Nome fantasia"
                value={institutionDisplayName}
                onChangeText={(v) => { setInstitutionDisplayName(v); clearFieldError('institutionDisplayName'); }}
                error={fieldErrors.institutionDisplayName}
                placeholder="Nome público"
                returnKeyType="next"
              />

              <Input
                label="CNPJ"
                value={institutionCnpj}
                onChangeText={(v) => { setInstitutionCnpj(formatCnpj(v)); clearFieldError('institutionCnpj'); }}
                error={fieldErrors.institutionCnpj}
                keyboardType="number-pad"
                placeholder="00.000.000/0000-00"
                returnKeyType="next"
              />

              <Input
                label="E-mail institucional"
                value={institutionEmail}
                onChangeText={(v) => { setInstitutionEmail(v); clearFieldError('institutionEmail'); }}
                error={fieldErrors.institutionEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="contato@instituicao.org.br"
                returnKeyType="next"
              />

              <Input
                label="Telefone institucional"
                value={institutionPhone}
                onChangeText={(v) => { setInstitutionPhone(formatPhone(v)); clearFieldError('institutionPhone'); }}
                error={fieldErrors.institutionPhone}
                keyboardType="phone-pad"
                placeholder="(00) 00000-0000"
                returnKeyType="next"
              />

              <Input
                label="Site"
                value={institutionWebsite}
                onChangeText={setInstitutionWebsite}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="https://instituicao.org.br"
                returnKeyType="next"
              />

              <Input
                label="Descrição"
                value={institutionDescription}
                onChangeText={setInstitutionDescription}
                multiline
                placeholder="Resumo da atuação da instituição"
                style={styles.multilineInput}
                textAlignVertical="top"
              />
            </View>
          ) : null}

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
