import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Checkbox, DatePicker, Input, ScreenContainer, ThemedText } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getHomeRouteForRole, routes } from '@/navigation/routes';
import { getActiveRole } from '@/navigation/session';
import { ApiError } from '@/services/api';
import { authService } from '@/services/auth';
import { getPasswordPolicyError } from '@/services/auth/password-policy';
import { useAppStore } from '@/store';
import { theme } from '@/theme';

import { styles } from './styles';

type AccountType = 'DONOR' | 'INSTITUTION';

type FieldErrors = {
  cpf?: string;
  birthDate?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
  institutionCnpj?: string;
  institutionLegalName?: string;
  institutionDisplayName?: string;
  institutionEmail?: string;
  institutionPhone?: string;
};

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
    return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  }

  return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getApiMessage(error: ApiError) {
  if (error.payload && typeof error.payload === 'object' && 'message' in error.payload) {
    const { message } = error.payload;
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.join(' ');
  }
  return '';
}

function getOnboardingErrorMessage(error: ApiError) {
  const message = getApiMessage(error);

  if (error.status === 409) {
    if (message.includes('CNPJ')) return 'Este CNPJ já está cadastrado.';
    if (message.includes('CPF')) return 'Este CPF já está cadastrado.';
    return 'Já existe um cadastro com esses dados.';
  }

  if (error.status === 400) {
    if (message.toLowerCase().includes('token')) {
      return 'Sua sessão de cadastro expirou. Entre com o Google novamente.';
    }
    return message || 'Revise os dados informados e tente novamente.';
  }

  return message || 'Não foi possível concluir o cadastro. Tente novamente.';
}

