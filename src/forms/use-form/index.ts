import { useCallback, useMemo, useState } from 'react';

import type { Validator } from '@/forms/validators/index';

type FormValues = Record<string, string>;
type FormErrors<TValues extends FormValues> = Partial<Record<keyof TValues, string>>;
type FormValidators<TValues extends FormValues> = Partial<Record<keyof TValues, Validator<string>>>;
type FormMasks<TValues extends FormValues> = Partial<Record<keyof TValues, (value: string) => string>>;

type UseFormParams<TValues extends FormValues> = {
  initialValues: TValues;
  validators?: FormValidators<TValues>;
  masks?: FormMasks<TValues>;
};

export function useForm<TValues extends FormValues>({
  initialValues,
  masks,
  validators,
}: UseFormParams<TValues>) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormErrors<TValues>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof TValues, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  const setValue = useCallback((field: keyof TValues, value: string) => {
    const nextValue = masks?.[field]?.(value) ?? value;

    setValues((current) => ({
      ...current,
      [field]: nextValue,
    }));

    if (errors[field]) {
      setErrors((current) => ({
        ...current,
        [field]: validators?.[field]?.(nextValue) ?? undefined,
      }));
    }
  }, [errors, masks, validators]);

  const setFieldTouched = useCallback((field: keyof TValues) => {
    setTouched((current) => ({
      ...current,
      [field]: true,
    }));
  }, []);

  function validate() {
    const nextErrors = {} as FormErrors<TValues>;

    for (const key of Object.keys(values) as (keyof TValues)[]) {
      const error = validators?.[key]?.(values[key]);

      if (error) {
        nextErrors[key] = error;
      }
    }

    setErrors(nextErrors);
    setSubmitted(true);

    return Object.keys(nextErrors).length === 0;
  }

  function reset() {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setSubmitted(false);
  }

  const fieldProps = useMemo(
    () =>
      (field: keyof TValues) => ({
        value: values[field],
        error: touched[field] || submitted ? errors[field] : undefined,
        success: Boolean((touched[field] || submitted) && values[field] && !errors[field]),
        onBlur: () => setFieldTouched(field),
        onChangeText: (value: string) => setValue(field, value),
      }),
    [errors, setFieldTouched, setValue, submitted, touched, values]
  );

  return {
    values,
    errors,
    touched,
    submitted,
    fieldProps,
    setValue,
    setFieldTouched,
    validate,
    reset,
  };
}
