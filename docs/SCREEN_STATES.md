# Estados De Tela

Esta HU padroniza feedback visual para telas do EloDoar.

## Componentes

```text
Loading          Carregamento
EmptyState       Lista ou busca sem dados
FeedbackState    Erro, sucesso, aviso e informacao
ScreenState      Orquestra loading, vazio, erro, sucesso e conteudo
```

Todos os componentes usam tokens de `src/theme`.

## Loading

Use quando uma tela ou secao estiver aguardando dados.

```tsx
<Loading label="Carregando campanhas" />
```

Com `ScreenState`:

```tsx
<ScreenState loading={isLoading} loadingLabel="Carregando doacoes">
  <DonationList donations={donations} />
</ScreenState>
```

## Vazio

Use quando uma listagem nao possuir resultados.

```tsx
<EmptyState
  title="Nenhuma campanha encontrada"
  description="Tente ajustar os filtros ou volte mais tarde."
/>
```

Com `ScreenState`:

```tsx
<ScreenState
  empty={campaigns.length === 0}
  emptyState={{
    title: 'Nenhuma campanha encontrada',
    description: 'Quando houver campanhas ativas, elas aparecerao aqui.',
  }}>
  <CampaignList campaigns={campaigns} />
</ScreenState>
```

## Erro

Use quando uma requisicao ou acao falhar.

```tsx
<FeedbackState
  variant="error"
  title="Nao foi possivel carregar"
  description="Verifique sua conexao e tente novamente."
  primaryAction={<Button>Tentar novamente</Button>}
/>
```

## Sucesso

Use quando uma acao importante for concluida.

```tsx
<FeedbackState
  variant="success"
  title="Doacao registrada"
  description="Voce ja pode acompanhar o status da sua doacao."
/>
```

## Hook De Apoio

`useScreenState` centraliza a decisao entre loading, erro, vazio e sucesso.

```tsx
const state = useScreenState({
  data: campaigns,
  loading: isLoading,
  error,
  isEmpty: (items) => items.length === 0,
});

return (
  <ScreenState
    loading={state.loading}
    empty={state.empty}
    error={state.error}
    emptyState={{ title: 'Nenhuma campanha encontrada' }}>
    <CampaignList campaigns={campaigns} />
  </ScreenState>
);
```

## Cenarios Da HU

### Cenario 1: estado de carregamento

Dado que uma tela depende de carregamento de dados, quando a requisicao estiver em andamento, entao deve usar `Loading` ou `ScreenState` com `loading`.

### Cenario 2: estado sem dados

Dado que uma listagem nao possui resultados, quando a tela for exibida, entao deve usar `EmptyState` ou `ScreenState` com `empty`.
