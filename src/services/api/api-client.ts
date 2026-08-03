import { useAppStore } from '@/store/app-store';
import { logger } from '@/services/logger';

import { API_BASE_URL, API_TIMEOUT_MS } from './config';
import { ApiError } from './errors';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  idempotencyKey?: string;
  idempotencyScope?: string;
  token?: string | null;
};

type IdempotencyCacheEntry = {
  expiresAt: number;
  key: string;
};

const IDEMPOTENT_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const IDEMPOTENCY_RETRY_WINDOW_MS = Math.max(API_TIMEOUT_MS * 4, 60_000);
const idempotencyKeys = new Map<string, IdempotencyCacheEntry>();
const apiLogger = logger.child('API');

apiLogger.info('API client configured', {
  baseUrl: API_BASE_URL,
  timeoutMs: API_TIMEOUT_MS,
});

function createIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  const randomPart = Math.random().toString(36).slice(2);
  const timePart = Date.now().toString(36);

  return `${timePart}-${randomPart}`;
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`)
    .join(',')}}`;
}

function getIdempotencyFingerprint(path: string, method: string, body: unknown) {
  return `${method.toUpperCase()}:${path}:${stableStringify(body ?? {})}`;
}

function getCachedIdempotencyKey(fingerprint: string) {
  const cachedEntry = idempotencyKeys.get(fingerprint);

  if (!cachedEntry) {
    return undefined;
  }

  if (cachedEntry.expiresAt <= Date.now()) {
    idempotencyKeys.delete(fingerprint);
    return undefined;
  }

  return cachedEntry.key;
}

function setCachedIdempotencyKey(fingerprint: string, key: string) {
  idempotencyKeys.set(fingerprint, {
    expiresAt: Date.now() + IDEMPOTENCY_RETRY_WINDOW_MS,
    key,
  });
}

function getIdempotencyHeaders(
  path: string,
  method: string | undefined,
  body: unknown,
  idempotencyKey?: string,
  idempotencyScope?: string,
) {
  const normalizedMethod = method?.toUpperCase();

  if (!normalizedMethod || !IDEMPOTENT_METHODS.has(normalizedMethod)) {
    return undefined;
  }

  const fingerprint = getIdempotencyFingerprint(path, normalizedMethod, body);
  const nextIdempotencyKey =
    idempotencyKey ??
    getCachedIdempotencyKey(fingerprint) ??
    createIdempotencyKey();

  setCachedIdempotencyKey(fingerprint, nextIdempotencyKey);

  return {
    fingerprint,
    headers: {
      'Idempotency-Key': nextIdempotencyKey,
      ...(idempotencyScope ? { 'X-Idempotency-Scope': idempotencyScope } : {}),
    },
  };
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

async function refreshAccessToken() {
  const { refreshToken, setTokens } = useAppStore.getState();

  if (!refreshToken) {
    apiLogger.debug('Token refresh skipped; no refresh token');
    return null;
  }

  const startedAt = Date.now();
  apiLogger.debug('POST /auth/refresh started');

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  const payload = await parseResponse(response);
  const durationMs = Date.now() - startedAt;

  apiLogger[response.ok ? 'info' : 'warn'](`POST /auth/refresh ${response.status} ${durationMs}ms`, {
    requestId: response.headers.get('x-request-id') ?? undefined,
  });

  if (!response.ok) {
    return null;
  }

  const nextAccessToken = payload?.accessToken ?? payload?.token;

  if (nextAccessToken) {
    setTokens(nextAccessToken, refreshToken);
    return nextAccessToken;
  }

  return null;
}

export async function apiClient<TResponse>(
  path: string,
  {
    body,
    headers,
    idempotencyKey,
    idempotencyScope,
    token,
    ...options
  }: RequestOptions = {},
  attempt = 0,
): Promise<TResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const method = options.method?.toUpperCase() ?? 'GET';
  const startedAt = Date.now();
  const idempotency = getIdempotencyHeaders(
    path,
    method,
    body,
    idempotencyKey,
    idempotencyScope,
  );
  let keepIdempotencyKeyForRetry = false;
  let delegatedIdempotencyCleanup = false;

  try {
    apiLogger.debug(`${method} ${url} started`, {
      attempt,
      hasBody: body !== undefined,
      idempotencyKey: idempotency?.headers['Idempotency-Key'],
      idempotencyScope,
    });

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(idempotency ? idempotency.headers : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const payload = await parseResponse(response);
    const durationMs = Date.now() - startedAt;

    apiLogger[response.ok ? 'info' : 'warn'](`${method} ${path} ${response.status} ${durationMs}ms`, {
      attempt,
      idempotencyKey: idempotency?.headers['Idempotency-Key'],
      requestId: response.headers.get('x-request-id') ?? undefined,
    });

    if (!response.ok && response.status === 401 && attempt === 0 && !path.includes('/auth/refresh')) {
      apiLogger.debug(`${method} ${path} trying token refresh`, {
        idempotencyKey: idempotency?.headers['Idempotency-Key'],
      });
      const nextAccessToken = await refreshAccessToken();

      if (nextAccessToken) {
        delegatedIdempotencyCleanup = true;
        return await apiClient<TResponse>(
          path,
          {
            body,
            headers,
            idempotencyKey: idempotency?.headers['Idempotency-Key'],
            idempotencyScope,
            token: nextAccessToken,
            ...options,
          },
          1,
        );
      }
    }

    if (!response.ok) {
      throw new ApiError('Falha ao consumir a API.', response.status, payload);
    }

    return payload as TResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      apiLogger.error(`${method} ${path} failed`, {
        idempotencyKey: idempotency?.headers['Idempotency-Key'],
        message: error.message,
        status: error.status,
      });
      throw error;
    }

    keepIdempotencyKeyForRetry = true;
    apiLogger.error(`${method} ${path} network error`, {
      idempotencyKey: idempotency?.headers['Idempotency-Key'],
      message: error instanceof Error ? error.message : String(error),
      url,
    });
    throw new ApiError('Nao foi possivel conectar com a API.', undefined, error);
  } finally {
    if (
      idempotency?.fingerprint &&
      !keepIdempotencyKeyForRetry &&
      !delegatedIdempotencyCleanup
    ) {
      idempotencyKeys.delete(idempotency.fingerprint);
    }

    clearTimeout(timeout);
  }
}

export const api = {
  get: <TResponse>(path: string, options?: RequestOptions) =>
    apiClient<TResponse>(path, { ...options, method: 'GET' }),
  post: <TResponse, TBody = unknown>(path: string, body?: TBody, options?: RequestOptions) =>
    apiClient<TResponse>(path, { ...options, method: 'POST', body }),
  put: <TResponse, TBody = unknown>(path: string, body?: TBody, options?: RequestOptions) =>
    apiClient<TResponse>(path, { ...options, method: 'PUT', body }),
  patch: <TResponse, TBody = unknown>(path: string, body?: TBody, options?: RequestOptions) =>
    apiClient<TResponse>(path, { ...options, method: 'PATCH', body }),
  delete: <TResponse>(path: string, options?: RequestOptions) =>
    apiClient<TResponse>(path, { ...options, method: 'DELETE' }),
};
