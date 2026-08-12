EloDoar — Project Overview
React Native / Expo app for connecting donors with charitable institutions. App name: elodoar | Stack: Expo Router v6 (SDK 54), React Native 0.81, Zustand (persisted via AsyncStorage), TanStack Query, TypeScript. Real-time chat via Socket.IO, payments via Stripe (`@stripe/stripe-react-native`), push via Firebase Cloud Messaging, Google Sign-In.

Project Architecture Map
src/
├── app/                        ← Expo Router file-based routes
│   ├── _layout.tsx             ← Root layout (QueryClient, SafeArea, ThemeProvider, Stripe/Google Sign-In setup, hydration gate)
│   ├── index.tsx               ← Entry redirect → /access (unauthenticated) or the caller's role-specific home route
│   ├── terms.tsx                ← Terms of service viewer / accept-terms gate (shared, top-level route)
│   ├── (auth)/                 ← Unauthenticated route group
│   │   ├── _layout.tsx         ← Redirects to role home if already logged in
│   │   ├── access.tsx          ← Login/Register chooser (→ AccessScreen)
│   │   ├── login.tsx           ← Email/password + "Sign in with Google"; __DEV__-only quick-login block (calls the real login API with seeded dev credentials, not a mock session)
│   │   ├── register.tsx        ← Traditional signup (donor or institution account)
│   │   ├── forgot-password.tsx
│   │   ├── activate-account.tsx      ← Handles the account-activation e-mail link
│   │   ├── google-onboarding.tsx     ← New Google accounts, step 1: choose Doador/Instituição
│   │   └── google-onboarding-details.tsx ← Step 2: CPF, birth date, phone, optional password, terms acceptance
│   └── (app)/                  ← Authenticated route group
│       ├── _layout.tsx         ← Guards: redirects to login if no token/user; blocks on pending terms re-acceptance
│       ├── (tabs)/             ← Legacy flat tab routes (dashboard/campaigns/donations/messages/profile) — kept only as redirect shims to the role-specific tree below, not used for real navigation anymore
│       ├── donor/(tabs)/       ← Donor tab layout: dashboard, campaigns, donations, messages, profile
│       ├── institution/(tabs)/ ← Institution tab layout: dashboard, campaigns, create, messages, profile
│       ├── admin/(tabs)/       ← Admin tab layout: dashboard, institutions, users, audit, profile
│       ├── admin/audit/[id].tsx      ← Audit log entry detail
│       ├── admin/user/[id].tsx       ← Admin user detail / moderation
│       ├── campaign/[id].tsx         ← Campaign detail (shared across roles)
│       ├── campaign/[id]/donate.tsx  ← Donation flow (Stripe PaymentSheet)
│       ├── donation/[id].tsx         ← Donation detail + receipt (in-app summary modal + real PDF download)
│       ├── institution/[id].tsx      ← Institution detail
│       ├── institution/donations.tsx ← Donations received by the institution
│       ├── chat/[conversationId].tsx ← Chat detail (Socket.IO, stacked over tabs)
│       ├── notifications.tsx         ← In-app notifications inbox
│       └── profile/                  ← me.tsx, notifications.tsx, privacy.tsx, help.tsx, settings.tsx, supports.tsx (sub-screens, stacked over tabs)
│
├── screens/                    ← Screen components (consumed by app/ route files)
│   ├── auth/
│   │   ├── access/              → AccessScreen
│   │   ├── login/                → LoginScreen
│   │   ├── register/             → RegisterScreen
│   │   ├── forgot-password/      → ForgotPasswordScreen
│   │   ├── google-onboarding/    → GoogleOnboardingScreen, GoogleOnboardingDetailsScreen
│   │   └── terms/                → TermsScreen
│   └── main/                    (17 screens; role-shared components branch internally on activeRole)
│       ├── dashboard/           → DashboardScreen — distinct content per role (donor feed / institution metrics / admin overview)
│       ├── campaigns/           → CampaignsScreen — donor search+browse; also renders the admin "Instituições" moderation view when activeRole is platform-admin
│       ├── donations/           → DonationsScreen — donor history; also renders the institution's received-donations list and the admin "Usuários" list, branching on activeRole
│       ├── messages/            → MessagesScreen — donor/institution conversation list; also renders the admin "Auditoria" log when activeRole is platform-admin
│       ├── profile/             → ProfileScreen (includes role switcher for multi-role accounts)
│       ├── account-settings/    → AccountSettingsScreen family (notifications, privacy, help sub-screens)
│       ├── campaign-detail/     → CampaignDetailScreen
│       ├── donate/              → DonateScreen (Stripe PaymentSheet)
│       ├── donation-detail/     → DonationDetailScreen (receipt modal + PDF download/share)
│       ├── institution-detail/  → InstitutionDetailScreen
│       ├── institution-create/  → InstitutionCreateScreen (institution-side campaign creation: cover upload, goal, deadline, items needed)
│       ├── admin-user-detail/   → AdminUserDetailScreen
│       ├── admin-audit-detail/  → AdminAuditDetailScreen
│       ├── notifications/       → NotificationsScreen (in-app notification list)
│       ├── supports-dashboard/  → "Apoios" screen (followed institutions/campaigns + donation history), linked from Profile
│       └── chat-detail/         → ChatDetailScreen (real-time via Socket.IO)
│
├── components/                 ← Shared UI component library
│   ├── avatar/        Button, Card, Carousel, Checkbox,
│   ├── button/        DatePicker, Divider, EmptyState,
│   ├── card/           FeedbackState, FloatingTabBar,
│   ├── ...             Input, Loading, ProgressBar,
│   └── index.ts        RadioGroup, ScreenContainer, ScreenState,
│                        SegmentedToggle, Select, Tag,
│                        ThemedText, ThemedView
│
├── services/                   ← All 17 services call the real donate-server API (no mock/in-memory data remains)
│   ├── api/               ← apiClient (fetch wrapper + timeout + Bearer auth + token refresh)
│   ├── auth/               ← login, register, Google Sign-In + onboarding, activation, forgot/change password, settings (preferred role, notification prefs)
│   ├── campaigns/          ← campaigns, institutions, admin approve/reject, Stripe Connect account verification, like/comment/share
│   ├── donations/          ← donations, Stripe payment intents (+confirm), Stripe config, subscription cancellation
│   ├── chat/               ← conversations/messages over REST + a persistent Socket.IO connection for live delivery/unread updates
│   ├── follows/            ← follow/unfollow user, institution, campaign
│   ├── posts/              ← social feed (create/like/comment/share)
│   ├── notifications/      ← in-app notifications list + FCM push-token registration
│   ├── institution-staff/  ← institution team/staff management
│   ├── admin/              ← user list/detail, audit log list/detail
│   ├── delivery-proofs/    ← accountability/delivery-proof submission for campaigns
│   ├── uploads/            ← generic two-step upload (POST /uploads → POST /uploads/:id/confirm), used by avatar, campaign cover, delivery proof and post media
│   ├── support/            ← help/FAQ content
│   ├── terms/              ← current terms-of-service version + acceptance
│   ├── firebase/           ← not an HTTP service: wires expo-notifications + @react-native-firebase/messaging (push token registration/refresh, foreground/background handling) and @react-native-firebase/crashlytics
│   ├── logger/             ← structured console/child logger
│   └── storage/            ← AsyncStorage adapter for Zustand persist
│
├── store/
│   └── app-store.tsx  ← Zustand store: authToken, refreshToken, user (SessionUser with multi-role grants), activeRole, setSession, setActiveRole/setPreferredRole, setNotificationSettings, setProfilePhotoUrl, setTermsAccepted, logout
│
├── hooks/
│   ├── use-color-scheme.ts ← wraps RN useColorScheme
│   ├── use-fetch.ts        ← generic data-fetching hook (loading/error/data/refetch)
│   └── use-chat-unread.ts  ← live unread-conversation count for the tab-bar badge
│
├── navigation/
│   ├── routes.ts            ← Typed route constants + getHomeRouteForRole
│   ├── session.ts           ← UserRole, SessionUser (multi-role), role labels, getActiveRole/getSessionRoles helpers
│   ├── role-tabs-layout.tsx ← Per-role Tabs layout builder (Donor/Institution/Admin), redirects away if the active role doesn't match the mounted tree
│   └── theme.ts              ← React Navigation theme (light/dark)
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
A user account can hold more than one role (`SessionUser.roles` is an array of role grants with `grantedAt`/`grantedBy` audit info, not a single field). `activeRole` in the Zustand store picks which role's tab tree is mounted; Profile exposes a role switcher for accounts with multiple roles, and the switch is remembered as `preferredRole` for next launch.

