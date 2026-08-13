# app — Relatório do que está implementado

> Referência de apoio à monografia, gerada a partir de auditoria direta do
> código em 2026-08-11. Para a visão do sistema como um todo (os 4
> repositórios juntos), ver `donate-infra/RELATORIO-TCC.md`.

## O que é este repositório

Aplicativo móvel do EloDoar: Expo Router v6 (SDK 54), React Native 0.81,
Zustand (com persistência via AsyncStorage), TanStack Query, TypeScript.
Atende três papéis de usuário — doador, funcionário de instituição e
administrador da plataforma.

**Auditoria confirmou (2026-08-11): nenhum dos 13 serviços em
`src/services/` usa dado mock/em memória** — todos conversam com a API
real do `donate-server`. Isso contradiz a documentação antiga do
repositório (`project/overview.md`), que descrevia doações, chat e
campanhas como simulados — provavelmente porque foi escrita numa fase
inicial do projeto e nunca atualizada.

| Serviço | Rotas reais que consome |
|---|---|
| `campaigns` | `/campaigns`, `/campaigns/mine`, `/institutions`, aprovação/rejeição admin, conta Stripe Connect, curtir/comentar/compartilhar |
| `donations` | `/donations`, `/payments/stripe/payment-intents` (+ confirm), `/payments/stripe/config`, cancelamento de assinatura |
| `chat` | `/conversations/me`, `/conversations/:id/messages`, marcar como lida |
| `auth` | login, refresh, **Google Sign-In**, ativação, esqueci minha senha, `PATCH .../settings` (papel preferido + preferências de notificação) |
| `follows`, `notifications`, `institution-staff`, `posts`, `admin`, `support`, `delivery-proofs`, `terms` | cada um com seu conjunto de rotas reais |
| `uploads` | `POST /uploads` + `POST /uploads/:id/confirm` — upload genérico em duas etapas usado por avatar, capa de campanha e comprovante de prestação de contas (`campaigns`/`delivery-proofs` deixaram de ter rota de upload própria) |
| `firebase` | não é uma API HTTP — integra `expo-notifications` + `@react-native-firebase/messaging`/`crashlytics`, delega o registro de token para o serviço de notificações |

## Navegação — layouts distintos por papel

Diferente de uma versão anterior do projeto (onde os 3 papéis
compartilhavam as mesmas 5 telas), hoje cada papel tem seu próprio
conjunto de abas:

- **Doador**: início, campanhas, doações, mensagens, perfil.
- **Instituição**: início, campanhas, **criar campanha**, mensagens, perfil.
- **Admin**: início, usuários, instituições, auditoria, perfil.

17 telas em `src/screens/main/` (mais que o dobro das 9 listadas na
documentação antiga), mais um diretório `src/screens/auth/` inteiro para
login/registro/onboarding do Google, que a documentação antiga não cobre.

## Funcionalidades por área

### Autenticação e conta
- Login por e-mail/senha e **Sign in with Google**: `GoogleSignin.signIn()`
  nativo → ID token verificado no backend → se a conta já existir (por
  `googleId` ou por e-mail) entra direto; se for conta nova, tela de
  onboarding em duas etapas (escolher Doador/Instituição, depois
  CPF/data de nascimento/telefone/senha opcional/aceite de termos) antes
  de qualquer sessão ser criada.
- Cadastro tradicional, ativação de conta por link de e-mail, recuperação
  de senha por código.
- Foto de perfil do Google usada como avatar padrão **só na primeira vez**
  — nunca sobrescreve uma foto que o usuário já tenha escolhido
  manualmente pelo app. Antes desta sessão, o app nem sequer exibia a foto
  de perfil em lugar nenhum (o componente `Avatar` aceitava a prop mas
  nenhuma tela passava); agora aparece em todos os pontos onde o avatar do
  usuário é mostrado.
- Preferências de notificação: tela que antes só alterava `useState` local
  (nada persistia, reabrir o app resetava tudo) agora lê e grava de
  verdade no backend — 4 categorias independentes (Doações, Campanhas,
  Conversas, Resumo por e-mail), cada switch salva otimisticamente e
  reverte com mensagem de erro se a chamada falhar.
- Trocar a foto de perfil funciona de verdade em dois lugares (tela
  "Perfil" e "Meus dados" em Configurações): `expo-image-picker` → upload
  em duas etapas (`uploadsService`) → `PATCH users/:id`. Antes desta
  sessão o ícone de lápis sobre o avatar não tinha nenhum `onPress`.

