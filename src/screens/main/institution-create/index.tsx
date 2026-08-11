import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Card, DatePicker, Input, ScreenContainer, Tag, ThemedText } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { routes } from '@/navigation/routes';
import { API_BASE_URL } from '@/services/api';
import { campaignsService, type Campaign } from '@/services/campaigns';
import { deliveryProofsService } from '@/services/delivery-proofs';
import { institutionStaffService, type InstitutionStaffRole } from '@/services/institution-staff';
import { postsService, type PostVisibility } from '@/services/posts';
import { uploadsService } from '@/services/uploads';
import { useAppStore } from '@/store/app-store';
import { theme } from '@/theme';

import { styles } from './styles';

type CreateMode = 'campaign' | 'post' | 'accountability';
type CampaignStep = 0 | 1 | 2;
type FeedbackToast = {
  message: string;
  title: string;
  type: 'error' | 'success' | 'info';
};

const CAMPAIGN_TAGS = ['Crianças', 'Inverno', 'Urgente', 'Educação', 'Alimentação', 'Saúde'];
const CAMPAIGN_PUBLISHER_ROLES: InstitutionStaffRole[] = ['OWNER', 'ADMIN', 'MANAGER'];

type SelectedCover = {
  base64: string;
  contentType: string;
  fileName: string;
  uri: string;
};

type SelectedProofFile = {
  base64: string;
  contentType: string;
  name: string;
  size?: number;
  uri: string;
};

function moneyTextToNumber(value: string) {
  const normalizedValue = value
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const amount = Number(normalizedValue);

  return Number.isFinite(amount) ? amount : 0;
}

function toDateInputValue(date: Date | null) {
  if (!date) {
    return undefined;
  }

  return date.toISOString();
}

function sanitizeBase64(value: string) {
  return value.includes(',') ? value.split(',').pop() ?? value : value;
}