Each role gets its own tab tree (distinct routes, not just relabeled screens):

Tab	Donor (`donor/(tabs)`)	Institution Staff (`institution/(tabs)`)	Platform Admin (`admin/(tabs)`)
Tab 1	Início (dashboard)	Painel (dashboard)	Dashboard (dashboard)
Tab 2	Explorar (campaigns)	Campanhas (campaigns)	Instituições (institutions)
Tab 3	Doar (donations)	Criar (create campaign)	Usuários (users)
Tab 4	Conversas (messages)	Conversas (messages)	Auditoria (audit)
Tab 5	Perfil (profile)	Perfil (profile)	Perfil (profile)
Note: the tab routes are role-distinct, but several underlying screen components are still shared and branch on `activeRole` — e.g. `DashboardScreen` renders different sections per role, `CampaignsScreen` doubles as the admin institution-moderation view, `DonationsScreen` doubles as the admin user list, and `MessagesScreen` doubles as the admin audit log. This is intentional UI-shell reuse (search/list/pagination chrome), not leftover mock sharing. Note also that a donor's post-login landing tab is "Doar" (donations), not "Início" — see `getHomeRouteForRole`.

User Journeys
1. Authentication Journey (all roles)
App launch
  └─► index.tsx checks authToken in the Zustand store
        ├─ Token exists  → role home route (getHomeRouteForRole(activeRole))
        └─ No token      → /access

