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

export async function apiClient<TResponse>(
  path: string,
  { body, headers, token, ...options }: RequestOptions = {}
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
