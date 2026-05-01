import { useState } from 'react';
import { View } from 'react-native';

import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Input,
  RadioGroup,
  ScreenContainer,
  Select,
  Tag,
  ThemedText,
} from '@/components';
import { useAppStore } from '@/store';

import { styles } from './styles';

export function CampaignsScreen() {
  const user = useAppStore((state) => state.user);
  const isAdmin = user?.role === 'platform-admin';
  const [acceptsAnonymous, setAcceptsAnonymous] = useState(true);
  const [category, setCategory] = useState('children');
  const [donationType, setDonationType] = useState('money');
  const [startDate, setStartDate] = useState<Date | null>(new Date());

  return (
    <ScreenContainer scrollable>
      <View style={styles.section}>
        <ThemedText variant="title">{isAdmin ? 'Instituicoes' : 'Campanhas'}</ThemedText>
        <ThemedText variant="body">
          {isAdmin
            ? 'Area reservada para aprovacao e acompanhamento de instituicoes.'
            : 'Area central para busca, criacao ou acompanhamento de campanhas.'}
        </ThemedText>

        <Card>
          <View style={styles.section}>
            <Tag label={isAdmin ? 'Pendente' : 'Ativa'} variant={isAdmin ? 'warning' : 'success'} />
            <ThemedText variant="subtitle">
              {isAdmin ? 'Instituto Novo Caminho' : 'Campanha do Agasalho'}
            </ThemedText>
            <ThemedText variant="body">
              Placeholder do fluxo principal. A implementacao detalhada vem nas proximas HUs.
            </ThemedText>
            <Button variant="secondary">{isAdmin ? 'Ver detalhes' : 'Acessar campanha'}</Button>
          </View>
        </Card>

        <Card variant="outlined">
          <View style={styles.section}>
            <ThemedText variant="subtitle">Formulario mockado</ThemedText>
            <Input label="Titulo" value="Campanha do Agasalho" editable={false} />
            <Input
              label="Descricao"
              value="Arrecadacao de casacos e cobertores"
              editable={false}
              variant="filled"
            />
            <Select
              label="Categoria"
              value={category}
              onValueChange={setCategory}
              options={[
                { label: 'Criancas e adolescentes', value: 'children' },
                { label: 'Saude', value: 'health' },
                { label: 'Alimentos', value: 'food' },
              ]}
            />
            <DatePicker label="Data inicial" value={startDate} onChange={setStartDate} />
            <RadioGroup
              label="Tipo de doacao"
              value={donationType}
              onValueChange={setDonationType}
              options={[
                { label: 'Dinheiro', value: 'money', description: 'PIX, cartao ou boleto' },
                { label: 'Itens', value: 'items', description: 'Roupas, alimentos e outros' },
                { label: 'Ambos', value: 'both' },
              ]}
            />
            <Checkbox
              checked={acceptsAnonymous}
              label="Permitir doacoes anonimas"
              helperText="Exemplo de checkbox reutilizavel"
              onCheckedChange={setAcceptsAnonymous}
            />
          </View>
        </Card>
      </View>
    </ScreenContainer>
  );
}