/access (AccessScreen)
  └─ Choose [Entrar] → /login or [Criar conta] → /register

/login (LoginScreen)
  ├─ Fill email + password → [Entrar]
  │     ├─ API success  → setSession(token, refreshToken, user) → role home route
  │     └─ API error    → inline error message (401 / pending activation / etc.)
  ├─ [Continuar com Google] → native GoogleSignin.signIn() → ID token verified by the backend
  │     ├─ Existing account (matched by googleId or e-mail) → session created → role home route
  │     └─ New account → /google-onboarding (2-step: role choice, then CPF/birth date/phone/password/terms) → session created only after completion
  ├─ [Esqueci minha senha] → /forgot-password
  ├─ [Criar conta] → /register
  └─ __DEV__-only "Acesso rápido" block — logs in against the real API with seeded dev accounts (donor/institution/admin), not a mock/local session

/register (RegisterScreen)
  ├─ Fill name, email, password, confirm password, CPF, birth date, phone (+ institution fields if signing up as an institution) → [Criar conta]
  │     ├─ API 409 → "E-mail já cadastrado"
  │     ├─ Donor account → session created → role home route
  │     └─ Institution account → pending-approval / pending-verification state (no session yet)
  └─ [Entrar] → back()

/forgot-password (ForgotPasswordScreen)
  ├─ Fill email → [Enviar instruções] → code-based reset flow
  └─ [Voltar para o login] → back()

2. Donor Journey
/donor/dashboard (DashboardScreen, donor branch)
  ├─ Greets user by first name
  ├─ Featured campaign banner (highest-progress active campaign, from the real campaigns API)
  ├─ Social feed (posts, like/comment/share) with a composer: text, "Foto/Vídeo" (real image/video upload) and "Apoio" (links the post to an existing campaign via a bottom-sheet picker)
  ├─ "Minhas doações" section — most recent donations, refreshes on focus
  └─ "Campanhas para você" — top active campaigns, each taps to /campaign/[id]

