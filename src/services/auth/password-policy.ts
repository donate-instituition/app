export function getPasswordPolicyError(password: string) {
  if (password.length < 8) {
    return 'A senha precisa ter pelo menos 8 caracteres.';
  }

  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    return 'Use letras maiúsculas, minúsculas e número.';
  }

  return '';
}
