import { View } from 'react-native';

import {
  Button,
  Card,
  Carousel,
  ProgressBar,
  ScreenContainer,
  Tag,
  ThemedText,
} from '@/components';
import { roleLabels } from '@/navigation/session';
import { useAppStore } from '@/store';

import { styles } from './styles';

export function DashboardScreen() {
  const user = useAppStore((state) => state.user);
  const highlights = [
    {
      title: 'Campanha do Agasalho',
      description: '64% da meta arrecadada',
      progress: 64,
    },
    {
      title: 'Alimentos para familias',
      description: 'Entrega prevista para sexta-feira',
      progress: 82,
    },
    {
      title: 'Instituicao em destaque',
      description: 'Perfil verificado e ativo',
      progress: 100,
    },
  ];

  return (
    <ScreenContainer scrollable>
      <View style={styles.section}>
        <View style={styles.header}>
          <Tag label={user ? roleLabels[user.role] : 'Visitante'} variant="success" />
          <ThemedText variant="title">Ola, {user?.name}</ThemedText>
          <ThemedText variant="body">
            Esta e a entrada mockada da area logada. O conteudo muda conforme o perfil escolhido no
            login.
          </ThemedText>
        </View>

        <View style={styles.grid}>
          <Card style={styles.metric}>
            <ThemedText variant="caption">Campanhas</ThemedText>
            <ThemedText variant="subtitle">{user?.role === 'platform-admin' ? '25' : '4'}</ThemedText>
          </Card>
          <Card style={styles.metric}>
            <ThemedText variant="caption">Doacoes</ThemedText>
            <ThemedText variant="subtitle">{user?.role === 'donor' ? '14' : '120'}</ThemedText>
          </Card>
          <Card style={styles.metric}>
            <ThemedText variant="caption">Valor movimentado</ThemedText>
            <ThemedText variant="subtitle">R$ 12.500</ThemedText>
          </Card>
          <Card style={styles.metric}>
            <ThemedText variant="caption">Entrega</ThemedText>
            <ThemedText variant="subtitle">98%</ThemedText>
          </Card>
        </View>

        <Card>
          <View style={styles.section}>
            <ThemedText variant="subtitle">Meta em destaque</ThemedText>
            <ProgressBar value={64} />
            <ThemedText variant="body">
              A navegacao principal ja esta preparada para receber os fluxos centrais do usuario.
            </ThemedText>
          </View>
        </Card>

        <View style={styles.section}>
          <ThemedText variant="subtitle">Vitrine de botoes</ThemedText>
          <View style={styles.actions}>
            <Button>Primario</Button>
            <Button variant="secondary">Secundario</Button>
            <Button variant="ghost">Fantasma</Button>
            <Button variant="danger">Perigo</Button>
            <Button loading>Carregando</Button>
            <Button disabled>Desabilitado</Button>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText variant="subtitle">Carousel</ThemedText>
          <Carousel
            data={highlights}
            renderItem={({ item }) => (
              <Card variant="filled" style={styles.carouselCard}>
                <View style={styles.section}>
                  <Tag label="Destaque" variant="info" />
                  <ThemedText variant="subtitle">{item.title}</ThemedText>
                  <ThemedText variant="body">{item.description}</ThemedText>
                  <ProgressBar value={item.progress} />
                </View>
              </Card>
            )}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
