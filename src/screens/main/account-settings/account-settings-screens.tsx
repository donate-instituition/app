import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, Switch, View } from 'react-native';

import { Avatar, Button, Card, Divider, EmptyState, Loading, ScreenContainer, ThemedText } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFetch } from '@/hooks/use-fetch';
import { routes } from '@/navigation/routes';
import {
  defaultNotificationSettings,
  getAvatarSource,
  type NotificationSettings,
} from '@/navigation/session';
import { authService } from '@/services/auth';
import { chatService } from '@/services/chat';
import { supportService } from '@/services/support';
import { uploadsService } from '@/services/uploads';
import { useAppStore } from '@/store';
import { theme } from '@/theme';

import { styles } from './styles';

type HeaderProps = {
  description?: string;
  title: string;
};

type SettingsRowProps = {
  description?: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress?: () => Promise<void> | void;
  right?: React.ReactNode;
};

const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? 'contato@elodoar.local';
const SUPPORT_WHATSAPP = process.env.EXPO_PUBLIC_SUPPORT_WHATSAPP ?? '5581999999999';

function Header({ description, title }: HeaderProps) {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={26} color={colors.primaryStrong} />
      </Pressable>
      <View style={styles.headerText}>
        <ThemedText variant="title" numberOfLines={2}>
          {title}
        </ThemedText>
        {description ? (
          <ThemedText variant="body" color={colors.textMuted} numberOfLines={3}>
            {description}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

function SettingsRow({ description, icon, label, onPress, right }: SettingsRowProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  const content = (
    <>
      <View style={[styles.rowIcon, { backgroundColor: colors.primarySoft }]}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.rowContent}>
        <ThemedText variant="body" numberOfLines={1}>
          {label}
        </ThemedText>
        {description ? (
          <ThemedText variant="caption" color={colors.textMuted} numberOfLines={2}>
            {description}
          </ThemedText>
        ) : null}
      </View>
      {right ? <View style={styles.rowRight}>{right}</View> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.row,
          pressed ? styles.pressed : undefined,
        ]}>
        {content}
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.row,
      ]}>
      {content}
    </View>
  );
}

