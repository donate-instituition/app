import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  Button,
  Card,
  EmptyState,
  Input,
  Loading,
  ScreenContainer,
  Tag,
  ThemedText,
} from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFetch } from '@/hooks/use-fetch';
import { routes } from '@/navigation/routes';
import {
  campaignsService,
  type PendingInstitution,
} from '@/services/campaigns';
import { useAppStore } from '@/store';
import { theme } from '@/theme';

import { styles } from './styles';

type InstitutionStatus = 'all' | 'approved' | 'pending' | 'rejected';

export function AdminInstitutionsScreen() {
  const router = useRouter();
  const authToken = useAppStore((state) => state.authToken);
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<InstitutionStatus>('all');

  const fetcher = useCallback(async (): Promise<PendingInstitution[]> => {
    return campaignsService.listAdminInstitutions(authToken);
  }, [authToken]);

  const { data, loading, error, refetch } = useFetch(fetcher);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch])
  );

  const institutions = data ?? [];
  const filteredInstitutions = institutions
    .filter((institution) => {
      const matchesStatus =
        status === 'all' ||
        (status === 'approved' && institution.status === 'ACTIVE') ||
        (status === 'pending' && institution.status === 'PENDING_APPROVAL') ||
        (status === 'rejected' && institution.status === 'REJECTED');

      const matchesSearch =
        !search.trim() ||
        institution.name.toLowerCase().includes(search.toLowerCase()) ||
        institution.cnpj.includes(search);

      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      // Pending first
      if (a.status === 'PENDING_APPROVAL' && b.status !== 'PENDING_APPROVAL')
        return -1;
      if (a.status !== 'PENDING_APPROVAL' && b.status === 'PENDING_APPROVAL')
        return 1;
      return 0;
    });

  const pendingCount = institutions.filter(
    (i) => i.status === 'PENDING_APPROVAL'
  ).length;

  async function handleApprove(id: string) {
    await campaignsService.approveInstitution(id, authToken);
    void refetch();
  }

  async function handleReject(id: string) {
    await campaignsService.rejectInstitution(id, authToken);
    void refetch();
  }

  function getStatusTag(status: string) {
    if (status === 'ACTIVE') {
      return <Tag label="Aprovada" variant="success" />;
    }
    if (status === 'PENDING_APPROVAL') {
      return <Tag label="Em análise" variant="warning" />;
    }
    if (status === 'REJECTED') {
      return <Tag label="Rejeitada" variant="danger" />;
    }
    return null;
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <ThemedText variant="title">Instituições</ThemedText>
            {pendingCount > 0 && (
              <Tag label={`${pendingCount} Pendente`} variant="warning" />
            )}
          </View>
          <ThemedText variant="caption" color={colors.textMuted}>
            Cadastros, validações e status das instituições.
          </ThemedText>
        </View>

        {/* Search and Filter */}
        <View style={styles.controls}>
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <Ionicons
                name="search-outline"
                size={20}
                color={colors.textMuted}
              />
              <Input
                placeholder="Buscar instituição"
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
            </View>
            <Pressable
              style={[
                styles.filterButton,
                { backgroundColor: colors.surface },
              ]}>
              <Ionicons name="options-outline" size={20} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.tabs}>
            <Pressable
              style={[
                styles.tab,
                status === 'all' && styles.tabActive,
                status === 'all' && { borderBottomColor: colors.primary },
              ]}
              onPress={() => setStatus('all')}>
              <ThemedText
                variant="body"
                color={status === 'all' ? colors.primary : colors.textMuted}>
                Todas
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.tab,
                status === 'approved' && styles.tabActive,
                status === 'approved' && { borderBottomColor: colors.primary },
              ]}
              onPress={() => setStatus('approved')}>
              <ThemedText
                variant="body"
                color={
                  status === 'approved' ? colors.primary : colors.textMuted
                }>
                Aprovadas
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.tab,
                status === 'pending' && styles.tabActive,
                status === 'pending' && { borderBottomColor: colors.primary },
              ]}
              onPress={() => setStatus('pending')}>
              <ThemedText
                variant="body"
                color={status === 'pending' ? colors.primary : colors.textMuted}>
                Em análise
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.tab,
                status === 'rejected' && styles.tabActive,
                status === 'rejected' && { borderBottomColor: colors.primary },
              ]}
              onPress={() => setStatus('rejected')}>
              <ThemedText
                variant="body"
                color={
                  status === 'rejected' ? colors.primary : colors.textMuted
                }>
                Rejeitadas
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {loading && <Loading label="Carregando instituições..." />}

        {error && (
          <EmptyState
            title="Não foi possível carregar"
            description={error}
            illustration={
              <Ionicons
                name="cloud-offline-outline"
                size={56}
                color={colors.border}
              />
            }
            action={
              <Button variant="secondary" onPress={refetch}>
                Tentar novamente
              </Button>
            }
          />
        )}

        {!loading && !error && filteredInstitutions.length === 0 && (
          <EmptyState
            title="Nenhuma instituição encontrada"
            description="Ajuste os filtros ou tente outra busca."
            illustration={
              <Ionicons name="business-outline" size={56} color={colors.border} />
            }
          />
        )}

        {!loading && !error && filteredInstitutions.length > 0 && (
          <View style={styles.list}>
            {filteredInstitutions.map((institution) => (
              <Card key={institution.id} variant="outlined">
                <Pressable
                  onPress={() =>
                    router.push(routes.appInstitutionDetail(institution.id))
                  }>
                  <View style={styles.institutionCard}>
                    <View style={styles.institutionIcon}>
                      <Ionicons
                        name="business-outline"
                        size={24}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.institutionContent}>
                      <View style={styles.institutionHeader}>
                        <ThemedText
                          variant="body"
                          style={styles.bold}
                          numberOfLines={1}>
                          {institution.name}
                        </ThemedText>
                        {getStatusTag(institution.status)}
                      </View>
                      <View style={styles.institutionInfo}>
                        <Ionicons
                          name="document-text-outline"
                          size={14}
                          color={colors.textMuted}
                        />
                        <ThemedText variant="caption" color={colors.textMuted}>
                          CNPJ {institution.cnpj}
                        </ThemedText>
                      </View>
                      <View style={styles.institutionInfo}>
                        <Ionicons
                          name="location-outline"
                          size={14}
                          color={colors.textMuted}
                        />
                        <ThemedText variant="caption" color={colors.textMuted}>
                          {institution.city}, {institution.state}
                        </ThemedText>
                      </View>

                      {institution.status === 'PENDING_APPROVAL' && (
                        <View style={styles.institutionActions}>
                          <Button
                            size="sm"
                            variant="secondary"
                            onPress={() => handleReject(institution.id)}>
                            Rejeitar
                          </Button>
                          <Button
                            size="sm"
                            onPress={() => handleApprove(institution.id)}>
                            Aprovar
                          </Button>
                        </View>
                      )}
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.textMuted}
                    />
                  </View>
                </Pressable>
              </Card>
            ))}
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
