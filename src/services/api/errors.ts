export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly payload?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getApiErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object') {
    return fallback;
  }

  const message = (payload as { message?: unknown }).message;

  if (Array.isArray(message)) {
    return message.join(' ');
  }

  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  return fallback;
}