function FieldPreview({ label, value }: { label: string; value?: string }) {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  return (
    <View style={[styles.inputLike, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <ThemedText variant="caption" color={colors.textMuted}>
        {label}
      </ThemedText>
      <ThemedText variant="body" numberOfLines={1}>
        {value || 'Nao informado'}
      </ThemedText>
    </View>
  );
}

export function MyDataScreen() {
  const user = useAppStore((state) => state.user);
  const authToken = useAppStore((state) => state.authToken);
  const setProfilePhotoUrl = useAppStore((state) => state.setProfilePhotoUrl);
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  function handleSave() {
    Alert.alert('Alterações salvas', 'Quando o endpoint de perfil estiver pronto, esses dados serão persistidos no backend.');
  }

  async function handlePickAvatar() {
    if (!user) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Autorize o acesso às fotos para atualizar sua imagem de perfil.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      base64: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    if (!asset.base64) {
      Alert.alert('Não foi possível ler a imagem', 'Tente selecionar outra foto.');
      return;
    }

    setUploadingAvatar(true);

    try {
      const createdUpload = await uploadsService.createUpload(
        {
          base64: asset.base64,
          category: 'USER_AVATAR',
          contentType: asset.mimeType ?? 'image/jpeg',
          filename: asset.fileName ?? `avatar-${Date.now()}.jpg`,
        },
        authToken,
      );

      const confirmedUpload = await uploadsService.confirmUpload(
        createdUpload.uploadId,
        { category: 'USER_AVATAR', fileName: createdUpload.fileName },
        authToken,
      );

      if (confirmedUpload.url) {
        await authService.updateProfilePhoto(user.id, confirmedUpload.url, authToken);
        setProfilePhotoUrl(confirmedUpload.url);
      }
    } catch {
      Alert.alert('Não foi possível atualizar a foto', 'Tente novamente em instantes.');
    } finally {
      setUploadingAvatar(false);
    }
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <Header title="Meus dados" description="Confira as informações principais da sua conta." />

        <Card style={styles.formCard}>
          <View style={styles.profileSummary}>
            <Pressable
              accessibilityRole="button"
              disabled={uploadingAvatar}
              onPress={handlePickAvatar}
              style={styles.avatarPressable}>
              <Avatar name={user?.name} source={getAvatarSource(user)} size="lg" />
              <View style={[styles.avatarEdit, { backgroundColor: colors.primary }]}>
                {uploadingAvatar ? (
                  <ActivityIndicator size="small" color={colors.surface} />
                ) : (
                  <Ionicons name="pencil-outline" size={16} color={colors.surface} />
                )}
              </View>
            </Pressable>
            <ThemedText variant="subtitle" numberOfLines={2} style={{ textAlign: 'center' }}>
              {user?.name}
            </ThemedText>
            <ThemedText variant="caption" color={colors.textMuted} numberOfLines={1}>
              {user?.email}
            </ThemedText>
          </View>
          <FieldPreview label="Nome completo" value={user?.name} />
          <FieldPreview label="E-mail" value={user?.email} />
          <View style={styles.splitRow}>
            <View style={styles.splitItem}>
              <FieldPreview label="CPF" value="000.000.000-00" />
            </View>
            <View style={styles.splitItem}>
              <FieldPreview label="Telefone" value="(00) 00000-0000" />
            </View>
          </View>
          <Button fullWidth style={styles.actionButton} leftSlot={<Ionicons name="save-outline" size={22} color={colors.surface} />} onPress={handleSave}>
            Salvar alterações
          </Button>
        </Card>
      </View>
    </ScreenContainer>
  );
}

export function NotificationSettingsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const user = useAppStore((state) => state.user);
  const authToken = useAppStore((state) => state.authToken);
  const setNotificationSettings = useAppStore((state) => state.setNotificationSettings);
  const [savingKey, setSavingKey] = useState<keyof NotificationSettings | null>(null);
  const [error, setError] = useState('');

  const settings = user?.notificationSettings ?? defaultNotificationSettings;

  async function handleToggle(key: keyof NotificationSettings, nextValue: boolean) {
    setError('');
    setSavingKey(key);
    setNotificationSettings({ [key]: nextValue });

    try {
      const updatedUser = await authService.updateNotificationSettings(
        { [key]: nextValue },
        authToken,
      );
      setNotificationSettings(updatedUser.notificationSettings ?? { [key]: nextValue });
    } catch {
      setNotificationSettings({ [key]: !nextValue });
      setError('Não foi possível salvar sua preferência. Tente novamente.');
    } finally {
      setSavingKey(null);
    }
  }

  function renderSwitch(key: keyof NotificationSettings) {
    const value = settings[key];

    return (
      <Switch
        value={value}
        onValueChange={(next) => handleToggle(key, next)}
        disabled={savingKey === key}
        trackColor={{ false: colors.border, true: colors.primarySoft }}
        thumbColor={value ? colors.primary : colors.surface}
      />
    );
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <Header title="Preferências de notificação" description="Escolha como o EloDoar deve falar com voce." />

        <View style={styles.section}>
          <ThemedText variant="body" style={styles.sectionTitle}>
            Preferências
          </ThemedText>
          <Card padding="none" style={styles.card}>
            <SettingsRow
              icon="heart-outline"
              label="Doações"
              description="Confirmacoes, recibos e atualizacoes de status."
              right={renderSwitch('donations')}
            />
            <Divider />
            <SettingsRow
              icon="megaphone-outline"
              label="Campanhas"
              description="Metas atingidas, novas campanhas e prestacoes."
              right={renderSwitch('campaigns')}
            />
            <Divider />
            <SettingsRow
              icon="chatbubble-outline"
              label="Conversas"
              description="Mensagens recebidas de instituicoes."
              right={renderSwitch('conversations')}
            />
            <Divider />
            <SettingsRow
              icon="mail-outline"
              label="Resumo por e-mail"
              description="Um resumo semanal das suas interacoes."
              right={renderSwitch('emailDigestEnabled')}
            />
          </Card>
          {error ? (
            <ThemedText variant="caption" color={colors.danger} style={styles.apiError}>
              {error}
            </ThemedText>
          ) : null}
        </View>
      </View>
    </ScreenContainer>
  );
}

export function PrivacySecurityScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const router = useRouter();
  const [profileVisible, setProfileVisible] = useState(true);

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <Header title="Privacidade e segurança" description="Proteja sua conta e controle seus dados." />

        <View style={styles.section}>
          <ThemedText variant="body" style={styles.sectionTitle}>
            Segurança
          </ThemedText>
          <Card padding="none" style={styles.card}>
            <SettingsRow icon="key-outline" label="Alterar senha" description="Atualize sua senha de acesso." onPress={() => Alert.alert('Alterar senha', 'Use o fluxo de recuperação de senha na tela de login por enquanto.')} right={<Ionicons name="chevron-forward" size={18} color={colors.border} />} />
            <Divider />
            <SettingsRow icon="shield-checkmark-outline" label="Verificação da conta" description="Sua conta esta verificada." right={<ThemedText variant="caption" color={colors.success}>Ativa</ThemedText>} />
            <Divider />
            <SettingsRow icon="phone-portrait-outline" label="Sessões conectadas" description="Veja dispositivos com acesso a sua conta." onPress={() => Alert.alert('Sessões conectadas', 'Ainda não há outras sessões conectadas para exibir.')} right={<Ionicons name="chevron-forward" size={18} color={colors.border} />} />
          </Card>
        </View>

        <View style={styles.section}>
          <ThemedText variant="body" style={styles.sectionTitle}>
            Privacidade
          </ThemedText>
          <Card padding="none" style={styles.card}>
            <SettingsRow
              icon="eye-outline"
              label="Perfil visível"
              description="Permite que instituicoes vejam seu perfil publico."
              right={<Switch value={profileVisible} onValueChange={setProfileVisible} trackColor={{ false: colors.border, true: colors.primarySoft }} thumbColor={profileVisible ? colors.primary : colors.surface} />}
            />
            <Divider />
            <SettingsRow icon="document-text-outline" label="Termos e Política de Privacidade" description="Leia o termo vigente aceito no app." onPress={() => router.push(routes.authTerms)} right={<Ionicons name="chevron-forward" size={18} color={colors.border} />} />
          </Card>
        </View>

        <Card style={styles.dangerCard}>
          <SettingsRow icon="trash-outline" label="Excluir conta" description="Solicite a remocao permanente dos seus dados." />
          <Pressable
            onPress={() => Alert.alert('Excluir conta', 'Sua solicitação de exclusão foi registrada para análise.')}
            style={[styles.dangerButton, { borderColor: colors.danger, backgroundColor: colors.secondarySoft }]}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
            <ThemedText variant="caption" color={colors.danger} style={{ fontWeight: '600' }}>
              Solicitar exclusao
            </ThemedText>
          </Pressable>
        </Card>
      </View>
    </ScreenContainer>
  );
}

