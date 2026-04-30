# Estado Global

O estado global inicial usa Zustand para dados pequenos e transversais, como token de autenticacao e campanha selecionada.

Estados de servidor devem ficar no servico/API ou em uma biblioteca de cache quando o projeto precisar. Estados locais de tela devem continuar dentro da propria tela.

Enquanto o backend nao estiver integrado, a autenticacao usa `loginAs(role)` para criar uma sessao mockada.
