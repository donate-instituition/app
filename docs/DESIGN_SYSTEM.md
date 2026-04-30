# Design System Inicial

Este documento define os tokens visuais iniciais do EloDoar. O objetivo e manter consistencia visual entre telas, componentes e fluxos de doacao.

## Onde Ficam Os Tokens

```text
src/theme/
  colors.ts
  typography.ts
  spacing.ts
  borders.ts
  index.ts
```

Todos os tokens devem ser consumidos a partir de `src/theme`:

```ts
import { theme } from '@/src/theme';
```

## Cores

A paleta base combina confianca, acolhimento e acao:

```text
Verde     Marca, acoes principais, impacto positivo
Coral     Acoes secundarias, destaque emocional
Amarelo   Progresso, metas e marcadores de destaque
Azul      Informacoes e estados neutros de apoio
Neutros   Texto, bordas, fundos e superficies
```

As cores semanticas ficam em `theme.colors.light` e `theme.colors.dark`.

Tokens principais:

```text
text              Texto principal
textMuted         Texto secundario
background        Fundo da tela
surface           Superficies elevadas ou blocos de conteudo
surfaceMuted      Superficie suave
border            Bordas e divisores
primary           Acao principal
primaryStrong     Versao forte da cor primaria
primarySoft       Fundo suave da cor primaria
secondary         Acao secundaria
secondarySoft     Fundo suave da cor secundaria
accent            Destaques, metas e progresso
info              Informacoes
success           Sucesso
warning           Avisos
danger            Erros e acoes destrutivas
```

Exemplo:

```ts
const colors = theme.colors.light;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
});
```

## Tipografia

A tipografia fica em `theme.typography`.

Tokens disponiveis:

```text
family      Familias por plataforma
weight      regular, medium, semibold, bold
size        xs, sm, md, lg, xl, 2xl, 3xl
lineHeight  xs, sm, md, lg, xl, 2xl, 3xl
```

Use `ThemedText` para textos comuns. Quando criar estilos especificos, use os tokens:

```ts
const styles = StyleSheet.create({
  title: {
    fontSize: theme.typography.size['2xl'],
    lineHeight: theme.typography.lineHeight['2xl'],
    fontWeight: theme.typography.weight.bold,
  },
});
```

## Espacamentos

A escala de espacamento fica em `theme.spacing`.

```text
none  0
xxs   2
xs    4
sm    8
md    12
lg    16
xl    24
2xl   32
3xl   40
4xl   56
```

Exemplo:

```ts
const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.lg,
    padding: theme.spacing.xl,
  },
});
```

## Bordas

Bordas ficam em `theme.radius` e `theme.borderWidths`.

Raios:

```text
none  0
xs    4
sm    6
md    8
lg    12
pill  999
```

Espessuras:

```text
none      0
hairline  0.5
sm        1
md        2
```

Exemplo:

```ts
const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.md,
    borderWidth: theme.borderWidths.sm,
  },
});
```

## Sombras

Sombras ficam em `theme.shadows`.

```text
none
sm
md
```

Use sombras com parcimonia, principalmente em cards, headers fixos ou elementos que precisem indicar elevacao.

## Componentes Base

O design system inicial ja possui:

```text
src/components/avatar/
src/components/button/
src/components/card/
src/components/carousel/
src/components/checkbox/
src/components/date-picker/
src/components/divider/
src/components/empty-state/
src/components/input/
src/components/loading/
src/components/progress-bar/
src/components/radio-group/
src/components/screen-container/
src/components/select/
src/components/tag/
src/components/themed-text/
src/components/themed-view/
```

Esses componentes usam `theme.colors`, `theme.typography` e o modo claro/escuro do dispositivo.

Novos componentes compartilhados devem seguir:

```text
src/components/
  component-name/
    components/
    index.tsx
    styles.ts
```

## Regras De Uso

- Nao use cores hexadecimais diretamente em telas ou componentes.
- Nao crie escalas paralelas de font size, spacing ou radius.
- Use `theme.colors[scheme]` quando o componente precisar reagir ao modo claro/escuro.
- Use `theme.spacing` para `padding`, `margin` e `gap`.
- Use `theme.radius` e `theme.borderWidths` para bordas.
- Promova variacoes recorrentes para tokens antes de duplicar valores.

## Cenarios De Teste

### Cenario 1: uso de tokens visuais

Dado que uma nova tela foi implementada, quando seus estilos forem criados, entao devem ser usados tokens de `src/theme` para cor, tipografia, espacamento e borda.

Exemplo esperado:

```ts
const styles = StyleSheet.create({
  section: {
    padding: theme.spacing.xl,
    borderRadius: theme.radius.md,
  },
});
```

### Cenario 2: alteracao centralizada de tema

Dado que uma cor global do aplicativo foi alterada em `src/theme/colors.ts`, quando o tema for atualizado, entao telas e componentes que usam o token devem refletir a mudanca sem ajustes individuais.

Exemplo:

```ts
primary: palette.emerald600
```

Ao alterar `primary`, botoes, links e telas que usam `theme.colors[scheme].primary` passam a refletir a nova cor automaticamente.