/donor/campaigns (CampaignsScreen) — "Explorar" tab
  ├─ Search bar (live filter) + "Perto de mim" toggle
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
       ├─ [Conversar] → /chat/[conversationId] (real conversation with the institution)
       └─ [Fazer Doação] → /campaign/[id]/donate

/campaign/[id]/donate (DonateScreen)
  ├─ Campaign summary card
  ├─ Preset amounts: R$10 / R$25 / R$50 / R$100 / R$250, or a custom amount
  ├─ One-time or monthly (subscription) mode
  ├─ [Confirmar doação] → real Stripe PaymentSheet
  │     ├─ Min/max validation (R$1,00 – R$10.000,00)
  │     └─ Payment status is never optimistic — it reflects what the Stripe webhook, processed by donate-workers, wrote to the donation
  └─ Success → options: "Ver campanha" or "Ir para o início"

/donor/donations (DonationsScreen, donor branch) — "Doar" tab, and the donor's post-login landing route
  ├─ Metrics: total donated (completed only) + campaigns supported
  └─ History list: campaign, institution, date, amount, status tag → taps to /donation/[id]

/donation/[id] (DonationDetailScreen)
  ├─ Donation summary (amount, campaign, institution, status, date)
  ├─ [Ver recibo] → in-app modal summary (no network call, no S3 URL ever shown)
  ├─ [PDF] → downloads the real receipt PDF (expo-file-system + expo-sharing) and opens the system share/save sheet
  └─ Subscription donations expose a cancel action

/institution/[id] (InstitutionDetailScreen)
  ├─ Identity card (avatar, name, location, category, verified badge)
  ├─ "Sobre a instituição", founded year, email, website
  ├─ Active campaigns list → each taps to /campaign/[id]
  └─ "Conversar com a Instituição" → /chat/[conversationId]

/donor/messages (MessagesScreen, donor branch) — "Conversas" tab
  ├─ Conversation list (real conversations via REST, live updates via Socket.IO)
  ├─ Unread badge on the tab bar (live count, `useChatUnread`)
  ├─ Refreshes on focus
  └─ Each conversation → /chat/[conversationId]

/chat/[conversationId] (ChatDetailScreen)
  ├─ Message thread with date separators, delivered/persisted over WebSocket
  ├─ Send message → delivered live to the institution side, no mock auto-reply
  └─ Marks conversation as read on open (emits an unread:update)

/donor/profile (ProfileScreen) — "Perfil" tab
  ├─ Identity: avatar (editable via expo-image-picker → real upload), name, email, role tag
  ├─ Role switcher (only shown for accounts with more than one role grant)
  ├─ "Apoios" (supports-dashboard: followed institutions/campaigns + history) / Notificações (real persisted 4-category prefs) / Privacidade / Ajuda
  └─ [Sair da conta] → logout() → redirects to /access

3. Institution Staff Journey
/institution/dashboard (DashboardScreen, institution-staff branch) — "Painel" tab
  ├─ Institution metrics (raised, active campaigns, donors) pulled from real campaign/donation data
  └─ Verification and Stripe Connect status (account-ID entry + "Pendências na Stripe" requirements check)

/institution/campaigns (CampaignsScreen, institution-staff branch) — "Campanhas" tab
  └─ The institution's own campaigns, with management actions

/institution/create (InstitutionCreateScreen) — "Criar" tab
  ├─ Campaign creation: title, description, goal (R$), deadline, items needed, cover image (two-step upload)
  └─ Delivery-proof / accountability report submission for existing campaigns

/institution/messages, /institution/profile
  └─ Same conversation list and profile mechanics as the donor journey, scoped to the institution's conversations

/institution/donations
  └─ Donations received by the institution

4. Platform Admin Journey
/admin/dashboard (DashboardScreen, platform-admin branch) — "Dashboard" tab
  └─ Platform-wide overview (users/institutions/donations counters)

