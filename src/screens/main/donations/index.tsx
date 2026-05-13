import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { Card, Divider, ScreenContainer, Tag, ThemedText } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { theme } from '@/theme';

import { styles } from './styles';

const donationHistory = [
  { id: '1', campaign: 'Campanha do Agasalho', institution: 'Instituto Esperança', amount: 'R$ 50,00', date: '10 mai 2026', status: 'Entregue' },
  { id: '2', campaign: 'Alimentação Solidária', institution: 'Casa do Pão', amount: 'R$ 30,00', date: '02 mai 2026', status: 'Em andamento' },
  { id: '3', campaign: 'Material Escolar 2026', institution: 'Educação Viva', amount: 'R$ 80,00', date: '15 abr 2026', status: 'Entregue' },
  { id: '4', campaign: 'Cestas de Inverno', institution: 'Lar Aconchego', amount: 'R$ 45,00', date: '01 abr 2026', status: 'Cancelada' },
];

function getStatusVariant(status: string) {
  if (status === 'Entregue') return 'success' as const;
  if (status === 'Em andamento') return 'warning' as const;
  if (status === 'Cancelada') return 'danger' as const;
  return 'neutral' as const;
}

export function DonationsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>

        {/* Métricas resumidas */}
        <View style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <Ionicons name="heart" size={24} color={colors.secondary} />
            <ThemedText variant="title">R$ 205</ThemedText>
            <ThemedText variant="caption" color={colors.textMuted}>
              Total doado
            </ThemedText>
          </Card>
          <Card style={styles.metricCard}>
            <Ionicons name="megaphone" size={24} color={colors.primary} />
            <ThemedText variant="title">4</ThemedText>
            <ThemedText variant="caption" color={colors.textMuted}>
              Campanhas apoiadas
            </ThemedText>
          </Card>
        </View>

        {/* Histórico */}
        <View style={styles.section}>
          <ThemedText variant="subtitle">Histórico</ThemedText>
          <Card>
            {donationHistory.map((item, index) => (
              <View key={item.id}>
                <View style={styles.donationItem}>
                  <View style={styles.donationInfo}>
                    <ThemedText variant="body" style={styles.bold}>
                      {item.campaign}
                    </ThemedText>
                    <ThemedText variant="caption" color={colors.textMuted}>
                      {item.institution}
                    </ThemedText>
                    <ThemedText variant="caption" color={colors.textMuted}>
                      {item.date}
                    </ThemedText>
                  </View>
                  <View style={styles.donationRight}>
                    <ThemedText variant="body" color={colors.primary} style={styles.bold}>
                      {item.amount}
                    </ThemedText>
                    <Tag label={item.status} variant={getStatusVariant(item.status)} />
                  </View>
                </View>
                {index < donationHistory.length - 1 && <Divider />}
              </View>
            ))}
          </Card>
        </View>

      </View>
    </ScreenContainer>
  );
}

