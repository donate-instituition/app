import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Card, EmptyState, Input, ProgressBar, Tag, ScreenContainer, ThemedText } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { theme } from '@/theme';

import { styles } from './styles';

const CATEGORIES = ['Todos', 'Educação', 'Alimentação', 'Saúde', 'Moradia', 'Meio Ambiente'];

const allCampaigns = [
  { id: '1', title: 'Material Escolar 2026', institution: 'Educação Viva', category: 'Educação', goal: 'R$ 5.000', raised: 'R$ 3.200', progress: 64, active: true },
  { id: '2', title: 'Cestas de Inverno', institution: 'Lar Aconchego', category: 'Alimentação', goal: 'R$ 8.000', raised: 'R$ 5.600', progress: 70, active: true },
  { id: '3', title: 'Mutirão de Saúde Comunitária', institution: 'Saúde Para Todos', category: 'Saúde', goal: 'R$ 3.000', raised: 'R$ 900', progress: 30, active: true },
  { id: '4', title: 'Reflorestamento Urbano', institution: 'Verde Futuro', category: 'Meio Ambiente', goal: 'R$ 12.000', raised: 'R$ 7.200', progress: 60, active: true },
  { id: '5', title: 'Reforma do Abrigo', institution: 'Casa Esperança', category: 'Moradia', goal: 'R$ 20.000', raised: 'R$ 4.000', progress: 20, active: true },
];

export function CampaignsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');

  const filtered = allCampaigns.filter((c) => {
    const matchesCategory = activeCategory === 'Todos' || c.category === activeCategory;
    const matchesSearch =
      search.trim() === '' ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.institution.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        {/* Busca */}
        <Input
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar campanhas ou instituições..."
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          leftSlot={
            <View style={styles.searchIcon}>
              <Ionicons name="search-outline" size={18} color={colors.icon} />
            </View>
          }
        />

        {/* Filtros de categoria */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}>
          {CATEGORIES.map((cat) => (
            <Pressable key={cat} onPress={() => setActiveCategory(cat)}>
              <Tag
                label={cat}
                variant={activeCategory === cat ? 'success' : 'neutral'}
              />
            </Pressable>
          ))}
        </ScrollView>

        {/* Resultados */}
        <View style={styles.results}>
          <ThemedText variant="caption" color={colors.textMuted}>
            {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
          </ThemedText>

          {filtered.length === 0 ? (
            <EmptyState
              title="Nenhuma campanha encontrada"
              description="Tente outros termos ou remova o filtro de categoria."
              illustration={
                <Ionicons name="search-circle-outline" size={56} color={colors.border} />
              }
            />
          ) : (
            <View style={styles.list}>
              {filtered.map((item) => (
                <Pressable key={item.id}>
                  <Card variant="outlined">
                    <View style={styles.campaignCard}>
                      <View style={styles.campaignHeader}>
                        <View style={styles.campaignMeta}>
                          <Tag label={item.category} variant="info" />
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                      </View>
                      <ThemedText variant="subtitle">{item.title}</ThemedText>
                      <ThemedText variant="caption" color={colors.textMuted}>
                        {item.institution}
                      </ThemedText>
                      <ProgressBar value={item.progress} />
                      <View style={styles.goalRow}>
                        <ThemedText variant="caption" color={colors.primary}>
                          {item.raised}
                        </ThemedText>
                        <ThemedText variant="caption" color={colors.textMuted}>
                          de {item.goal} · {item.progress}%
                        </ThemedText>
                      </View>
                    </View>
                  </Card>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}

