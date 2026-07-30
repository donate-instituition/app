EloDoar — Project Overview
React Native / Expo app for connecting donors with charitable institutions. App name: elodoar | Stack: Expo Router v6, React Native 0.81, Zustand, TanStack Query, TypeScript.

Project Architecture Map
src/
├── app/                        ← Expo Router file-based routes
│   ├── _layout.tsx             ← Root layout (QueryClient, SafeArea, ThemeProvider, hydration gate)
│   ├── index.tsx               ← Entry redirect → login or dashboard
│   ├── (auth)/                 ← Unauthenticated route group
│   │   ├── _layout.tsx         ← Redirects to dashboard if already logged in
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   └── (app)/                  ← Authenticated route group
│       ├── _layout.tsx         ← Guards: redirects to login if no token/user
│       ├── (tabs)/             ← Tab bar layout (role-aware tabs)
│       │   ├── _layout.tsx     ← Tab icons differ per role (donor / institution / admin)
│       │   ├── dashboard.tsx
│       │   ├── campaigns.tsx
│       │   ├── donations.tsx
│       │   ├── messages.tsx
│       │   └── profile.tsx
│       ├── campaign/
│       │   ├── [id].tsx        ← Campaign detail
│       │   └── [id]/
│       │       └── donate.tsx  ← Donation flow
│       ├── institution/
│       │   └── [id].tsx        ← Institution detail
│       └── chat/
│           └── [conversationId].tsx  ← Chat detail (stacked over tabs)
│
├── screens/                    ← Screen components (consumed by app/ route files)
│   ├── auth/
│   │   ├── login/              → LoginScreen
│   │   ├── register/           → RegisterScreen
│   │   └── forgot-password/    → ForgotPasswordScreen
│   └── main/
│       ├── dashboard/          → DashboardScreen
│       ├── campaigns/          → CampaignsScreen
│       ├── donations/          → DonationsScreen
│       ├── messages/           → MessagesScreen
│       ├── profile/            → ProfileScreen
│       ├── campaign-detail/    → CampaignDetailScreen
│       ├── donate/             → DonateScreen
│       ├── institution-detail/ → InstitutionDetailScreen
│       └── chat-detail/        → ChatDetailScreen
│
├── components/                 ← Shared UI component library
│   ├── avatar/        Button, Card, Carousel, Checkbox,
│   ├── button/        DatePicker, Divider, EmptyState,
│   ├── card/          Input, Loading, ProgressBar,
│   ├── ...            RadioGroup, ScreenContainer,
│   └── index.ts       Select, Tag, ThemedText, ThemedView
│
├── services/
│   ├── api/           ← apiClient (fetch wrapper + timeout + Bearer auth)
│   ├── auth/          ← authService (login, register, forgotPassword)
│   ├── campaigns/     ← campaignsService (mock — list/get campaigns & institutions)
│   ├── donations/     ← donationsService (mock — list/create donations)
│   ├── chat/          ← chatService (mock — conversations/messages)
│   └── storage/       ← AsyncStorage adapter for Zustand persist
│
├── store/
│   └── app-store.tsx  ← Zustand store: authToken, user (SessionUser), setSession, logout
│
├── hooks/
│   ├── use-color-scheme.ts ← wraps RN useColorScheme
│   └── use-fetch.ts        ← generic data-fetching hook (loading/error/data/refetch)
│
├── navigation/
│   ├── routes.ts      ← Typed route constants
│   ├── session.ts     ← UserRole, SessionUser types, role labels
│   └── theme.ts       ← React Navigation theme (light/dark)
│
└── theme/
    ├── colors.ts      ← Palette + semantic colors (light + dark)
    ├── typography.ts  ← Font families, sizes, weights
    ├── spacing.ts     ← Spacing scale + shadow presets
    ├── borders.ts     ← Border widths + border radii
    └── index.ts       ← Re-exports `theme`, `Colors`, `Fonts`
User Roles
Role	Value	Description
Doador	donor	Standard user who browses and donates to campaigns
Staff Instituição	institution-staff	Employee/admin of a charitable institution
Admin Plataforma	platform-admin	Super-admin with platform-wide controls
Each role sees a different tab bar:

Tab	Donor	Institution Staff	Platform Admin
Tab 1	Início (home)	Painel	Dashboard
Tab 2	Busca	Campanhas	Instituições
Tab 3	Doações	Doações	Usuários
Tab 4	Chat	Chat	Auditoria
Tab 5	Perfil	Perfil	Perfil
Note: All three roles currently share the same screen components. Role-specific content differentiation inside screens is not yet implemented (see backlog).

User Journeys
1. Authentication Journey (all roles)
App launch
  └─► index.tsx checks authToken in Zustand store
        ├─ Token exists  → /dashboard
        └─ No token      → /login