/admin/institutions (CampaignsScreen, platform-admin branch) — "Instituições" tab
  └─ Institution moderation: approve/reject pending institutions

/admin/users (DonationsScreen, platform-admin branch) — "Usuários" tab
  ├─ Paginated user list/search → taps to /admin/user/[id] (AdminUserDetailScreen)
  └─ Real data from `/users` and `/users/:id/details`

/admin/audit (MessagesScreen, platform-admin branch) — "Auditoria" tab
  ├─ Paginated, category-filterable audit log → taps to /admin/audit/[id] (AdminAuditDetailScreen)
  └─ Real data from `/audit-logs`

/admin/profile
  └─ Same profile mechanics as the other roles

Implemented Functionalities
✅ Authentication
[x] Login with email + password (wired to API, with 401/pending-activation handling)
[x] Sign in with Google (native SDK, ID-token verification, auto-link by e-mail/googleId, 2-step onboarding for new accounts)
[x] Register with name/email/password/confirm/CPF/birth date/phone (donor or institution, with 409 handling)
[x] Account activation via e-mail link
[x] Forgot password → code-based reset (success/error state)
[x] Session persistence via AsyncStorage (Zustand + persist middleware), including refresh token
[x] Auth guard: unauthenticated users redirected to /access; pending terms re-acceptance gated via /terms
[x] Auto-redirect to the caller's role home route on app launch if already authenticated
[x] Multi-role accounts with a role switcher (Profile) and remembered preferred role
[x] __DEV__ quick-login buttons (Doador / Instituição / Admin) — call the real login API with seeded dev accounts
[x] Logout (server-side session invalidation + Zustand store cleared → AsyncStorage cleared)
✅ Dashboard
[x] Role-specific dashboard content (donor feed / institution metrics / admin overview), all from real APIs
[x] Featured campaign banner, recent donations, suggested campaigns (donor)
[x] Social feed with composer: text, real photo/video upload, "Apoio" campaign linking
[x] Loading / error / empty states, refreshes on focus
✅ Browse / Search
[x] Campaign list with search + category filter + "Perto de mim"
[x] Institution list with search
[x] Campaigns ↔ Institutions toggle mode
[x] Empty state + error state + retry
✅ Campaign Detail
[x] Progress banner (amount raised, goal, %, donor count, end date)
[x] Description, items needed chips
[x] Link to institution detail
[x] Donate CTA (only if active campaign)
[x] "Conversar" button (opens real chat thread with the institution)
[x] Loading and error states with retry
✅ Donation Flow
[x] Preset amounts (R$10, R$25, R$50, R$100, R$250) + custom amount
[x] One-time and monthly (subscription) donation modes
[x] Real Stripe PaymentSheet (`@stripe/stripe-react-native`), destination charges to the institution's Connect account, configurable EloDoar fee
[x] Min/max validation (R$1 – R$10.000)
[x] Donation/payment status always driven by the Stripe webhook processed by donate-workers, never optimistic
[x] Success state with navigation options
✅ Donations History & Receipts
[x] Total donated metric (completed donations only) + campaigns supported count
[x] History list with status tags (Pendente / Em andamento / Entregue / Falhou / Cancelada)
[x] Donation detail screen with receipt: in-app modal summary + real PDF download/share (no S3 URL ever exposed to the client)
[x] Subscription cancellation from the app
[x] Loading / error / empty states
✅ Institution Detail
[x] Identity card (name, city/state, category, verified badge)
[x] Description, contact info, founded year
[x] Active campaigns list → navigates to campaign detail
[x] "Conversar" button (real chat thread)
✅ Chat / Messages (real-time)
[x] Conversation list backed by the real API, refreshes on focus
[x] Persistent Socket.IO connection: live message delivery, live unread badge (tab bar + per-thread)
[x] Chat detail: message bubbles, date separators, read receipts (marks read on open)
[x] "Conversar" entry points from campaign and institution detail
[x] Institution and admin have their own chat/audit surfaces (role-branched inside MessagesScreen)
✅ Profile & Account
[x] User identity display (avatar, name, email, role tag), editable avatar via real upload
[x] Role switcher for multi-role accounts
[x] Notification preferences persisted to the backend (4 independent categories: Doações, Campanhas, Conversas, Resumo por e-mail), optimistic toggle with error rollback
[x] Profile sub-screens (Meus dados, Notificações, Privacidade e segurança, Ajuda e suporte, Apoios)
[x] Logout button
✅ Push Notifications
[x] FCM device-token registration and refresh via `@react-native-firebase/messaging`
[x] Foreground and background message handling (`expo-notifications`)
[x] Notification-preference categories enforced server-side (per-category opt-out)
[x] In-app notifications inbox screen
✅ Role-Aware Navigation
[x] Distinct route trees and tab bars per role (donor / institution-staff / platform-admin), not just relabeled screens
[x] Legacy flat `(tabs)` routes kept only as redirect shims for backward compatibility
[x] Floating tab bar standardized across role tabs, with live unread badge
✅ Institution Tools
[x] Campaign creation (title, description, goal, deadline, items needed, real cover upload)
[x] Delivery-proof / accountability report submission
[x] Stripe Connect account-ID entry with live requirements/status check
✅ Admin Tools
[x] User list/search + user detail, backed by `/users` and `/users/:id/details`
[x] Audit log list (filterable, paginated) + audit entry detail, backed by `/audit-logs`
[x] Institution approval/rejection, backed by the campaigns/institutions API
✅ Design System & Theme
[x] Light + Dark mode support (semantic color tokens)
[x] Full component library: Avatar, Button, Card, Carousel, Checkbox, DatePicker, Divider, EmptyState, FeedbackState, FloatingTabBar, Input, Loading, ProgressBar, RadioGroup, ScreenContainer, ScreenState, SegmentedToggle, Select, Tag, ThemedText, ThemedView
[x] Custom font support via expo-font
[x] Spacing, typography, border, shadow tokens
✅ Infrastructure
[x] Expo Router v6 file-based routing
[x] TanStack Query v5 (QueryClient configured; custom useFetch hook used in most screens)
[x] Zustand global store with AsyncStorage persistence (auth, refresh token, multi-role session, active role, notification settings)
[x] apiClient with Bearer token injection, refresh, timeout, and error parsing
[x] Real two-step upload pipeline (`uploadsService`) backing avatar, campaign cover, delivery-proof and post media
[x] Metro alias @/ → src/ for clean imports
[x] unstable_enablePackageExports + CJS condition order (fixes import.meta crash with Hermes)

