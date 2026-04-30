# Componentes

Componentes compartilhados da aplicacao devem ficar aqui.

Cada componente deve ter sua propria pasta:

```text
components/
  button/
    components/
    index.tsx
    styles.ts
```

Use `components/` dentro da pasta do componente quando ele tiver subcomponentes privados.

Componentes muito especificos de uma funcionalidade podem ficar dentro de `src/screens/<feature>` ate serem reutilizados.

A lista de componentes base e exemplos de uso ficam em `docs/COMPONENTS.md`.
