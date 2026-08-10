import { useAppStore } from '@/store/app-store';
import { logger } from '@/services/logger';

import { API_BASE_URL, API_TIMEOUT_MS } from './config';
import { ApiError, getApiErrorMessage } from './errors';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  idempotencyKey?: string;
  idempotencyScope?: string;
  query?: Record<string, boolean | null | number | string | undefined>;
  suppressErrorLog?: boolean;
  token?: string | null;
};

type IdempotencyCacheEntry = {
  expiresAt: number;
  key: string;
};

const IDEMPOTENT_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const IDEMPOTENCY_RETRY_WINDOW_MS = Math.max(API_TIMEOUT_MS * 4, 60_000);
const idempotencyKeys = new Map<string, IdempotencyCacheEntry>();
const inFlightGetRequests = new Map<string, Promise<unknown>>();
let refreshTokenPromise: Promise<string | null> | null = null;
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

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function buildUrl(path: string, query?: RequestOptions['query']) {
  const baseUrl = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

  if (!query) {
    return baseUrl;
  }

  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();

  if (!queryString) {
    return baseUrl;
  }

  return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${queryString}`;
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
  if (refreshTokenPromise) {
    apiLogger.debug('POST /auth/refresh joined in-flight request');
    return refreshTokenPromise;
  }

  refreshTokenPromise = refreshAccessTokenRequest().finally(() => {
    refreshTokenPromise = null;
  });

  return refreshTokenPromise;
}

async function refreshAccessTokenRequest() {
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
    query,
    suppressErrorLog,
    token,
    ...options
  }: RequestOptions = {},
  attempt = 0,
): Promise<TResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  const url = buildUrl(path, query);
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
            query,
            suppressErrorLog,
            token: nextAccessToken,
            ...options,
          },
          1,
        );
      }
    }

    if (!response.ok && response.status === 429 && attempt === 0) {
      const retryAfterHeader = response.headers.get('retry-after');
      const retryAfterSeconds = Number(retryAfterHeader);
      const retryAfterMs = Math.min(
        Math.max(
          Number.isFinite(retryAfterSeconds) ? retryAfterSeconds * 1000 : 1_000,
          750,
        ),
        3_000,
      );

      apiLogger.warn(`${method} ${path} rate limited; retrying`, {
        retryAfterMs,
        requestId: response.headers.get('x-request-id') ?? undefined,
      });
      await wait(retryAfterMs);

      return await apiClient<TResponse>(
        path,
        {
          body,
          headers,
          idempotencyKey: idempotency?.headers['Idempotency-Key'],
          idempotencyScope,
          query,
          suppressErrorLog,
          token,
          ...options,
        },
        1,
      );
    }

    if (!response.ok) {
      throw new ApiError(
        getApiErrorMessage(payload, 'Falha ao consumir a API.'),
        response.status,
        payload,
      );
    }

    return payload as TResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      const logPayload = {
        idempotencyKey: idempotency?.headers['Idempotency-Key'],
        message: error.message,
        status: error.status,
      };

      if (suppressErrorLog) {
        apiLogger.warn(`${method} ${path} failed`, logPayload);
      } else {
        apiLogger.error(`${method} ${path} failed`, logPayload);
      }
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
  get: <TResponse>(path: string, options?: RequestOptions) => {
    const url = buildUrl(path, options?.query);
    const dedupeKey = `${url}:${options?.token ?? 'anonymous'}`;
    const existingRequest = inFlightGetRequests.get(dedupeKey);

    if (existingRequest) {
      apiLogger.debug(`GET ${path} joined in-flight request`);
      return existingRequest as Promise<TResponse>;
    }

    const request = apiClient<TResponse>(path, { ...options, method: 'GET' })
      .finally(() => {
        inFlightGetRequests.delete(dedupeKey);
      });

    inFlightGetRequests.set(dedupeKey, request);
    return request;
  },
  post: <TResponse, TBody = unknown>(path: string, body?: TBody, options?: RequestOptions) =>
    apiClient<TResponse>(path, { ...options, method: 'POST', body }),
  put: <TResponse, TBody = unknown>(path: string, body?: TBody, options?: RequestOptions) =>
    apiClient<TResponse>(path, { ...options, method: 'PUT', body }),
  patch: <TResponse, TBody = unknown>(path: string, body?: TBody, options?: RequestOptions) =>
    apiClient<TResponse>(path, { ...options, method: 'PATCH', body }),
  delete: <TResponse>(path: string, options?: RequestOptions) =>
    apiClient<TResponse>(path, { ...options, method: 'DELETE' }),
};
