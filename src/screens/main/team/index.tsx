import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';

import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  EmptyState,
  Input,
  Loading,
  ScreenContainer,
  Select,
  Tag,
  ThemedText,
  Avatar,
} from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFetch } from '@/hooks/use-fetch';
import {
  institutionStaffService,
  type InstitutionStaffRole,
} from '@/services/institution-staff';
import { useAppStore } from '@/store';
import { theme } from '@/theme';
import { getPasswordPolicyError } from '@/services/auth/password-policy';

import { styles } from './styles';

type PasswordMode = 'manual' | 'generated';

const roleOptions: { label: string; value: InstitutionStaffRole }[] = [
  { label: 'Administrador', value: 'ADMIN' },
  { label: 'Gestor', value: 'MANAGER' },
  { label: 'Voluntário', value: 'VOLUNTEER' },
  { label: 'Operador de entrega', value: 'DELIVERY_OPERATOR' },
];

const creatorRoles = new Set<InstitutionStaffRole>(['OWNER', 'ADMIN', 'MANAGER']);

const roleLabels: Record<InstitutionStaffRole, string> = {
  OWNER: 'Admin instituição',
  ADMIN: 'Administrador',
  MANAGER: 'Gestor',
  VOLUNTEER: 'Voluntário',
  DELIVERY_OPERATOR: 'Operador de entrega',
};

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseDateInputValue(value: string) {
  if (!value) return null;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function TeamScreen() {
  const authToken = useAppStore((state) => state.authToken);
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<InstitutionStaffRole>('VOLUNTEER');
  const [passwordMode, setPasswordMode] = useState<PasswordMode>('generated');
  const [password, setPassword] = useState('');
  const [forcePasswordChange, setForcePasswordChange] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetcher = useCallback(
    () => institutionStaffService.getMyTeam(authToken),
    [authToken],
  );
  const team = useFetch(fetcher);
  const activeMembership = useMemo(() => team.data?.members.find((item) => item.institutionId) ?? null, [team.data]);
  const canCreateStaff = Boolean(team.data?.canCreateStaff ?? (activeMembership && creatorRoles.has(activeMembership.role)));

  function resetForm() {
    setName('');
    setEmail('');
    setCpf('');
    setBirthDate('');
    setPhone('');
    setRole('VOLUNTEER');
    setPasswordMode('generated');
    setPassword('');
    setForcePasswordChange(true);
  }

  function validate() {
    if (!activeMembership?.institutionId) return 'Não encontramos a instituição vinculada à sua conta.';
    if (!name.trim()) return 'Nome é obrigatório.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Informe um e-mail válido.';
    if (!cpf.replace(/\D/g, '')) return 'CPF é obrigatório.';
    if (!birthDate.trim()) return 'Data de nascimento é obrigatória.';
    if (!phone.replace(/\D/g, '')) return 'Telefone é obrigatório.';
    if (passwordMode === 'manual') {
      const passwordError = getPasswordPolicyError(password);
      if (passwordError) return passwordError;
    }
    return '';
  }

  async function handleSubmit() {
    setError('');
    setSuccess('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await institutionStaffService.createStaffUser(
        {
          birthDate: birthDate.trim(),
          cpf: cpf.replace(/\D/g, ''),
          email: email.trim(),
          forcePasswordChange: passwordMode === 'generated' ? true : forcePasswordChange,
          institutionId: activeMembership?.institutionId ?? '',
          name: name.trim(),
          password: passwordMode === 'manual' ? password : undefined,
          passwordMode,
          phone: phone.replace(/\D/g, ''),
          role,
        },
        authToken,
      );
      setSuccess('Conta criada. Enviamos a senha e o link de ativação por e-mail.');
      resetForm();
      setShowCreateForm(false);
      void team.refetch();
    } catch {
      setError('Não foi possível criar a conta. Verifique os dados e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <ThemedText variant="title">Equipe</ThemedText>
              <ThemedText variant="body" color={colors.textMuted}>
                {team.data?.institution?.name
                  ? `Pessoas vinculadas à ${team.data.institution.name}.`
                  : 'Pessoas vinculadas à sua instituição.'}
              </ThemedText>
            </View>
            {canCreateStaff ? (
              <Button
                size="sm"
                variant={showCreateForm ? 'secondary' : 'primary'}
                onPress={() => setShowCreateForm((value) => !value)}>
                {showCreateForm ? 'Fechar' : 'Adicionar'}
              </Button>
            ) : null}
          </View>
        </View>

        {team.loading ? <Loading label="Carregando equipe..." /> : null}

        {!team.loading && !activeMembership ? (
          <EmptyState
            title="Instituição não encontrada"
            description="Sua conta ainda não possui uma instituição ativa vinculada."
            illustration={<Ionicons name="business-outline" size={42} color={colors.border} />}
          />
        ) : null}

        {activeMembership ? (
          <View style={styles.list}>
            {team.data?.members.length ? (
              team.data.members.map((member) => (
                <Card key={member.id} variant="outlined">
                  <View style={styles.member}>
                    <Avatar
                      name={member.user?.name}
                      source={member.user?.profilePhotoUrl ? { uri: member.user.profilePhotoUrl } : undefined}
                      size="md"
                    />
                    <View style={styles.memberInfo}>
                      <ThemedText variant="body" style={{ fontWeight: '700' }}>
                        {member.user?.name ?? 'Usuário sem nome'}
                      </ThemedText>
                      <ThemedText variant="caption" color={colors.textMuted}>
                        {member.user?.email ?? 'E-mail indisponível'}
                      </ThemedText>
                      <View style={styles.memberMeta}>
                        <Tag label={roleLabels[member.role]} variant="neutral" />
                        <Tag
                          label={member.user?.isVerified ? 'Ativo' : 'Pendente'}
                          variant={member.user?.isVerified ? 'success' : 'warning'}
                        />
                      </View>
                    </View>
                  </View>
                </Card>
              ))
            ) : (
              <EmptyState
                title="Nenhum membro encontrado"
                description="Os usuários da instituição aparecerão aqui."
                illustration={<Ionicons name="people-outline" size={42} color={colors.border} />}
              />
            )}
          </View>
        ) : null}

        {activeMembership && !canCreateStaff ? (
          <ThemedText variant="caption" color={colors.textMuted}>
            Apenas administradores e gestores podem adicionar pessoas à equipe.
          </ThemedText>
        ) : null}

        {activeMembership && canCreateStaff && showCreateForm ? (
          <Card variant="outlined">
            <View style={styles.form}>
              <View style={styles.section}>
                <ThemedText variant="subtitle">
                  {activeMembership.institution?.name ?? 'Nova conta de usuário'}
                </ThemedText>
                <Input label="Nome completo" value={name} onChangeText={setName} placeholder="Maria Silva" />
                <Input
                  label="E-mail"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="maria@email.com"
                />
                <View style={styles.row}>
                  <Input
                    label="CPF"
                    value={cpf}
                    onChangeText={setCpf}
                    keyboardType="number-pad"
                    placeholder="00000000000"
                    style={styles.flex}
                  />
                  <DatePicker
                    label="Nascimento"
                    value={parseDateInputValue(birthDate)}
                    onChange={(date) => setBirthDate(toDateInputValue(date))}
                    maxDate={new Date()}
                    minDate={new Date(1900, 0, 1)}
                    placeholder="dd/mm/aaaa"
                    style={styles.flex}
                  />
                </View>
                <Input
                  label="Telefone"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="61999990000"
                />
              </View>

              <Select
                label="Perfil na instituição"
                value={role}
                options={roleOptions}
                helperText="Toque para escolher o perfil."
                onValueChange={(value) => setRole(value as InstitutionStaffRole)}
              />

              <Select
                label="Senha inicial"
                value={passwordMode}
                helperText="Toque para escolher como a senha será criada."
                options={[
                  { label: 'Sistema gera e envia por e-mail', value: 'generated' },
                  { label: 'Definir senha manualmente', value: 'manual' },
                ]}
                onValueChange={(value) => {
                  const nextMode = value as PasswordMode;
                  setPasswordMode(nextMode);
                  if (nextMode === 'generated') setForcePasswordChange(true);
                }}
              />

              {passwordMode === 'manual' ? (
                <>
                  <Input
                    label="Senha"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder="Mínimo 8 caracteres"
                  />
                  <Checkbox
                    checked={forcePasswordChange}
                    label="Forçar troca de senha no primeiro login"
                    helperText="Use quando a senha foi definida por outra pessoa."
                    onCheckedChange={setForcePasswordChange}
                  />
                </>
              ) : (
                <ThemedText variant="caption" color={colors.textMuted}>
                  O sistema criará uma senha segura, enviará por e-mail e obrigará a troca no primeiro login.
                </ThemedText>
              )}

              {error ? (
                <ThemedText variant="caption" color={colors.danger} style={styles.error}>
                  {error}
                </ThemedText>
              ) : null}

              {success ? (
                <View style={styles.success}>
                  <ThemedText variant="caption" color={colors.success} style={styles.error}>
                    {success}
                  </ThemedText>
                </View>
              ) : null}

              <Button fullWidth loading={submitting} onPress={handleSubmit}>
                Criar conta
              </Button>
            </View>
          </Card>
        ) : null}
      </View>
    </ScreenContainer>
  );
}