/login (LoginScreen)
  ├─ Fill email + password → [Entrar]
  │     ├─ API success  → setSession(token, user) → /dashboard
  │     └─ API error    → inline error message
  ├─ [Esqueci minha senha] → /forgot-password
  ├─ [Criar conta] → /register
  └─ DEV shortcut buttons (donor / institution / admin) — only in __DEV__ mode

/register (RegisterScreen)
  ├─ Fill name, email, password, confirm password → [Criar conta]
  │     ├─ Validation: name required, valid email, ≥8 chars, passwords match
  │     ├─ API 409 → "E-mail já cadastrado"
  │     └─ API success → setSession(token, user) → /dashboard
  └─ [Entrar] → back()

/forgot-password (ForgotPasswordScreen)
  ├─ Fill email → [Enviar instruções]
  │     └─ API success → success state ("Verifique seu e-mail")
  └─ [Voltar para o login] → back()
2. Donor Journey
/dashboard (DashboardScreen)
  ├─ Greets user by first name
  ├─ Featured campaign banner (highest-progress active campaign from mock service)
  ├─ "Minhas doações" section — 2 most recent from donationsService, refreshes on focus
  └─ "Campanhas para você" section — top active campaigns, each taps to /campaign/[id]

/campaigns (CampaignsScreen) — "Busca" tab
  ├─ Search bar (live filter)
  ├─ Toggle: Campanhas | Instituições
  ├─ Category chips (Todos / Educação / Alimentação / Saúde / Moradia / Meio Ambiente)
  ├─ Results count
  ├─ Campaign cards → /campaign/[id]
  └─ Institution cards → /institution/[id]

/campaign/[id] (CampaignDetailScreen)
  ├─ Progress banner (raised / goal / % / donors / end date)
  ├─ "Sobre a campanha" description
  ├─ "Organizado por" → taps to /institution/[id]
  ├─ "O que precisamos" item chips (when present)
  └─ Action bar (only if campaign.active):
       ├─ [Conversar] → /chat/conv-{institutionId}
       └─ [Fazer Doação] → /campaign/[id]/donate

/campaign/[id]/donate (DonateScreen)
  ├─ Campaign summary card
  ├─ Preset amounts: R$10 / R$25 / R$50 / R$100 / R$250
  ├─ Custom amount input
  ├─ "Total a ser doado" preview card
  ├─ [Confirmar doação] (disabled until amount > 0)
  │     ├─ Validates: min R$1,00 / max R$10.000,00
  │     └─ Success state → options: "Ver campanha" or "Ir para o início"
  └─ Back → campaign detail

/donations (DonationsScreen) — "Doações" tab
  ├─ Metrics: total donated (completed only) + campaigns supported
  └─ History list: campaign, institution, date, amount, status tag

/institution/[id] (InstitutionDetailScreen)
  ├─ Identity card (avatar, name, location, category, verified badge)
  ├─ "Sobre a instituição"
  ├─ Info: founded year, email, website (optional)
  ├─ Active campaigns list → each taps to /campaign/[id]
  └─ "Conversar com a Instituição" button → /chat/conv-{institutionId}

/messages (MessagesScreen) — "Chat" tab
  ├─ Conversation list (mock data via chatService)
  ├─ Unread badge on tab bar (total unread count)
  ├─ Refreshes on focus (last message preview stays in sync)
  └─ Each conversation → /chat/[conversationId]

/chat/[conversationId] (ChatDetailScreen)
  ├─ Message thread with date separators and typing indicator
  ├─ Send message → mock auto-reply from institution
  └─ Marks conversation as read on open

/profile (ProfileScreen) — "Perfil" tab
  ├─ Identity: avatar, name, email, role tag
  ├─ Menu: Meus dados / Notificações / Privacidade / Ajuda (all → no-ops yet)
  └─ [Sair da conta] → logout() → redirects to /login
3. Institution Staff Journey
Routes and screens are the same as the Donor journey for now. The tab bar labels change (Painel / Campanhas / Doações / Chat / Perfil) but the screen content is identical — role-specific institution dashboards and campaign management are not yet built.

4. Platform Admin Journey
Routes and screens are the same as the Donor journey for now. The tab bar labels change (Dashboard / Instituições / Usuários / Auditoria / Perfil) but the screen content is identical — admin-specific screens are not yet built.