### Doações e pagamento
- Stripe PaymentSheet real (`@stripe/stripe-react-native`) — doação única
  ou recorrente (assinatura mensal, com cancelamento pelo app).
- O status exibido nunca é otimista: reflete o que o webhook do Stripe
  processado no backend determinou.
- Recibo fiscal em PDF, gerado de forma assíncrona. Na tela de detalhe da
  doação, "Ver recibo" abre um resumo em modal dentro do próprio app (sem
  chamada de rede — os campos já estão carregados); "PDF" baixa o arquivo
  de verdade (`expo-file-system` + `expo-sharing`, abre o menu de
  compartilhar/salvar do sistema) em vez de abrir um link no navegador —
  o link do S3 nunca aparece em lugar nenhum visível ao usuário.

### Campanhas, instituições, rede social
- Busca e listagem com filtro por categoria, detalhe de campanha
  (progresso, itens necessários), detalhe de instituição (verificação,
  campanhas ativas), criação de campanha pela instituição — upload de capa
  migrado para o fluxo genérico de `uploads` (antes tinha rota própria em
  `campaigns`).
- Feed de posts com curtir/comentar/compartilhar; seguir
  usuário/instituição/campanha. Composer do doador (aba Início) ganhou
  "Foto/Vídeo" de verdade (`expo-image-picker` → upload → confirma com o
  `postId` já criado) e "Apoio" (vincula o post a uma campanha existente
  via `campaignId`, com seletor em bottom sheet) — antes eram só ícones
  decorativos sem `onPress`. O terceiro botão, "Evento", foi removido por
  não existir nenhum domínio de evento no backend.

### Chat
- Conversas em tempo real doador↔instituição via WebSocket (Socket.IO no
  backend) — mensagens persistidas, indicador de não lidas, entrega ao
  vivo. Não é mock, apesar de a documentação antiga do repositório dizer
  o contrário.

### Notificações push
- Registro e renovação de token FCM, tratamento de mensagem em primeiro e
  segundo plano — pipeline completo, também contradizendo a documentação
  antiga (que listava push como "NOT IMPLEMENTED").

### Administração
- Telas de usuários, instituições e auditoria para o papel
  `platform-admin`, consumindo os mesmos endpoints protegidos por
  `@Roles(PLATFORM_ADMIN)` do backend.

## Trabalho mais recente (sessão atual)

1. **Login com Google** — dependência nativa
   `@react-native-google-signin/google-signin`, configurada no `_layout.tsx`
   raiz; botão "Continuar com Google" (que antes era decorativo, só
   mostrava uma mensagem de "ainda não configurado") agora funciona de
   ponta a ponta; nova tela de onboarding em duas etapas para contas
   novas.
2. **Foto de perfil visível no app** — `getAvatarSource()` novo em
   `navigation/session.ts`, conectado nos 7 pontos onde o avatar do
   usuário logado aparece (perfil, configurações de conta, dashboard).
3. **Preferências de notificação persistidas** — `SessionUser` ganhou o
   campo `notificationSettings`; `app-store.tsx` ganhou a ação
   `setNotificationSettings`; a tela em
   `screens/main/account-settings/account-settings-screens.tsx` foi
   reescrita para ler/gravar de verdade em vez de só manter estado local.
4. **Persistência real no S3** — serviço `uploadsService` novo
   (`src/services/uploads/`), consumido em 4 pontos: avatar (telas
   "Perfil" e "Meus dados"), capa de campanha e comprovante de prestação de
   contas (migrados do upload dedicado antigo) e mídia de post no composer
   do doador.
5. **Recibo sem expor o link do S3** — "Ver recibo" virou um modal
   in-app (sem rede); "PDF" passou a baixar o arquivo de verdade via
   `expo-file-system`/`expo-sharing` em vez de abrir a URL num navegador,
   evitando que o domínio do bucket S3 aparecesse na tela do usuário.

## Ressalva sobre a documentação já existente no repositório

`project/overview.md` está desatualizado em pelo menos três pontos
confirmados por auditoria direta do código: descreve doações/chat/
campanhas como mock (são reais), descreve push notifications como não
implementado (está implementado), e descreve os 3 papéis como
compartilhando as mesmas telas (hoje têm layouts de abas distintos). Não
foi alterado — este relatório é um arquivo novo e independente.