function validate(
  accountType: AccountType,
  cpf: string,
  birthDate: Date | null,
  phone: string,
  password: string,
  confirmPassword: string,
  acceptedTerms: boolean,
  institutionCnpj: string,
  institutionLegalName: string,
  institutionDisplayName: string,
  institutionEmail: string,
  institutionPhone: string,
): FieldErrors {
  const errors: FieldErrors = {};

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

  if (password || confirmPassword) {
    const passwordError = getPasswordPolicyError(password);
    if (passwordError) {
      errors.password = passwordError;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'As senhas não coincidem.';
    }
  }

  if (!acceptedTerms) {
    errors.terms = 'Aceite os termos para continuar.';
  }

  if (accountType === 'INSTITUTION') {
    if (!institutionCnpj.trim()) {
      errors.institutionCnpj = 'CNPJ é obrigatório.';
    } else if (onlyDigits(institutionCnpj).length !== 14) {
      errors.institutionCnpj = 'Informe um CNPJ válido.';
    }

    if (!institutionLegalName.trim()) {
      errors.institutionLegalName = 'Razão social é obrigatória.';
    }

    if (!institutionDisplayName.trim()) {
      errors.institutionDisplayName = 'Nome fantasia é obrigatório.';
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

  return errors;
}

export function GoogleOnboardingDetailsScreen() {
  const setSession = useAppStore((state) => state.setSession);
  const router = useRouter();
  const params = useLocalSearchParams<{
    onboardingToken?: string;
    name?: string;
    email?: string;
    accountType?: string;
  }>();
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  const onboardingToken = params.onboardingToken ?? '';
  const googleName = params.name ?? '';
  const googleEmail = params.email ?? '';
  const accountType: AccountType = params.accountType === 'INSTITUTION' ? 'INSTITUTION' : 'DONOR';

  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [institutionLegalName, setInstitutionLegalName] = useState(googleName);
  const [institutionDisplayName, setInstitutionDisplayName] = useState(googleName);
  const [institutionCnpj, setInstitutionCnpj] = useState('');
  const [institutionEmail, setInstitutionEmail] = useState(googleEmail);
  const [institutionPhone, setInstitutionPhone] = useState('');
  const [institutionDescription, setInstitutionDescription] = useState('');
  const [institutionWebsite, setInstitutionWebsite] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingInstitutionName, setPendingInstitutionName] = useState('');

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit() {
    setApiError('');

    const errors = validate(
      accountType,
      cpf,
      birthDate,
      phone,
      password,
      confirmPassword,
      acceptedTerms,
      institutionCnpj,
      institutionLegalName,
      institutionDisplayName,
      institutionEmail,
      institutionPhone,
    );
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const response = await authService.completeGoogleOnboarding({
        onboardingToken,
        accountType,
        cpf: onlyDigits(cpf),
        birthDate: toIsoDate(birthDate as Date),
        phone: onlyDigits(phone),
        ...(password ? { password } : {}),
        ...(accountType === 'INSTITUTION'
          ? {
              institutionCnpj: onlyDigits(institutionCnpj),
              institutionLegalName: institutionLegalName.trim(),
              institutionDisplayName: institutionDisplayName.trim(),
              institutionEmail: institutionEmail.trim(),
              institutionPhone: onlyDigits(institutionPhone) || undefined,
              institutionDescription: institutionDescription.trim() || undefined,
              institutionWebsite: institutionWebsite.trim() || undefined,
            }
          : {}),
      });

      if ('status' in response) {
        setPendingInstitutionName(response.institution.name);
        return;
      }

      const { accessToken, refreshToken, user } = response;
      setSession(accessToken, user, refreshToken);
      router.replace(getHomeRouteForRole(getActiveRole(user)));
    } catch (error) {
      if (error instanceof ApiError) {
        setApiError(getOnboardingErrorMessage(error));
      } else {
        setApiError('Não foi possível concluir o cadastro. Tente novamente.');
      }
    } finally {
      setLoading(false);
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
            Recebemos o cadastro de {pendingInstitutionName}. O admin da plataforma precisa
            validar a instituição antes do acesso ser liberado.
          </ThemedText>
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
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>

        <View style={styles.header}>
          <ThemedText variant="title" style={styles.title}>
            {accountType === 'INSTITUTION' ? 'Dados da instituição' : 'Finalize seu cadastro'}
          </ThemedText>
          <ThemedText variant="body" color={colors.textMuted} style={styles.subtitle}>
            {googleName} · {googleEmail}
          </ThemedText>
        </View>

        <View style={styles.sectionTitle}>
          <View style={[styles.sectionIcon, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="person" size={18} color={colors.primary} />
          </View>
          <ThemedText variant="subtitle">
            {accountType === 'INSTITUTION' ? 'Responsável pela conta' : 'Seus dados'}
          </ThemedText>
        </View>

        <View style={styles.form}>
          <Input
            label="CPF"
            value={cpf}
            onChangeText={(v) => {
              setCpf(formatCpf(v));
              clearFieldError('cpf');
            }}
            error={fieldErrors.cpf}
            keyboardType="number-pad"
            placeholder="000.000.000-00"
            returnKeyType="next"
            leftSlot={<Ionicons name="id-card-outline" size={18} color={colors.icon} />}
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
            label="Telefone"
            value={phone}
            onChangeText={(v) => {
              setPhone(formatPhone(v));
              clearFieldError('phone');
            }}
            error={fieldErrors.phone}
            keyboardType="phone-pad"
            placeholder="(00) 00000-0000"
            returnKeyType="next"
            leftSlot={<Ionicons name="call-outline" size={18} color={colors.icon} />}
          />

          <Input
            label="Senha (opcional)"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              clearFieldError('password');
            }}
            error={fieldErrors.password}
            secureTextEntry={!showPassword}
            placeholder="Crie uma senha para também entrar com e-mail"
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

          {password ? (
            <Input
              label="Confirmar senha"
              value={confirmPassword}
              onChangeText={(v) => {
                setConfirmPassword(v);
                clearFieldError('confirmPassword');
              }}
              error={fieldErrors.confirmPassword}
              secureTextEntry={!showConfirm}
              placeholder="Repita a senha"
              returnKeyType="next"
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
          ) : null}
        </View>

        {accountType === 'INSTITUTION' ? (
          <>
            <View style={styles.sectionTitle}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="business" size={18} color={colors.primary} />
              </View>
              <ThemedText variant="subtitle">Informações da instituição</ThemedText>
            </View>

            <View style={styles.form}>
              <Input
                label="Razão social"
                value={institutionLegalName}
                onChangeText={(v) => {
                  setInstitutionLegalName(v);
                  clearFieldError('institutionLegalName');
                }}
                error={fieldErrors.institutionLegalName}
                placeholder="Nome legal da instituição"
                returnKeyType="next"
                leftSlot={<Ionicons name="business-outline" size={18} color={colors.icon} />}
              />

              <Input
                label="Nome fantasia"
                value={institutionDisplayName}
                onChangeText={(v) => {
                  setInstitutionDisplayName(v);
                  clearFieldError('institutionDisplayName');
                }}
                error={fieldErrors.institutionDisplayName}
                placeholder="Nome público"
                returnKeyType="next"
                leftSlot={<Ionicons name="pricetag-outline" size={18} color={colors.icon} />}
              />

              <Input
                label="CNPJ"
                value={institutionCnpj}
                onChangeText={(v) => {
                  setInstitutionCnpj(formatCnpj(v));
                  clearFieldError('institutionCnpj');
                }}
                error={fieldErrors.institutionCnpj}
                keyboardType="number-pad"
                placeholder="00.000.000/0000-00"
                returnKeyType="next"
                leftSlot={<Ionicons name="document-text-outline" size={18} color={colors.icon} />}
              />

              <Input
                label="E-mail institucional"
                value={institutionEmail}
                onChangeText={(v) => {
                  setInstitutionEmail(v);
                  clearFieldError('institutionEmail');
                }}
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
                onChangeText={(v) => {
                  setInstitutionPhone(formatPhone(v));
                  clearFieldError('institutionPhone');
                }}
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
            </View>
          </>
        ) : null}

        <View style={styles.termsBlock}>
          <View style={styles.termsRow}>
            <Checkbox
              checked={acceptedTerms}
              onCheckedChange={(checked) => {
                setAcceptedTerms(checked);
                clearFieldError('terms');
              }}
            />
            <ThemedText variant="body" color={colors.text} style={{ flex: 1 }}>
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

        <Button fullWidth loading={loading} onPress={handleSubmit}>
          Concluir cadastro
        </Button>
      </View>
    </ScreenContainer>
  );
}
