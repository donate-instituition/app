# Arquitetura Mobile

EloDoar e uma plataforma mobile de doacoes criada com Expo, React Native, Expo Router, TypeScript e Zustand.

Este documento define a arquitetura base para que novas funcionalidades sejam criadas com um padrao claro de pastas, tema, navegacao, consumo de API e gerenciamento de estado.

## Principios

- Rotas devem ser finas e ficar em `src/app`.
- Telas devem concentrar a composicao de interface em `src/screens`.
- Componentes compartilhados devem ficar em `src/components`, cada um em sua propria pasta.
- Estilos de componentes e telas devem ficar separados em `styles.ts` quando o arquivo crescer ou quando houver reutilizacao.
- Cores, fontes, espacamentos, raios e sombras devem vir de `src/theme`.
- Toda chamada HTTP deve passar por `src/services/api`.
- Estado global deve usar Zustand e ficar em `src/store`.
- Estado local de tela deve continuar local, sem ir para o store global sem necessidade.

## Estrutura

```text
src/
  app/                 Rotas do Expo Router e layouts de navegacao
  components/          Componentes compartilhados
  forms/               Mascaras, validacoes e hook de formularios
  hooks/               Hooks reutilizaveis
  navigation/          Configuracoes de navegacao
  screens/             Telas organizadas por funcionalidade
  services/
    api/               Cliente HTTP e erros padronizados
  store/               Estado global com Zustand
  theme/               Tokens visuais da aplicacao
docs/                  Documentacao tecnica do projeto
assets/                Imagens e assets estaticos
```

O design system inicial esta detalhado em `docs/DESIGN_SYSTEM.md`.
Os componentes reutilizaveis estao documentados em `docs/COMPONENTS.md`.
A navegacao base esta documentada em `docs/NAVIGATION.md`.
Os estados visuais de tela estao documentados em `docs/SCREEN_STATES.md`.
O padrao de formularios e validacoes esta documentado em `docs/FORMS.md`.

## Expo Router

O projeto usa Expo Router com as rotas em `src/app`.

O `package.json` mantem o entry runtime padrao:

```json
{
  "main": "expo-router/entry"
}
```

A raiz de rotas fica explicita no `app.json`:

```json
{
  "expo": {
    "extra": {
      "router": {
        "root": "src/app"
      }
    }
  }
}
```

Arquivos em `src/app` devem conectar navegacao, layout e parametros. A tela em si deve ficar em `src/screens`.

Exemplo:

```text
src/app/campaigns/[id].tsx
src/screens/campaign-details/campaign-details-screen.tsx
src/screens/campaign-details/index.ts
```

## Telas

Telas ficam em `src/screens/<feature>`.

Padrao recomendado:

```text
src/screens/
  campaign-details/
    components/
    campaign-details-screen.tsx
    styles.ts
    index.ts
```

- `campaign-details-screen.tsx`: componente principal da tela.
- `styles.ts`: estilos da tela quando houver volume suficiente.
- `components/`: componentes privados daquela tela.
- `index.ts`: exportacao publica da tela.

Rotas devem importar telas pelo barrel da feature:

```ts
import { CampaignDetailsScreen } from '@/screens/campaign-details';
```

## Componentes

Componentes compartilhados ficam em `src/components`.

Cada componente deve ter sua propria pasta:

```text
src/components/
  button/
    components/
    index.tsx
    styles.ts
```

- `index.tsx`: componente, props e composicao.
- `styles.ts`: `StyleSheet` e estilos derivados do tema.
- `components/`: subcomponentes privados usados apenas por aquele componente.

O arquivo `src/components/index.ts` deve exportar os componentes compartilhados:

```ts
export * from './button';
export * from './themed-text';
export * from './themed-view';
```

Importe componentes compartilhados assim:

```ts
import { ThemedText, ThemedView } from '@/components';
```

## Tema

O tema fica em `src/theme` e centraliza os tokens visuais:

```text
src/theme/
  colors.ts       Paleta e cores semanticas
  typography.ts   Familias, pesos, tamanhos e alturas de linha
  spacing.ts      Espacamentos e sombras
  borders.ts      Raios e espessuras de borda
  index.ts        Exportacao publica do tema
```

A paleta foi pensada para uma plataforma de doacao:

- Verde como cor primaria, associado a cuidado, confianca e impacto.
- Coral como cor secundaria, para chamadas de acao e momentos emocionais.
- Amarelo como acento, para destaques, metas e progresso.
- Neutros esverdeados, para manter leitura confortavel e visual calmo.