Known Issues / Not Yet Implemented
Priority	Area	Difficulty	Backend	Notes
1	Stripe real-world QA	Medium	Stripe	Finish manual test matrix: success, failure, cancel, duplicate webhook, refund and monthly renewal.
2	Stripe production readiness	Medium	Stripe	Configure live keys, production webhook endpoint, and legal/account checks. (Connect onboarding itself — see #3.)
3	Institution Connect self-service onboarding	Hard	Stripe	App now has an account-ID entry + live requirements/status check in Profile, but institutions still can't complete Stripe Connect onboarding end-to-end from inside the app (no hosted onboarding-link flow yet).
4	S3 production hardening	Low-Medium	Storage backend	Bucket + IAM are provisioned via Terraform and uploads work end-to-end (avatar, campaign cover, delivery proof, post media, receipts); remaining work is promoting the dev bucket/policies to a production environment and lifecycle rules.
5	Admin platform-wide reports	Medium	Backend	User list/detail, audit log and institution approval are real; there is no aggregate platform metrics/reporting view yet beyond per-screen counters.
6	Refunds and disputes	Hard	Stripe	Handle `charge.refunded`, disputes, partial refunds and receipt/status reversal rules.
7	Automated tests	Medium	App/Backend	Add integration/e2e coverage for Stripe webhook processing, PDF generation, chat delivery and mobile donation flows.
8	Receipts polish	Low	Backend/App	Improve PDF layout/branding; receipt e-mail attachment/link still pending.
