import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Button, Card, FeedbackState, Input, ScreenContainer, Tag, ThemedText } from '@/components';
import { maskCpfOrCnpj } from '@/forms/masks/index';
import { useForm } from '@/forms/use-form/index';
import { composeValidators, cpfOrCnpj, minLength, required } from '@/forms/validators/index';
import { routes } from '@/navigation/routes';
import { roleLabels, type UserRole } from '@/navigation/session';
import { useAppStore } from '@/store';

import { styles } from './styles';

const loginOptions: {
  role: UserRole;
  title: string;
  description: string;
  email: string;
}[] = [
  {
    role: 'donor',
    title: roleLabels.donor,
    description: 'Acesso para doadores, campanhas, chat e acompanhamento de doacoes.',
    email: 'joao@email.com',
  },
  {
    role: 'institution-staff',
    title: roleLabels['institution-staff'],
    description: 'Acesso para campanhas, doacoes recebidas e gestao da instituicao.',
    email: 'instituicao@email.com',
  },
  {
    role: 'platform-admin',
    title: roleLabels['platform-admin'],
    description: 'Acesso administrativo para moderacao, usuarios e configuracoes.',
    email: 'admin@elodoar.com',
  },
];

export function LoginScreen() {
  const loginAs = useAppStore((state) => state.loginAs);
  const router = useRouter();
  const form = useForm({
    initialValues: {
      document: '',
      password: '',
    },
    masks: {
      document: maskCpfOrCnpj,
    },
    validators: {
      document: composeValidators(required(), cpfOrCnpj()),
      password: composeValidators(required(), minLength(6)),
    },
  });

  function handleLogin(role: UserRole) {
    if (!form.validate()) {
      return;
    }

    loginAs(role);
    router.replace(routes.appDashboard);
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <View style={styles.header}>
          <Tag label="Acesso mockado" variant="info" />
          <ThemedText variant="title">Entrar no EloDoar</ThemedText>
          <ThemedText variant="body">
            Escolha um perfil para simular a autenticacao enquanto o backend ainda nao esta
            integrado.
          </ThemedText>
        </View>

        <Card variant="outlined">
          <View style={styles.form}>
            <Input
              label="CPF ou CNPJ"
              placeholder="000.000.000-00"
              keyboardType="numeric"
              helperText="Use 123.456.789-00 para testar o fluxo mockado."
              successText="Documento pronto para validacao"
              {...form.fieldProps('document')}
            />
            <Input
              label="Senha"
              placeholder="Digite pelo menos 6 caracteres"
              secureTextEntry
              successText="Senha preenchida corretamente"
              {...form.fieldProps('password')}
            />
            {form.submitted && Object.keys(form.errors).length === 0 ? (
              <FeedbackState
                variant="success"
                title="Formulario valido"
                description="Escolha um perfil abaixo para entrar no mock."
              />
            ) : null}
          </View>
        </Card>

        <View style={styles.roleList}>
          {loginOptions.map((option) => (
            <Card key={option.role} variant="filled">
              <View style={styles.form}>
                <View>
                  <ThemedText variant="subtitle">{option.title}</ThemedText>
                  <ThemedText variant="caption">{option.email}</ThemedText>
                </View>
                <ThemedText variant="body">{option.description}</ThemedText>
                <Button onPress={() => handleLogin(option.role)}>{`Entrar como ${option.title}`}</Button>
              </View>
            </Card>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}