Use tokens do tema em vez de valores soltos:

```ts
import { theme } from '@/theme';

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
  },
});
```

## Navegacao

Configuracoes compartilhadas de navegacao ficam em `src/navigation`.

Hoje o projeto possui `src/navigation/theme.ts`, que adapta as cores do tema para o `ThemeProvider` do React Navigation usado pelo Expo Router.

O layout raiz fica em `src/app/_layout.tsx` e deve ser o lugar para providers globais de navegacao e tema.

## Consumo De API

O padrao inicial de API fica em `src/services/api`.

```text
src/services/api/
  api-client.ts   Cliente HTTP baseado em fetch
  config.ts       URL base e timeout
  errors.ts       ApiError
  index.ts        Exportacao publica
```

Use o cliente `api` para todas as chamadas HTTP:

```ts
import { api } from '@/services/api';

type Campaign = {
  id: string;
  title: string;
};

const campaigns = await api.get<Campaign[]>('/campaigns');
```

Para envio de dados:

```ts
type CreateDonationBody = {
  campaignId: string;
  amount: number;
};

await api.post<void, CreateDonationBody>('/donations', {
  campaignId: 'campaign-id',
  amount: 50,
});
```

A URL base vem de `EXPO_PUBLIC_API_URL`. Quando a variavel nao estiver definida, o fallback local e `http://localhost:3000`.

Erros de HTTP sao convertidos para `ApiError`, com `status` e `payload`:

```ts
import { ApiError } from '@/services/api';

try {
  await api.get('/campaigns');
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.status, error.payload);
  }
}
```

## Estado Global

O estado global fica em `src/store` e usa Zustand.

O store atual mantem:

- `authToken`: token de autenticacao.
- `selectedCampaignId`: campanha selecionada.
- `setAuthToken`: atualiza o token.
- `selectCampaign`: atualiza a campanha selecionada.
- `reset`: volta ao estado inicial.

Exemplo:

```ts
import { useAppStore } from '@/store';

const authToken = useAppStore((state) => state.authToken);
const setAuthToken = useAppStore((state) => state.setAuthToken);
```

Use Zustand apenas para estado realmente transversal. Exemplos: sessao, usuario logado, preferencias globais e selecoes compartilhadas entre fluxos.

Nao coloque no store global:

- Estado temporario de formulario.
- Loading local de uma tela.
- Valor de input.
- Dados que pertencem apenas a um componente.

## Hooks

Hooks reutilizaveis ficam em `src/hooks`.

O hook atual `use-color-scheme.ts` encapsula o tema claro/escuro do React Native. Novos hooks devem ser criados aqui quando forem reutilizados por mais de uma tela ou componente.

Hooks especificos de uma feature podem ficar perto da feature ate ganharem uso compartilhado.

## Imports

O projeto usa o alias `@/*`, definido no `tsconfig.json`.

Padrao recomendado:

```ts
import { ThemedText } from '@/components';
import { api } from '@/services/api';
import { theme } from '@/theme';
```

Evite imports relativos longos como:

```ts
import { theme } from '../../../theme';
```

## Como Adicionar Uma Nova Funcionalidade

1. Crie a rota em `src/app`.
2. Crie a tela em `src/screens/<feature>`.
3. Crie componentes privados da tela em `src/screens/<feature>/components`.
4. Promova componentes reutilizaveis para `src/components/<component>`.
5. Crie hooks reutilizaveis em `src/hooks`.
6. Crie chamadas HTTP usando `src/services/api`.
7. Use tokens de `src/theme` para estilos.
8. Use Zustand em `src/store` apenas para estado global real.

## Exemplo De Feature

```text
src/app/campaigns/[id].tsx
src/screens/campaign-details/
  components/
    donation-progress/
      index.tsx
      styles.ts
  campaign-details-screen.tsx
  styles.ts
  index.ts
src/services/campaigns/
  campaigns-service.ts
  index.ts
```

Rota:

```ts
import { CampaignDetailsScreen } from '@/screens/campaign-details';

export default CampaignDetailsScreen;
```

## Criterios Da HU

- Organizacao de pastas para telas, componentes, hooks, servicos, navegacao e tema: atendido.
- Padrao para consumo de API: atendido com `src/services/api`.
- Padrao para gerenciamento de estado: atendido com Zustand em `src/store`.
- Estrutura inicial documentada: atendido neste documento.

## Validacao

Antes de entregar alteracoes de arquitetura, rode:

```bash
npm run lint
npx tsc --noEmit
```
