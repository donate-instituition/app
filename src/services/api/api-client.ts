import { useAppStore } from '@/store/app-store';

import { API_BASE_URL, API_TIMEOUT_MS } from './config';
import { ApiError } from './errors';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  token?: string | null;
};

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
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  const payload = await parseResponse(response);

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
  { body, headers, token, ...options }: RequestOptions = {},
  attempt = 0,
): Promise<TResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const payload = await parseResponse(response);

    if (!response.ok && response.status === 401 && attempt === 0 && !path.includes('/auth/refresh')) {
      const nextAccessToken = await refreshAccessToken();

      if (nextAccessToken) {
        return apiClient<TResponse>(path, { body, headers, token: nextAccessToken, ...options }, 1);
      }
    }

    if (!response.ok) {
      throw new ApiError('Falha ao consumir a API.', response.status, payload);
    }

    return payload as TResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError('Nao foi possivel conectar com a API.', undefined, error);
  } finally {
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