export function InstitutionCreateScreen() {
  const authToken = useAppStore((state) => state.authToken);
  const params = useLocalSearchParams<{ mode?: string }>();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const [mode, setMode] = useState<CreateMode>(
    params.mode === 'post' || params.mode === 'accountability' ? params.mode : 'campaign',
  );
  const [campaignStep, setCampaignStep] = useState<CampaignStep>(0);
  const [accountabilityCampaignId, setAccountabilityCampaignId] = useState<string | null>(null);
  const [accountabilityCampaigns, setAccountabilityCampaigns] = useState<Campaign[]>([]);
  const [accountabilityDescription, setAccountabilityDescription] = useState('');
  const [proofFile, setProofFile] = useState<SelectedProofFile | null>(null);
  const [savingProof, setSavingProof] = useState(false);
  const [cover, setCover] = useState<SelectedCover | null>(null);
  const [description, setDescription] = useState('');
  const [endAt, setEndAt] = useState<Date | null>(new Date('2026-09-30T12:00:00.000Z'));
  const [goal, setGoal] = useState('10.000');
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [postContent, setPostContent] = useState('');
  const [postVisibility, setPostVisibility] = useState<PostVisibility>('PUBLIC');
  const [publishingPost, setPublishingPost] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Crianças']);
  const [stripeReady, setStripeReady] = useState(false);
  const [stripeStatusLoading, setStripeStatusLoading] = useState(true);
  const [staffRole, setStaffRole] = useState<InstitutionStaffRole | null>(null);
  const [staffRoleLoading, setStaffRoleLoading] = useState(true);
  const [title, setTitle] = useState('Inverno Solidário 2026');
  const [toast, setToast] = useState<FeedbackToast | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canPublishCampaign = useMemo(
    () => Boolean(staffRole && CAMPAIGN_PUBLISHER_ROLES.includes(staffRole)),
    [staffRole],
  );

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  function showToast(nextToast: FeedbackToast) {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setToast(nextToast);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3600);
  }

  function showError(title: string, message: string) {
    showToast({ title, message, type: 'error' });
  }

  function showSuccess(title: string, message: string) {
    showToast({ title, message, type: 'success' });
  }

  useEffect(() => {
    let active = true;

    async function loadStaffRole() {
      try {
        const memberships = await institutionStaffService.listMyMemberships(authToken);
        if (active) {
          const membership = memberships[0];
          setInstitutionId(membership?.institutionId ?? null);
          setStaffRole(membership?.role ?? null);

          if (membership?.institutionId) {
            const institution = await campaignsService.getInstitutionById(membership.institutionId);
            if (active) {
              setStripeReady(Boolean(institution.stripeConnect?.ready));
            }
          } else if (active) {
            setStripeReady(false);
          }
        }
      } catch {
        if (active) {
          setInstitutionId(null);
          setStaffRole(null);
          setStripeReady(false);
        }
      } finally {
        if (active) {
          setStaffRoleLoading(false);
          setStripeStatusLoading(false);
        }
      }
    }

    void loadStaffRole();

    return () => {
      active = false;
    };
  }, [authToken]);

  useEffect(() => {
    let active = true;

    async function loadCampaigns() {
      if (!authToken) return;

      try {
        const campaigns = await campaignsService.listMyInstitutionCampaigns(authToken);
        if (active) {
          setAccountabilityCampaigns(campaigns);
          setAccountabilityCampaignId((currentCampaignId) =>
            currentCampaignId ?? campaigns[0]?.id ?? null,
          );
        }
      } catch {
        if (active) {
          setAccountabilityCampaigns([]);
          setAccountabilityCampaignId(null);
        }
      }
    }

    void loadCampaigns();

    return () => {
      active = false;
    };
  }, [authToken]);

  async function handlePickCover() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      showError('Permissão necessária', 'Autorize o acesso às fotos para adicionar uma imagem de capa.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [16, 9],
      base64: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    if (!asset.base64) {
      showError('Não foi possível ler a imagem', 'Tente selecionar outra foto.');
      return;
    }

    setCover({
      base64: asset.base64,
      contentType: asset.mimeType ?? 'image/jpeg',
      fileName: asset.fileName ?? `campaign-cover-${Date.now()}.jpg`,
      uri: asset.uri,
    });
  }

  function toggleTag(tag: string) {
    setSelectedTags((currentTags) =>
      currentTags.includes(tag)
        ? currentTags.filter((currentTag) => currentTag !== tag)
        : [...currentTags, tag],
    );
  }

  function handleNextStep() {
    if (!stripeReady) {
      showError('Stripe Connect obrigatório', 'Valide a conta Stripe da instituição antes de criar campanhas.');
      return;
    }

    if (campaignStep === 0 && !title.trim()) {
      showError('Título obrigatório', 'Informe o nome da campanha.');
      return;
    }

    if (campaignStep === 1) {
      const moneyTarget = moneyTextToNumber(goal);

      if (moneyTarget <= 0) {
        showError('Meta obrigatória', 'Informe uma meta válida para a campanha.');
        return;
      }
    }

    setCampaignStep((currentStep) => Math.min(2, currentStep + 1) as CampaignStep);
  }

  function handlePreviousStep() {
    setCampaignStep((currentStep) => Math.max(0, currentStep - 1) as CampaignStep);
  }

  async function handleCreateCampaign() {
    if (!stripeReady) {
      showError('Stripe Connect obrigatório', 'Valide a conta Stripe da instituição antes de criar campanhas.');
      return;
    }

    if (!title.trim()) {
      showError('Título obrigatório', 'Informe o nome da campanha.');
      return;
    }

    const moneyTarget = moneyTextToNumber(goal);

    if (moneyTarget <= 0) {
      showError('Meta obrigatória', 'Informe uma meta válida para a campanha.');
      return;
    }

    setSaving(true);

    try {
      const campaign = await campaignsService.createMyInstitutionCampaign(
        {
          description: description.trim(),
          endAt: toDateInputValue(endAt),
          goal: {
            moneyTarget,
          },
          status: canPublishCampaign ? 'PUBLISHED' : 'IN_REVIEW',
          tags: selectedTags,
          title: title.trim(),
        },
        authToken,
      );

      if (cover) {
        const createdUpload = await uploadsService.createUpload(
          {
            base64: cover.base64,
            category: 'CAMPAIGN_BANNER',
            contentType: cover.contentType,
            filename: cover.fileName,
          },
          authToken,
        );

        const confirmedUpload = await uploadsService.confirmUpload(
          createdUpload.uploadId,
          { campaignId: campaign.id, category: 'CAMPAIGN_BANNER', fileName: createdUpload.fileName },
          authToken,
        );

        if (confirmedUpload.url) {
          await campaignsService.updateMyInstitutionCampaignBanner(
            campaign.id,
            confirmedUpload.url,
            authToken,
          );
        }
      }

      showSuccess(
        canPublishCampaign ? 'Campanha publicada' : 'Campanha enviada',
        canPublishCampaign
          ? 'A campanha já está publicada no app.'
          : 'A campanha foi enviada para revisão de um administrador da instituição.',
      );
      router.push(
        canPublishCampaign
          ? routes.appCampaignDetail(campaign.id)
          : routes.institutionCampaigns,
      );
    } catch (error) {
      showError(
        'Não foi possível criar',
        error instanceof Error ? error.message : 'Tente novamente em instantes.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleCreatePost() {
    const content = postContent.trim();

    if (!content) {
      showError('Texto obrigatório', 'Escreva algo para publicar.');
      return;
    }

    if (!institutionId) {
      showError(
        'Instituição não encontrada',
        'Não encontramos um vínculo ativo com a instituição para publicar.',
      );
      return;
    }

    setPublishingPost(true);

    try {
      await postsService.createPost(
        {
          authorType: 'INSTITUTION',
          content,
          institutionId,
          visibility: postVisibility,
        },
        authToken,
      );

      setPostContent('');
      showSuccess('Post publicado', 'A postagem já está disponível no feed.');
      router.push(routes.institutionDashboard);
    } catch (error) {
      showError(
        'Não foi possível publicar',
        error instanceof Error ? error.message : 'Tente novamente em instantes.',
      );
    } finally {
      setPublishingPost(false);
    }
  }

  async function handlePickProofFile() {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: ['application/pdf', 'image/jpeg', 'image/png'],
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    const contentType = asset.mimeType ?? 'application/octet-stream';

    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(contentType)) {
      showError('Arquivo inválido', 'Envie um comprovante em PDF, JPG ou PNG.');
      return;
    }

    const maxSizeBytes = 10 * 1024 * 1024;

    if (asset.size && asset.size > maxSizeBytes) {
      showError('Arquivo muito grande', 'O comprovante precisa ter até 10MB.');
      return;
    }

    const base64 = asset.base64
      ? sanitizeBase64(asset.base64)
      : await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

    setProofFile({
      base64,
      contentType,
      name: asset.name,
      size: asset.size,
      uri: asset.uri,
    });
  }

  async function handleCreateDeliveryProof() {
    if (!accountabilityCampaignId) {
      showError('Campanha obrigatória', 'Selecione uma campanha para a prestação.');
      return;
    }

    if (!proofFile) {
      showError('Comprovante obrigatório', 'Envie uma nota fiscal, foto ou relatório.');
      return;
    }

    setSavingProof(true);

    try {
      const createdUpload = await uploadsService.createUpload(
        {
          base64: proofFile.base64,
          category: 'DELIVERY_PROOF',
          contentType: proofFile.contentType,
          filename: proofFile.name,
        },
        authToken,
      );

      const confirmedUpload = await uploadsService.confirmUpload(
        createdUpload.uploadId,
        { campaignId: accountabilityCampaignId, category: 'DELIVERY_PROOF', fileName: createdUpload.fileName },
        authToken,
      );

      await deliveryProofsService.createDeliveryProof(
        {
          campaignId: accountabilityCampaignId,
          contentType: proofFile.contentType,
          description: accountabilityDescription.trim(),
          fileName: proofFile.name,
          photoUrl: `${API_BASE_URL}/uploads/private?key=${encodeURIComponent(confirmedUpload.key)}`,
        },
        authToken,
      );

      setAccountabilityDescription('');
      setProofFile(null);
      showSuccess('Prestação salva', 'O comprovante foi registrado com sucesso.');
      router.push(routes.institutionDashboard);
    } catch (error) {
      showError(
        'Não foi possível salvar',
        error instanceof Error ? error.message : 'Tente novamente em instantes.',
      );
    } finally {
      setSavingProof(false);
    }
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        {toast ? (
          <View
            style={[
              styles.toast,
              {
                backgroundColor:
                  toast.type === 'error'
                    ? colors.secondarySoft
                    : toast.type === 'success'
                      ? colors.primarySoft
                      : colors.infoSoft,
                borderColor:
                  toast.type === 'error'
                    ? colors.danger
                    : toast.type === 'success'
                      ? colors.primary
                      : colors.info,
              },
            ]}>
            <Ionicons
              name={
                toast.type === 'error'
                  ? 'alert-circle-outline'
                  : toast.type === 'success'
                    ? 'checkmark-circle-outline'
                    : 'information-circle-outline'
              }
              size={22}
              color={
                toast.type === 'error'
                  ? colors.danger
                  : toast.type === 'success'
                    ? colors.primary
                    : colors.info
              }
            />
            <View style={styles.toastText}>
              <ThemedText
                variant="body"
                color={
                  toast.type === 'error'
                    ? colors.danger
                    : toast.type === 'success'
                      ? colors.primary
                      : colors.info
                }
                style={styles.toastTitle}>
                {toast.title}
              </ThemedText>
              <ThemedText variant="caption" color={colors.text}>
                {toast.message}
              </ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar aviso"
              onPress={() => setToast(null)}
              style={styles.toastClose}>
              <Ionicons name="close" size={18} color={colors.icon} />
            </Pressable>
          </View>
        ) : null}

        <View style={styles.header}>
          <ThemedText variant="caption" color={colors.primary}>Bem-vindo(a), equipe!</ThemedText>
          <ThemedText variant="title">Criar</ThemedText>
          <ThemedText variant="caption" color={colors.textMuted}>
            Publique novidades, campanhas e prestações de contas.
          </ThemedText>
        </View>

        <View style={styles.actionGrid}>
          {[
            ['campaign', 'Campanha', 'flag-outline'],
            ['post', 'Postagem', 'create-outline'],
            ['accountability', 'Prestação', 'document-text-outline'],
          ].map(([key, label, icon]) => {
            const active = mode === key;

            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                onPress={() => setMode(key as CreateMode)}
                style={[
                  styles.actionCard,
                  {
                    backgroundColor: active ? colors.primarySoft : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}>
                <Ionicons
                  name={icon as keyof typeof Ionicons.glyphMap}
                  size={28}
                  color={active ? colors.primary : colors.icon}
                />
                <ThemedText variant="caption" color={active ? colors.primary : colors.text}>
                  {label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        {mode === 'campaign' ? (
          <Card variant="elevated" style={styles.formCard}>
            {!stripeReady ? (
              <View style={[styles.blockingNotice, { backgroundColor: colors.accentSoft, borderColor: colors.warning }]}>
                <Ionicons name="alert-circle-outline" size={22} color={colors.warning} />
                <View style={styles.noticeText}>
                  <ThemedText variant="body" color={colors.warning} style={styles.toastTitle}>
                    Stripe Connect obrigatório
                  </ThemedText>
                  <ThemedText variant="caption" color={colors.text}>
                    {stripeStatusLoading
                      ? 'Verificando a configuração de recebimento da instituição...'
                      : 'Valide a conta Stripe no perfil da instituição antes de criar campanhas.'}
                  </ThemedText>
                </View>
                <Pressable accessibilityRole="button" onPress={() => router.push(routes.institutionProfile)}>
                  <ThemedText variant="caption" color={colors.primary} style={styles.toastTitle}>
                    Abrir perfil
                  </ThemedText>
                </Pressable>
              </View>
            ) : null}

            <View style={styles.stepper}>
              {['Dados', 'Meta', canPublishCampaign ? 'Publicar' : 'Enviar'].map((label, index) => {
                const active = campaignStep === index;
                const done = campaignStep > index;

                return (
                <View key={label} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepDot,
                      {
                        backgroundColor: active || done ? colors.primary : colors.surfaceMuted,
                      },
                    ]}>
                    {done ? (
                      <Ionicons name="checkmark" size={16} color={colors.surface} />
                    ) : (
                      <ThemedText variant="caption" color={active ? colors.surface : colors.textMuted}>
                        {index + 1}
                      </ThemedText>
                    )}
                  </View>
                  <ThemedText variant="caption" color={active ? colors.primary : colors.textMuted}>
                    {label}
                  </ThemedText>
                </View>
                );
              })}
            </View>

            {campaignStep === 0 ? (
              <>
                <Pressable
                  accessibilityRole="button"
                  onPress={handlePickCover}
                  style={[styles.uploadBox, { borderColor: colors.border }]}>
                  {cover ? (
                    <Image source={{ uri: cover.uri }} contentFit="cover" style={styles.uploadPreview} />
                  ) : (
                    <>
                      <Ionicons name="image-outline" size={28} color={colors.icon} />
                      <ThemedText variant="body">Adicionar imagem de capa</ThemedText>
                      <ThemedText variant="caption" color={colors.textMuted}>JPG ou PNG até 5MB</ThemedText>
                    </>
                  )}
                  {cover ? (
                    <View style={[styles.uploadOverlay, { backgroundColor: colors.primary }]}>
                      <Ionicons name="camera-outline" size={16} color={colors.surface} />
                      <ThemedText variant="caption" color={colors.surface}>Trocar imagem</ThemedText>
                    </View>
                  ) : null}
                </Pressable>

                <Input label="Título da campanha" value={title} onChangeText={setTitle} />
                <Input
                  label="Descrição"
                  multiline
                  numberOfLines={4}
                  onChangeText={setDescription}
                  placeholder="Conte a história da campanha..."
                  style={styles.textArea}
                  value={description}
                />

                <View style={styles.tagsRow}>
                  {CAMPAIGN_TAGS.map((label) => (
                    <Pressable
                      key={label}
                      accessibilityRole="button"
                      onPress={() => toggleTag(label)}
                      style={styles.tagButton}>
                      <Tag
                        label={label}
                        variant={selectedTags.includes(label) ? 'success' : 'neutral'}
                      />
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}

            {campaignStep === 1 ? (
              <>
                <Input
                  keyboardType="numeric"
                  label="Meta (R$)"
                  onChangeText={setGoal}
                  value={goal}
                />
                <DatePicker
                  label="Prazo"
                  minDate={new Date()}
                  onChange={setEndAt}
                  placeholder="30/09/2026"
                  value={endAt}
                />
              </>
            ) : null}

            {campaignStep === 2 ? (
              <View style={styles.reviewBox}>
                {cover ? (
                  <Image source={{ uri: cover.uri }} contentFit="cover" style={styles.reviewImage} />
                ) : null}
                <ThemedText variant="subtitle">{title}</ThemedText>
                <ThemedText variant="body" color={colors.textMuted}>
                  {description || 'Sem descrição informada.'}
                </ThemedText>
                <View style={styles.reviewRows}>
                  <View style={styles.reviewRow}>
                    <ThemedText variant="caption" color={colors.textMuted}>Meta</ThemedText>
                    <ThemedText variant="body">R$ {goal}</ThemedText>
                  </View>
                  <View style={styles.reviewRow}>
                    <ThemedText variant="caption" color={colors.textMuted}>Prazo</ThemedText>
                    <ThemedText variant="body">
                      {endAt ? new Intl.DateTimeFormat('pt-BR').format(endAt) : 'Sem prazo'}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.tagsRow}>
                  {selectedTags.map((label) => (
                    <Tag key={label} label={label} variant="success" />
                  ))}
                </View>
                <View
                  style={[
                    styles.reviewNotice,
                    { backgroundColor: canPublishCampaign ? colors.primarySoft : colors.accentSoft },
                  ]}>
                  <Ionicons
                    name={canPublishCampaign ? 'checkmark-circle-outline' : 'time-outline'}
                    size={20}
                    color={canPublishCampaign ? colors.primary : colors.warning}
                  />
                  <ThemedText
                    variant="caption"
                    color={canPublishCampaign ? colors.primary : colors.warning}>
                    {staffRoleLoading
                      ? 'Carregando suas permissões na instituição...'
                      : canPublishCampaign
                      ? 'Você pode publicar esta campanha agora.'
                      : 'Funcionários enviam campanhas para revisão de um administrador.'}
                  </ThemedText>
                </View>
              </View>
            ) : null}

            <View style={styles.footerActions}>
              {campaignStep > 0 ? (
                <View style={styles.footerActionItem}>
                  <Button fullWidth variant="ghost" onPress={handlePreviousStep}>
                    Voltar
                  </Button>
                </View>
              ) : null}
              <View style={styles.footerActionItem}>
                <Button
                  fullWidth
                  loading={saving}
                  disabled={stripeStatusLoading || !stripeReady || (campaignStep === 2 && staffRoleLoading)}
                  onPress={campaignStep === 2 ? handleCreateCampaign : handleNextStep}>
                  {campaignStep === 2
                    ? canPublishCampaign
                      ? 'Publicar'
                      : 'Enviar'
                    : 'Continuar'}
                </Button>
              </View>
            </View>
          </Card>
        ) : null}

        {mode === 'post' ? (
          <Card variant="elevated" style={styles.formCard}>
            <Input
              label="Postagem"
              multiline
              numberOfLines={5}
              onChangeText={setPostContent}
              placeholder="Compartilhe uma novidade da instituição..."
              style={styles.textArea}
              value={postContent}
            />
            <View style={styles.tagsRow}>
              {[
                ['PUBLIC', 'Público'],
                ['FOLLOWERS_ONLY', 'Seguidores'],
              ].map(([value, label]) => (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  onPress={() => setPostVisibility(value as PostVisibility)}
                  style={styles.tagButton}>
                  <Tag
                    label={label}
                    variant={postVisibility === value ? 'success' : 'neutral'}
                  />
                </Pressable>
              ))}
            </View>
            <Button fullWidth loading={publishingPost} onPress={handleCreatePost}>
              Publicar
            </Button>
          </Card>
        ) : null}

        {mode === 'accountability' ? (
          <Card variant="elevated" style={styles.formCard}>
            <Pressable
              accessibilityRole="button"
              onPress={handlePickProofFile}
              style={[styles.uploadBox, { borderColor: colors.border }]}>
              <Ionicons
                name={proofFile ? 'checkmark-circle-outline' : 'document-attach-outline'}
                size={28}
                color={proofFile ? colors.primary : colors.icon}
              />
              <ThemedText variant="body">
                {proofFile ? proofFile.name : 'Enviar comprovante'}
              </ThemedText>
              <ThemedText variant="caption" color={colors.textMuted}>
                {proofFile
                  ? proofFile.contentType
                  : 'Notas fiscais, fotos e relatórios em PDF, JPG ou PNG.'}
              </ThemedText>
            </Pressable>

            <View style={styles.tagsRow}>
              {accountabilityCampaigns.map((campaign) => (
                <Pressable
                  key={campaign.id}
                  accessibilityRole="button"
                  onPress={() => setAccountabilityCampaignId(campaign.id)}
                  style={styles.tagButton}>
                  <Tag
                    label={campaign.title}
                    variant={accountabilityCampaignId === campaign.id ? 'success' : 'neutral'}
                  />
                </Pressable>
              ))}
            </View>

            {accountabilityCampaigns.length === 0 ? (
              <ThemedText variant="caption" color={colors.textMuted}>
                Nenhuma campanha da instituição encontrada para vincular a prestação.
              </ThemedText>
            ) : null}

            <Input
              label="Descrição"
              multiline
              numberOfLines={3}
              onChangeText={setAccountabilityDescription}
              placeholder="Explique o uso dos recursos..."
              style={styles.textArea}
              value={accountabilityDescription}
            />
            <Button fullWidth loading={savingProof} onPress={handleCreateDeliveryProof}>
              Salvar prestação
            </Button>
          </Card>
        ) : null}
      </View>
    </ScreenContainer>
  );
}
