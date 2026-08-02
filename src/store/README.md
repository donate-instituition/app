# Estado Global

O estado global inicial usa Zustand para dados pequenos e transversais, como token de autenticacao e campanha selecionada.

Estados de servidor devem ficar no servico/API ou em uma biblioteca de cache quando o projeto precisar. Estados locais de tela devem continuar dentro da propria tela.

Autenticacao usa sessao real do backend. `roles` vem da API como grants auditaveis de permissao. `activeRole` e uma preferencia local do app, salva no Zustand, e define apenas qual visualizacao o usuario esta usando no momento.