export function HelpSupportScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const authToken = useAppStore((state) => state.authToken);
  const faq = useFetch(useCallback(() => supportService.getCurrentFaq(), []));
  const faqItems = faq.data?.items ?? [];

  async function openSupportChat() {
    const conversationId = await chatService.ensureSupportConversation(authToken);
    router.push(routes.appChat(conversationId));
  }

  async function openEmail() {
    const subject = encodeURIComponent('Suporte EloDoar');
    await Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}`);
  }

  async function openWhatsApp() {
    const text = encodeURIComponent('Olá! Preciso de ajuda com o EloDoar.');
    const appUrl = `whatsapp://send?phone=${SUPPORT_WHATSAPP}&text=${text}`;
    const webUrl = `https://wa.me/${SUPPORT_WHATSAPP}?text=${text}`;

    try {
      await Linking.openURL(appUrl);
    } catch {
      await Linking.openURL(webUrl);
    }
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <Header title="Ajuda e suporte" description="Encontre respostas ou fale com a equipe EloDoar." />

        <View style={[styles.helpHero, { backgroundColor: colors.primarySoft }]}>
          <View style={[styles.helpIcon, { backgroundColor: colors.surface }]}>
            <Ionicons name="heart-circle-outline" size={38} color={colors.primary} />
          </View>
          <ThemedText variant="subtitle" style={{ textAlign: 'center' }}>
            Como podemos ajudar?
          </ThemedText>
          <ThemedText variant="caption" color={colors.textMuted} style={{ textAlign: 'center' }}>
            Nossa equipe responde dúvidas sobre conta, doações, campanhas e segurança.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText variant="body" style={styles.sectionTitle}>
            Canais
          </ThemedText>
          <Card padding="none" style={styles.card}>
            <SettingsRow icon="chatbubble-ellipses-outline" label="Falar pelo chat" description="Atendimento dentro do app." onPress={openSupportChat} right={<Ionicons name="chevron-forward" size={18} color={colors.primary} />} />
            <Divider />
            <SettingsRow icon="mail-outline" label="Enviar e-mail" description={SUPPORT_EMAIL} onPress={openEmail} right={<Ionicons name="chevron-forward" size={18} color={colors.primary} />} />
            <Divider />
            <SettingsRow icon="logo-whatsapp" label="WhatsApp" description="Disponível em horário comercial." onPress={openWhatsApp} right={<Ionicons name="chevron-forward" size={18} color={colors.primary} />} />
          </Card>
        </View>

        <View style={styles.section}>
          <ThemedText variant="body" style={styles.sectionTitle}>
            Perguntas frequentes
          </ThemedText>
          {faq.loading ? <Loading label="Carregando perguntas..." /> : null}
          {faq.error ? (
            <EmptyState
              title="Não foi possível carregar"
              description={faq.error}
              illustration={<Ionicons name="help-circle-outline" size={44} color={colors.border} />}
              action={<Button size="sm" variant="secondary" onPress={faq.refetch}>Tentar novamente</Button>}
            />
          ) : null}
          {!faq.loading && !faq.error && faqItems.length > 0 ? (
            <Card padding="none" style={styles.card}>
              {faqItems.map((item, index) => (
                <View key={`${item.question}-${index}`}>
                  <View style={styles.faqRow}>
                    <View style={[styles.faqIcon, { backgroundColor: colors.primarySoft }]}>
                      <ThemedText variant="subtitle" color={colors.primary}>?</ThemedText>
                    </View>
                    <View style={styles.faqContent}>
                      <ThemedText variant="body" style={{ fontWeight: '600' }}>{item.question}</ThemedText>
                      <ThemedText variant="caption" color={colors.textMuted}>{item.answer}</ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.primary} />
                  </View>
                  {index < faqItems.length - 1 ? <Divider /> : null}
                </View>
              ))}
            </Card>
          ) : null}
        </View>
      </View>
    </ScreenContainer>
  );
}
