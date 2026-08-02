export type ValidationResult = string | null;
export type Validator<TValue = string> = (value: TValue) => ValidationResult;

export function required(message = 'Campo obrigatorio'): Validator<string> {
  return (value) => (value.trim() ? null : message);
}

export function email(message = 'Informe um email valido'): Validator<string> {
  return (value) => (/^\S+@\S+\.\S+$/.test(value.trim()) ? null : message);
}

export function minLength(length: number, message = `Informe pelo menos ${length} caracteres`): Validator<string> {
  return (value) => (value.trim().length >= length ? null : message);
}

export function cpfOrCnpj(message = 'Informe um CPF ou CNPJ valido'): Validator<string> {
  return (value) => {
    const digits = value.replace(/\D/g, '');
    const validLength = digits.length === 11 || digits.length === 14;

    return validLength ? null : message;
  };
}

export function composeValidators<TValue>(...validators: Validator<TValue>[]): Validator<TValue> {
  return (value) => {
    for (const validator of validators) {
      const error = validator(value);

      if (error) {
        return error;
      }
    }

    return null;
  };
}
