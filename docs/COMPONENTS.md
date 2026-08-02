# Componentes Reutilizaveis

Esta HU cria a primeira base de componentes reutilizaveis do EloDoar. Todos os componentes usam tokens de `src/theme` e aceitam variacoes por propriedades.

## Estrutura

```text
src/components/
  button/
    index.tsx
    styles.ts
  input/
    index.tsx
    styles.ts
  card/
    index.tsx
    styles.ts
```

Use `components/` dentro da pasta do componente apenas para subcomponentes privados.

## Exports

Componentes compartilhados sao exportados em `src/components/index.ts`:

```ts
import { Button, Card, Input } from '@/components';
```

## Button

Botao base para acoes principais, secundarias, fantasmas e destrutivas.

```tsx
<Button onPress={handleDonate}>Doar agora</Button>
<Button variant="secondary">Ver detalhes</Button>
<Button variant="ghost">Cancelar</Button>
<Button disabled>Indisponivel</Button>
<Button loading>Enviando</Button>
```

Props principais:

```text
variant: primary | secondary | ghost | danger
size: sm | md | lg
fullWidth: boolean
loading: boolean
disabled: boolean
```

## Input

Campo de texto com label, ajuda, erro e variacao visual.

```tsx
<Input label="Nome" placeholder="Seu nome" />
<Input label="Valor" helperText="Informe o valor da doacao" keyboardType="numeric" />
<Input label="Email" error="Email invalido" />
<Input variant="filled" />
<Input success successText="Campo preenchido corretamente" />
```

Props principais:

```text
variant: outline | filled
label: string
helperText: string
error: string
```

## Card

Container para agrupar conteudo.

```tsx
<Card>
  <ThemedText>Campanha em destaque</ThemedText>
</Card>

<Card variant="outlined" padding="lg" />
```

Props principais:

```text
variant: elevated | outlined | filled
padding: none | sm | md | lg
```

## Carousel

Carrossel horizontal com dots.

```tsx
<Carousel
  data={campaigns}
  renderItem={({ item }) => <CampaignCard campaign={item} />}
/>
```

## DatePicker

Seletor de data em modal, sem dependencia nativa.

```tsx
<DatePicker label="Data da doacao" value={date} onChange={setDate} />
<DatePicker minDate={new Date()} error="Escolha uma data futura" />
```

## Checkbox

```tsx
<Checkbox
  checked={accepted}
  label="Aceito os termos"
  onCheckedChange={setAccepted}
/>
```

## RadioGroup

```tsx
<RadioGroup
  label="Frequencia"
  value={frequency}
  onValueChange={setFrequency}
  options={[
    { label: 'Unica', value: 'once' },
    { label: 'Mensal', value: 'monthly' },
  ]}
/>
```

## Select

```tsx
<Select
  label="Categoria"
  value={category}
  onValueChange={setCategory}
  options={[
    { label: 'Educacao', value: 'education' },
    { label: 'Saude', value: 'health' },
  ]}
/>
```

## Divider

```tsx
<Divider />
<Divider orientation="vertical" />
```

## ProgressBar

```tsx
<ProgressBar value={7500} max={10000} />
<ProgressBar value={90} variant="success" />
```

## Avatar

Representa pessoa, instituicao ou campanha com imagem ou iniciais.

```tsx
<Avatar name="Maria Souza" />
<Avatar name="Instituto Esperanca" size="lg" />
<Avatar source={{ uri: imageUrl }} />
```

Props principais:

```text
size: sm | md | lg
name: string
source: ImageSourcePropType
```

## Tag

Marcador curto de status ou categoria.

```tsx
<Tag label="Ativa" variant="success" />
<Tag label="Meta proxima" variant="warning" />
<Tag label="Urgente" variant="danger" />
```

Props principais:

```text
variant: neutral | success | warning | danger | info
label: string
```

## EmptyState

Estado vazio com titulo, descricao, ilustracao opcional e acao.

```tsx
<EmptyState
  title="Nenhuma campanha encontrada"
  description="Tente ajustar os filtros ou volte mais tarde."
  action={<Button variant="secondary">Limpar filtros</Button>}
/>
```

## FeedbackState

Estado padronizado para erro, sucesso, aviso e informacao.

```tsx
<FeedbackState
  variant="error"
  title="Nao foi possivel carregar"
  description="Tente novamente em instantes."
  primaryAction={<Button>Tentar novamente</Button>}
/>
```

## ScreenState

Componente para padronizar loading, vazio, erro, sucesso e conteudo.

```tsx
<ScreenState
  loading={isLoading}
  empty={campaigns.length === 0}
  error={error ? { title: 'Erro ao carregar campanhas' } : null}
  emptyState={{ title: 'Nenhuma campanha encontrada' }}>
  <CampaignList campaigns={campaigns} />
</ScreenState>
```

## Loading

Indicador de carregamento padronizado.

```tsx
<Loading label="Carregando campanhas" />
```

## ScreenContainer

Container base para telas, com safe area, fundo do tema, padding e opcao de scroll.

```tsx
<ScreenContainer>
  <ThemedText>Tela</ThemedText>
</ScreenContainer>

<ScreenContainer scrollable padding="lg">
  <CampaignForm />
</ScreenContainer>
```

Props principais:

```text
padding: none | sm | md | lg
scrollable: boolean
```

## Cenarios Da HU

### Cenario 1: reutilizacao de botao padrao

Dado que duas telas diferentes precisam de botao principal, quando `Button` for utilizado sem alterar `variant`, entao ambas usam a mesma base visual e comportamental.

```tsx
<Button onPress={handleSubmit}>Continuar</Button>
```

### Cenario 2: variacao de componente

Dado que uma tela precisa de botao desabilitado ou secundario, quando `Button` receber props de variacao, entao mantem o padrao visual esperado.

```tsx
<Button variant="secondary">Ver campanha</Button>
<Button disabled>Doacao encerrada</Button>
```