Implemented Functionalities
✅ Authentication
[x] Login with email + password (wired to API, with 401 handling)
[x] Register with name/email/password/confirm (with 409 handling)
[x] Forgot password → email submission (success/error state)
[x] Session persistence via AsyncStorage (Zustand + persist middleware)
[x] Auth guard: unauthenticated users redirected to login
[x] Auto-redirect to dashboard on app launch if already authenticated
[x] DEV quick-login buttons (Doador / Instituição / Admin) visible in __DEV__
[x] Logout (clears Zustand store → AsyncStorage cleared)
✅ Dashboard
[x] Featured campaign banner from mock campaignsService
[x] Recent donations from mock donationsService (top 2)
[x] Suggested campaigns from mock campaignsService
[x] Loading / error / empty states
[x] Refreshes on focus (syncs after new donation)
✅ Browse / Search
[x] Campaign list with search + category filter
[x] Institution list with search
[x] Campaigns ↔ Institutions toggle mode
[x] Results count display
[x] Empty state + error state + retry
✅ Campaign Detail
[x] Progress banner (amount raised, goal, %, donor count, end date)
[x] Description, items needed chips
[x] Link to institution detail
[x] Donate CTA (only if active campaign)
[x] "Conversar" button (opens chat thread with institution)
[x] Loading and error states with retry
✅ Donation Flow
[x] Preset amounts (R$10, R$25, R$50, R$100, R$250)
[x] Custom amount input (decimal-pad)
[x] Min/max validation (R$1 – R$10.000)
[x] Campaign summary card with live progress
[x] Success state with navigation options
[x] Donation persisted in mock in-memory store
✅ Donations History
[x] Total donated metric (completed donations only)
[x] Campaigns supported count
[x] History list with status tags (Pendente / Em andamento / Entregue / Falhou / Cancelada)
[x] Loading / error / empty states
✅ Institution Detail
[x] Identity card (name, city/state, category, verified badge)
[x] Description, contact info (email, website)
[x] Founded year
[x] Active campaigns list → navigates to campaign detail
[x] "Conversar" button (opens chat thread with institution)
✅ Messages / Chat (Mock)
[x] Conversation list UI with unread badge per thread
[x] Tab bar unread badge (total count)
[x] Empty state + error state + retry
[x] List refreshes on focus after returning from chat
[x] Chat detail screen (message bubbles, date separators, typing indicator)
[x] Send message with mock auto-reply
[x] "Conversar" entry points from campaign and institution detail
[x] ensureConversation creates thread with correct institution name
[ ] ❌ Real-time messaging / backend API — NOT IMPLEMENTED (mock in-memory only)
[ ] ❌ Message persistence across app restarts — NOT IMPLEMENTED
[ ] ❌ Role-specific chat (institution inbox / admin audit) — NOT IMPLEMENTED
✅ Profile
[x] User identity display (name, email, role tag)
[x] Menu items (Meus dados / Notificações / Privacidade / Ajuda)
[x] Logout button
[ ] ❌ Menu items are non-functional — NOT IMPLEMENTED
✅ Role-Aware Tab Bar
[x] Different tab icons/labels based on user role (donor / institution-staff / platform-admin)
✅ Design System & Theme
[x] Light + Dark mode support (semantic color tokens)
[x] Full component library: Avatar, Button, Card, Carousel, Checkbox, DatePicker, Divider, EmptyState, Input, Loading, ProgressBar, RadioGroup, ScreenContainer, Select, Tag, ThemedText, ThemedView
[x] Custom font support via expo-font
[x] Spacing, typography, border, shadow tokens
✅ Infrastructure
[x] Expo Router v6 file-based routing
[x] TanStack Query v5 (QueryClient configured; custom useFetch hook used in most screens)
[x] Zustand global store with AsyncStorage persistence
[x] apiClient with Bearer token injection, timeout, and error parsing
[x] Metro alias @/ → src/ for clean imports
[x] unstable_enablePackageExports + CJS condition order (fixes import.meta crash with Hermes)
Known Issues / Not Yet Implemented
Priority	Area	Difficulty	Backend	Notes
1	✅ Orphaned screens/home/	Trivial	None	Removed — dashboard tab replaces it
2	✅ Dashboard data	Easy	None	Wired to mock donationsService + campaignsService
3	Profile menu items	Easy	None	Static/local UI screens (Meus dados, Notificações, etc.)
4	Institution dashboard	Medium	None (mock)	Role-specific UI for institution-staff
5	Admin dashboard	Medium-Hard	None (mock)	Role-specific UI for platform-admin
6	Payment integration	Hard	External API	Stripe/Mercado Pago — needs gateway even before own backend
7	Image uploads	Hard	Storage backend	Needs file storage (S3, Firebase, etc.)
8	Push notifications	Hard	Backend + FCM/APNs	Needs token registration and push service
—	Backend API	—	Required later	Set EXPO_PUBLIC_API_URL in .env when ready
—	Chat / Messages	—	Backend later	UI complete; mock in-memory only
