import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Avatar, Card, Divider, ProgressBar, ScreenContainer, Tag, ThemedText } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppStore } from '@/store';
import { theme } from '@/theme';

import { styles } from './styles';

const recentDonations = [
  { id: '1', campaign: 'Campanha do Agasalho', institution: 'Instituto Esperança', amount: 'R$ 50,00', date: '10 mai 2026', status: 'Entregue', progress: 100 },
  { id: '2', campaign: 'Alimentação Solidária', institution: 'Casa do Pão', amount: 'R$ 30,00', date: '02 mai 2026', status: 'Em andamento', progress: 60 },
];

const featuredCampaigns = [
  { id: '1', title: 'Material Escolar 2026', institution: 'Educação Viva', goal: 'R$ 5.000', raised: 'R$ 3.200', progress: 64 },
  { id: '2', title: 'Cestas de Inverno', institution: 'Lar Aconchego', goal: 'R$ 8.000', raised: 'R$ 5.600', progress: 70 },
];

export function DashboardScreen() {
  const user = useAppStore((state) => state.user);
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  const firstName = user?.name?.split(' ')[0] ?? 'Visitante';

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>

        {/* Header de saudação */}
        <View style={styles.greeting}>
          <View style={styles.greetingRow}>
            <View style={styles.greetingText}>
              <ThemedText variant="caption" color={colors.textMuted}>
                Bem-vindo de volta 👋
              </ThemedText>
              <ThemedText variant="title">{firstName}</ThemedText>
            </View>
            <Avatar name={user?.name} size="md" />
          </View>
        </View>

        {/* Banner destaque */}
        <Card style={[styles.banner, { backgroundColor: colors.primary }]} padding="lg">
          <View style={styles.bannerContent}>
            <Tag label="Em destaque" variant="neutral" />
            <ThemedText variant="subtitle" color={colors.surface}>
              Campanha do Mês
            </ThemedText>
            <ThemedText variant="body" color={colors.primarySoft}>
              Material Escolar 2026 — ajude crianças a voltarem às aulas com dignidade.
            </ThemedText>
            <View style={styles.bannerProgress}>
              <ProgressBar
                value={64}
                trackColor="rgba(255,255,255,0.25)"
                fillColor="rgba(255,255,255,0.9)"
              />
              <ThemedText variant="caption" color={colors.primarySoft}>
                64% da meta atingida
              </ThemedText>
            </View>
          </View>
        </Card>

        {/* Minhas doações recentes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText variant="subtitle">Minhas doações</ThemedText>
            <Pressable>
              <ThemedText variant="caption" color={colors.primary}>
                Ver todas
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.list}>
            {recentDonations.map((item, index) => (
              <View key={item.id}>
                <View style={styles.donationItem}>
                  <View style={styles.donationIcon}>
                    <Ionicons name="heart" size={18} color={colors.secondary} />
                  </View>
                  <View style={styles.donationInfo}>
                    <ThemedText variant="body" style={styles.bold}>
                      {item.campaign}
                    </ThemedText>
                    <ThemedText variant="caption" color={colors.textMuted}>
                      {item.institution}
                    </ThemedText>
                    <View style={styles.donationMeta}>
                      <ThemedText variant="caption" color={colors.primary}>
                        {item.amount}
                      </ThemedText>
                      <ThemedText variant="caption" color={colors.textMuted}>
                        · {item.date}
                      </ThemedText>
                    </View>
                  </View>
                  <Tag
                    label={item.status}
                    variant={item.status === 'Entregue' ? 'success' : 'warning'}
                  />
                </View>
                {index < recentDonations.length - 1 && <Divider />}
              </View>
            ))}
          </View>
        </View>

        {/* Campanhas em destaque */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText variant="subtitle">Campanhas para você</ThemedText>
            <Pressable>
              <ThemedText variant="caption" color={colors.primary}>
                Explorar
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.list}>
            {featuredCampaigns.map((item) => (
              <Card key={item.id} variant="outlined">
                <View style={styles.campaignCard}>
                  <View style={styles.campaignHeader}>
                    <View style={styles.campaignInfo}>
                      <ThemedText variant="body" style={styles.bold}>
                        {item.title}
                      </ThemedText>
                      <ThemedText variant="caption" color={colors.textMuted}>
                        {item.institution}
                      </ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </View>
                  <ProgressBar value={item.progress} />
                  <View style={styles.campaignMeta}>
                    <ThemedText variant="caption" color={colors.primary}>
                      {item.raised}
                    </ThemedText>
                    <ThemedText variant="caption" color={colors.textMuted}>
                      de {item.goal}
                    </ThemedText>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </View>

      </View>
    </ScreenContainer>
  );
}

