# Navegacao Base

Esta HU define a navegacao inicial do EloDoar com Expo Router.

O objetivo e separar o fluxo de autenticacao da area logada e preparar a navegacao principal para os tres perfis previstos:

- Admin plataforma.
- Usuario padrao.
- Funcionario instituicao, incluindo funcionario comum e funcionario admin.

## Estrutura

```text
src/app/
  _layout.tsx
  index.tsx
  (auth)/
    _layout.tsx
    login.tsx
  (app)/
    _layout.tsx
    dashboard.tsx
    campaigns.tsx
    donations.tsx
    messages.tsx
    profile.tsx
```

## Fluxo De Entrada

`src/app/index.tsx` decide para onde o usuario deve ir:

```text
Sem authToken   -> /login
Com authToken   -> /dashboard
```

O estado de autenticacao ainda e mockado no Zustand, em `src/store/app-store.tsx`.

## Fluxo De Autenticacao

O grupo `(auth)` contem as telas publicas de acesso.

Hoje existe:

```text
src/app/(auth)/login.tsx
src/screens/auth/login/
```

A tela de login permite simular tres perfis:

```text
donor               Usuario padrao
institution-staff   Funcionario instituicao
platform-admin      Admin plataforma
```

Ao selecionar um perfil, `loginAs(role)` grava um token mockado e um usuario mockado no store.

## Area Logada

O grupo `(app)` contem a navegacao principal autenticada.

`src/app/(app)/_layout.tsx` protege a area logada:

```text
Sem sessao -> redireciona para /login
Com sessao -> renderiza Tabs
```

As abas iniciais sao:

```text
dashboard
campaigns
donations
messages
profile
```

Os labels mudam de acordo com o perfil:

```text
Usuario padrao:
Inicio, Campanhas, Doacoes, Chat, Perfil

Funcionario instituicao:
Dashboard instituicao, Campanhas, Doacoes, Chat, Perfil

Admin plataforma:
Dashboard administrativo, Instituicoes, Usuarios, Auditoria, Perfil
```

## Rotas Nomeadas

Rotas compartilhadas ficam em `src/navigation/routes.ts`.

Use esse arquivo quando uma rota for usada por mais de um lugar:

```ts
import { routes } from '@/navigation/routes';

router.replace(routes.appDashboard);
```

## Tipos De Sessao

Tipos e labels de sessao ficam em `src/navigation/session.ts`.

```ts
type UserRole = 'platform-admin' | 'donor' | 'institution-staff';
```

Quando houver backend, o retorno do login deve preencher esses dados de sessao com dados reais.

## Cenarios Da HU

### Cenario 1: navegacao entre autenticacao e area logada

Dado que o usuario ainda nao esta autenticado, quando abrir o aplicativo, entao `src/app/index.tsx` redireciona para `/login`.

### Cenario 2: navegacao principal apos login

Dado que o usuario realizou login mockado com sucesso, quando entrar na aplicacao, entao `loginAs(role)` define a sessao e o app redireciona para `/dashboard`, exibindo a navegacao principal por tabs.

## Escopo Desta HU

Esta HU nao implementa os fluxos completos das imagens. Ela prepara a base de navegacao para as proximas HUs:

- Autenticacao real.
- Onboarding do usuario padrao.
- Cadastro de usuario.
- Gestao de campanhas.
- Doacoes.
- Chat.
- Auditoria/admin.
- Gestao de instituicoes.
