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
    access.tsx
    login.tsx
    register.tsx
    forgot-password.tsx
    activate-account.tsx
    google-onboarding.tsx
    google-onboarding-details.tsx
  (app)/
    _layout.tsx
    (tabs)/            -> rotas legadas, hoje so redirecionam para a arvore por papel abaixo
    donor/(tabs)/       -> dashboard, campaigns, donations, messages, profile
    institution/(tabs)/ -> dashboard, campaigns, create, messages, profile
    admin/(tabs)/       -> dashboard, institutions, users, audit, profile
    campaign/[id].tsx
    campaign/[id]/donate.tsx
    donation/[id].tsx
    institution/[id].tsx
    chat/[conversationId].tsx
    notifications.tsx
    profile/            -> me, notifications, privacy, help, settings, supports
```

## Fluxo De Entrada

`src/app/index.tsx` decide para onde o usuario deve ir:

```text
Sem authToken   -> /access
Com authToken   -> rota inicial do papel ativo (getHomeRouteForRole)
```

O estado de autenticacao e real, persistido via Zustand + AsyncStorage em `src/store/app-store.tsx` (`authToken`, `refreshToken`, `user`, `activeRole`), preenchido pela resposta da API de login/registro/Google — nao ha mais mock nesse fluxo.

## Fluxo De Autenticacao

O grupo `(auth)` contem as telas publicas de acesso.

Hoje existe:

```text
src/app/(auth)/access.tsx
src/app/(auth)/login.tsx
src/app/(auth)/register.tsx
src/app/(auth)/forgot-password.tsx
src/app/(auth)/activate-account.tsx
src/app/(auth)/google-onboarding.tsx
src/app/(auth)/google-onboarding-details.tsx
src/screens/auth/
```

A tela de login autentica de verdade contra a API (`authService.login`, com tratamento de 401/conta pendente), alem de "Continuar com Google" (Google Sign-In nativo, com onboarding em duas etapas para contas novas) e cadastro tradicional em `/register`.

Em `__DEV__` existe um atalho "Acesso rapido" com botoes por papel (donor / institution-staff / platform-admin). Isso **nao** e um login simulado: cada botao chama `authService.login` de verdade contra a API com credenciais de conta de desenvolvimento pre-cadastradas (`EXPO_PUBLIC_DEV_*_EMAIL/PASSWORD`). E removido em producao pelo guard `__DEV__` do React Native.

## Area Logada

O grupo `(app)` contem a navegacao principal autenticada.

`src/app/(app)/_layout.tsx` protege a area logada:

```text
Sem sessao -> redireciona para /access
Com sessao -> renderiza a arvore de rotas do papel ativo (Stack + Tabs por papel)
```

Diferente da versao inicial desta HU, cada papel tem sua propria arvore de abas (nao e mais um unico `(tabs)/` compartilhado com 5 rotas fixas — aquelas rotas continuam existindo em `(app)/(tabs)/`, mas apenas como redirecionamento de compatibilidade):

```text
donor/(tabs)/       Inicio, Explorar, Doar, Conversas, Perfil
institution/(tabs)/ Painel, Campanhas, Criar, Conversas, Perfil
admin/(tabs)/       Dashboard, Instituicoes, Usuarios, Auditoria, Perfil
```

Cada arvore e montada por `RoleTabsLayout` (`src/navigation/role-tabs-layout.tsx`), que redireciona para a rota inicial do papel ativo se o papel montado nao bater com `activeRole` no store. Uma conta pode ter mais de um papel (`user.roles` e uma lista); o usuario troca de papel ativo pela tela de Perfil.

## Rotas Nomeadas

Rotas compartilhadas ficam em `src/navigation/routes.ts`.

Use esse arquivo quando uma rota for usada por mais de um lugar, e prefira `getHomeRouteForRole` em vez de fixar uma rota por papel na mao:

```ts
import { getHomeRouteForRole, routes } from '@/navigation/routes';
import { useActiveRole } from '@/store';

const activeRole = useActiveRole();
router.replace(getHomeRouteForRole(activeRole));
```

## Tipos De Sessao

Tipos e labels de sessao ficam em `src/navigation/session.ts`.

```ts
type UserRole = 'platform-admin' | 'donor' | 'institution-staff';
```

`SessionUser.roles` e uma lista de concessoes de papel (`{ name, grantedAt, grantedBy }`), nao um campo unico — uma conta pode acumular mais de um papel. `preferredRole` guarda o ultimo papel escolhido pelo usuario para o proximo login; `activeRole`, no Zustand store, e o papel montado na navegacao agora. O retorno do login/registro/Google ja preenche esses dados com a sessao real vinda da API (nao ha mais preenchimento mockado).

## Cenarios Da HU

### Cenario 1: navegacao entre autenticacao e area logada

Dado que o usuario ainda nao esta autenticado, quando abrir o aplicativo, entao `src/app/index.tsx` redireciona para `/access`.

### Cenario 2: navegacao principal apos login

Dado que o usuario fez login com sucesso (e-mail/senha, Google ou o atalho `__DEV__`, todos contra a API real), quando entrar na aplicacao, entao `setSession` define a sessao (token, refresh token, usuario, papel ativo) e o app redireciona para a rota inicial do papel ativo, exibindo a arvore de tabs correspondente (`donor/(tabs)`, `institution/(tabs)` ou `admin/(tabs)`).

### Cenario 3: usuario com mais de um papel

Dado que o usuario autenticado possui mais de uma concessao de papel em `user.roles`, quando ele usar o seletor de papel na tela de Perfil, entao `setActiveRole` troca a arvore de tabs montada e `setPreferredRole` grava a escolha para o proximo login.

## Escopo Desta HU

A base de navegacao original (separar autenticacao de area logada, preparar tabs por papel) esta implementada e evoluiu além do previsto inicialmente: os itens abaixo, antes listados como fora de escopo para HUs futuras, ja estao entregues hoje (ver `app/RELATORIO.md` para o detalhe de cada um):

- Autenticacao real (e-mail/senha, Google Sign-In, ativacao de conta, recuperacao de senha).
- Onboarding do usuario padrao e da instituicao (cadastro tradicional e onboarding Google em duas etapas).
- Cadastro de usuario.
- Gestao de campanhas (criacao pela instituicao, aprovacao/reprovacao pelo admin).
- Doacoes (Stripe PaymentSheet, recibo em PDF, assinatura mensal).
- Chat em tempo real (WebSocket).
- Auditoria/admin (lista de usuarios, log de auditoria, moderacao de instituicoes).
- Gestao de instituicoes.

Continuam fora do escopo desta HU de navegacao (tratados como trabalho a parte, ver a tabela de pendencias em `project/overview.md`): QA de producao do Stripe, onboarding self-service do Stripe Connect, relatorios agregados de admin e testes automatizados end-to-end.
