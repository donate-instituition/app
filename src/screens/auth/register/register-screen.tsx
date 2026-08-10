import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Checkbox, DatePicker, Input, ScreenContainer, ThemedText } from '@/components';
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
  terms?: string;
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
  const params = useLocalSearchParams<{ accountType?: string | string[] }>();
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
  const [step, setStep] = useState<1 | 2>(1);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState('');
  const [pendingInstitutionName, setPendingInstitutionName] = useState('');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const accountTypeParam = Array.isArray(params.accountType)
      ? params.accountType[0]
      : params.accountType;

    if (accountTypeParam === 'DONOR' || accountTypeParam === 'INSTITUTION') {
      setAccountType(accountTypeParam);
    }
  }, [params.accountType]);

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function getValidationErrors() {
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

    if (!acceptedTerms) {
      errors.terms = 'Aceite os termos para continuar.';
    }

    return errors;
  }

  function getAccountStepErrors() {
    const allErrors = getValidationErrors();
    const accountFields: (keyof FieldErrors)[] = [
      'name',
      'cpf',
      'birthDate',
      'phone',
      'email',
      'password',
      'confirmPassword',
    ];

    return accountFields.reduce<FieldErrors>((acc, field) => {
      if (allErrors[field]) acc[field] = allErrors[field];
      return acc;
    }, {});
  }

  function handleContinueInstitution() {
    const errors = getAccountStepErrors();

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setApiError('');
    setStep(2);
  }

  async function handleSubmit() {
    setApiError('');
    const errors = getValidationErrors();
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
          <Button fullWidth variant="ghost" loading={resendLoading} onPress={handleResendActivation}>
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
        <Pressable
          onPress={() => (step === 2 ? setStep(1) : router.push(routes.authAccess))}
          style={styles.backButton}
          accessibilityLabel={step === 2 ? 'Voltar para dados da conta' : 'Voltar para escolha de perfil'}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>

        {/* Header */}
        <View style={[styles.headerBlock, accountType === 'DONOR' && styles.donorHeader]}>
          {accountType === 'DONOR' ? (
            <View style={[styles.heroIcon, { backgroundColor: colors.primarySoft, borderColor: colors.primary }]}>
              <Ionicons name="person-add" size={30} color={colors.primary} />
            </View>
          ) : null}
          {accountType === 'INSTITUTION' ? (
            <View style={[styles.stepBadge, { borderColor: colors.border }]}>
              <ThemedText variant="caption" color={colors.primary} style={styles.linkBold}>
                Etapa {step} de 2
              </ThemedText>
            </View>
          ) : null}
          <ThemedText variant="title">
            {accountType === 'INSTITUTION' && step === 2 ? 'Dados da instituição' : 'Criar conta'}
          </ThemedText>
          <ThemedText variant="body" color={colors.textMuted}>
            {accountType === 'INSTITUTION'
              ? step === 1
                ? 'Preencha seus dados para cadastrar sua instituição.'
                : 'Informe os dados públicos e legais da organização.'
              : 'Preencha os dados para começar a doar.'}
          </ThemedText>
          {accountType === 'INSTITUTION' ? (
            <View style={styles.stepper}>
              <View style={[styles.stepDot, { backgroundColor: step === 1 ? colors.primary : colors.success }]}>
                <ThemedText variant="caption" color={colors.surface} style={styles.linkBold}>
                  {step === 1 ? '1' : '✓'}
                </ThemedText>
              </View>
              <View style={[styles.stepLine, { backgroundColor: colors.primary }]} />
              <View
                style={[
                  styles.stepDot,
                  {
                    backgroundColor: step === 2 ? colors.primary : colors.background,
                    borderColor: step === 2 ? colors.primary : colors.border,
                  },
                ]}>
                <ThemedText
                  variant="caption"
                  color={step === 2 ? colors.surface : colors.textMuted}
                  style={styles.linkBold}>
                  2
                </ThemedText>
              </View>
            </View>
          ) : null}
        </View>

        {accountType === 'INSTITUTION' && step === 2 ? (
          <View style={styles.form}>
            <View style={styles.sectionTitle}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="business" size={18} color={colors.primary} />
              </View>
              <ThemedText variant="subtitle">Informações da instituição</ThemedText>
            </View>

            <Input
              label="Razão social"
              value={institutionLegalName}
              onChangeText={(v) => { setInstitutionLegalName(v); clearFieldError('institutionLegalName'); }}
              error={fieldErrors.institutionLegalName}
              placeholder="Nome legal da instituição"
              returnKeyType="next"
              leftSlot={<Ionicons name="business-outline" size={18} color={colors.icon} />}
            />

            <Input
              label="Nome fantasia"
              value={institutionDisplayName}
              onChangeText={(v) => { setInstitutionDisplayName(v); clearFieldError('institutionDisplayName'); }}
              error={fieldErrors.institutionDisplayName}
              placeholder="Nome público"
              returnKeyType="next"
              leftSlot={<Ionicons name="pricetag-outline" size={18} color={colors.icon} />}
            />

            <Input
              label="CNPJ"
              value={institutionCnpj}
              onChangeText={(v) => { setInstitutionCnpj(formatCnpj(v)); clearFieldError('institutionCnpj'); }}
              error={fieldErrors.institutionCnpj}
              keyboardType="number-pad"
              placeholder="00.000.000/0000-00"
              returnKeyType="next"
              leftSlot={<Ionicons name="document-text-outline" size={18} color={colors.icon} />}
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
              leftSlot={<Ionicons name="mail-outline" size={18} color={colors.icon} />}
            />

            <Input
              label="Telefone institucional"
              value={institutionPhone}
              onChangeText={(v) => { setInstitutionPhone(formatPhone(v)); clearFieldError('institutionPhone'); }}
              error={fieldErrors.institutionPhone}
              keyboardType="phone-pad"
              placeholder="(00) 00000-0000"
              returnKeyType="next"
              leftSlot={<Ionicons name="call-outline" size={18} color={colors.icon} />}
            />

            <Input
              label="Site"
              value={institutionWebsite}
              onChangeText={setInstitutionWebsite}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="https://instituicao.org.br"
              returnKeyType="next"
              leftSlot={<Ionicons name="globe-outline" size={18} color={colors.icon} />}
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

            <View style={styles.termsBlock}>
              <View style={styles.termsRow}>
                <Checkbox
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => {
                    setAcceptedTerms(checked);
                    clearFieldError('terms');
                  }}
                />
                <ThemedText variant="body" color={colors.text}>
                  Aceito os{' '}
                  <ThemedText
                    variant="body"
                    color={colors.primary}
                    style={styles.linkBold}
                    onPress={() => router.push(routes.authTerms)}>
                    Termos e a Política de Privacidade
                  </ThemedText>
                </ThemedText>
              </View>
              {fieldErrors.terms ? (
                <ThemedText variant="caption" color={colors.danger}>
                  {fieldErrors.terms}
                </ThemedText>
              ) : null}
            </View>

            {apiError ? (
              <ThemedText variant="caption" color={colors.danger} style={styles.apiError}>
                {apiError}
              </ThemedText>
            ) : null}

            <Button
              fullWidth
              loading={loading}
              rightSlot={<Ionicons name="checkmark-circle-outline" size={18} color={colors.surface} />}
              onPress={handleSubmit}>
              Criar conta
            </Button>
          </View>
        ) : (
          <>
            <View style={styles.sectionTitle}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="person" size={18} color={colors.primary} />
              </View>
              <ThemedText variant="subtitle">
                {accountType === 'INSTITUTION' ? 'Responsável pela conta' : 'Dados da conta'}
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
            leftSlot={<Ionicons name="person-outline" size={18} color={colors.icon} />}
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
            leftSlot={<Ionicons name="id-card-outline" size={18} color={colors.icon} />}
          />

          <Input
            label="Telefone"
            value={phone}
            onChangeText={(v) => { setPhone(formatPhone(v)); clearFieldError('phone'); }}
            error={fieldErrors.phone}
            keyboardType="phone-pad"
            placeholder="(00) 00000-0000"
            returnKeyType="next"
            leftSlot={<Ionicons name="call-outline" size={18} color={colors.icon} />}
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
            leftSlot={<Ionicons name="mail-outline" size={18} color={colors.icon} />}
          />

          <Input
            label="Senha"
            value={password}
            onChangeText={(v) => { setPassword(v); clearFieldError('password'); }}
            error={fieldErrors.password}
            secureTextEntry={!showPassword}
            placeholder="Mínimo 8 caracteres"
            returnKeyType="next"
            leftSlot={<Ionicons name="lock-closed-outline" size={18} color={colors.icon} />}
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
            leftSlot={<Ionicons name="lock-closed-outline" size={18} color={colors.icon} />}
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

          {accountType === 'DONOR' ? (
            <View style={styles.termsBlock}>
              <View style={styles.termsRow}>
                <Checkbox
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => {
                    setAcceptedTerms(checked);
                    clearFieldError('terms');
                  }}
                />
                <ThemedText variant="body" color={colors.text}>
                  Aceito os{' '}
                  <ThemedText
                    variant="body"
                    color={colors.primary}
                    style={styles.linkBold}
                    onPress={() => router.push(routes.authTerms)}>
                    Termos e a Política de Privacidade
                  </ThemedText>
                </ThemedText>
              </View>
              {fieldErrors.terms ? (
                <ThemedText variant="caption" color={colors.danger}>
                  {fieldErrors.terms}
                </ThemedText>
              ) : null}
            </View>
          ) : null}

          {apiError ? (
            <ThemedText variant="caption" color={colors.danger} style={styles.apiError}>
              {apiError}
            </ThemedText>
          ) : null}

          <Button
            fullWidth
            loading={loading}
            rightSlot={
              accountType === 'INSTITUTION'
                ? <Ionicons name="arrow-forward" size={18} color={colors.surface} />
                : undefined
            }
            onPress={accountType === 'INSTITUTION' ? handleContinueInstitution : handleSubmit}>
            {accountType === 'INSTITUTION' ? 'Continuar' : 'Criar conta'}
          </Button>
        </View>
          </>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText variant="caption" color={colors.textMuted}>
            Já tem uma conta?
          </ThemedText>
          <Pressable onPress={() => router.replace(routes.authLogin)}>
            <ThemedText variant="caption" color={colors.primary} style={styles.linkBold}>
              Entrar
            </ThemedText>
          </Pressable>
        </View>

      </View>
    </ScreenContainer>
  );
}
