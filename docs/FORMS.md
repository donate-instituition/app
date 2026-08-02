# Formularios E Validacoes

Esta HU padroniza entradas de dados no EloDoar.

## Objetivo

- Campos devem usar o componente `Input`.
- Mensagens de erro devem aparecer abaixo do campo.
- Estados de foco, erro e sucesso devem seguir o tema.
- Mascaras e validacoes devem ser reutilizaveis.
- Formularios devem centralizar valores, erros e toque em um hook.

## Estrutura

```text
src/forms/
  masks/
  validators/
  use-form/
  index.ts
```

## Input

O componente `Input` possui estados padronizados:

```tsx
<Input
  label="CPF ou CNPJ"
  placeholder="000.000.000-00"
  error="Informe um documento valido"
/>

<Input
  label="Email"
  success
  successText="Email valido"
/>
```

## Mascaras

Mascaras reutilizaveis ficam em `src/forms/masks`.

Disponiveis:

```text
onlyDigits
maskCpf
maskCnpj
maskCpfOrCnpj
maskPhone
maskCurrency
```

Exemplo:

```ts
import { maskCpfOrCnpj } from '@/forms/masks/index';
```

## Validacoes

Validadores reutilizaveis ficam em `src/forms/validators`.

Disponiveis:

```text
required
email
minLength
cpfOrCnpj
composeValidators
```

Exemplo:

```ts
import { composeValidators, cpfOrCnpj, required } from '@/forms/validators/index';

const documentValidator = composeValidators(required(), cpfOrCnpj());
```

## useForm

`useForm` centraliza valores, erros, touched, submit e props dos campos.

```tsx
const form = useForm({
  initialValues: {
    document: '',
    password: '',
  },
  masks: {
    document: maskCpfOrCnpj,
  },
  validators: {
    document: composeValidators(required(), cpfOrCnpj()),
    password: composeValidators(required(), minLength(6)),
  },
});

return (
  <>
    <Input label="CPF ou CNPJ" {...form.fieldProps('document')} />
    <Input label="Senha" secureTextEntry {...form.fieldProps('password')} />
    <Button onPress={form.validate}>Continuar</Button>
  </>
);
```

## Cenarios Da HU

### Cenario 1: formulario com erro de validacao

Dado que o usuario preenche um campo invalido, quando tentar prosseguir, entao `useForm.validate()` preenche `errors` e o `Input` exibe a mensagem abaixo do campo.

### Cenario 2: formulario com sucesso

Dado que o usuario preenche os dados corretamente, quando enviar o formulario, entao `validate()` retorna `true` e a tela pode prosseguir com a acao.
