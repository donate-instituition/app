# Deep link de ativacao de conta

Hoje, em desenvolvimento, o email usa:

```env
EMAIL_ACCOUNT_ACTIVATION_URL=http://localhost:3000/auth/activate-account
```

Esse link ativa a conta pelo backend e mostra uma pagina HTML simples. Funciona bem para testes locais e desktop.

Para producao/mobile, trocar para um link publico real. Opcoes:

1. Universal/App Link HTTPS:
   - Exemplo: `https://app.elodoar.com/auth/activate-account`
   - Melhor para abrir no app quando instalado e cair no navegador quando nao instalado.

2. Deep link custom scheme:
   - Exemplo: `elodoar://activate-account`
   - Ja existe rota no app: `src/app/(auth)/activate-account.tsx`.
   - Funciona melhor em mobile, mas emails/clientes podem bloquear ou nao reconhecer no desktop.

Checklist para producao:

- Configurar dominio publico do app/API.
- Definir `EMAIL_ACCOUNT_ACTIVATION_URL` com URL publica.
- Se usar Universal/App Link, configurar:
  - iOS Associated Domains.
  - Android App Links/assetlinks.json.
  - Rota web fallback para ativacao.
- Manter `POST /auth/activate-account` para o app consumir o token.
- Testar Gmail, Outlook e app mobile instalado/nao instalado.
