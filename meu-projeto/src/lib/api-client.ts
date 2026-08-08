import type { ApiError } from '../../../shared/src/types/api.types';

export class ApiRequestError extends Error {
  readonly status: number;
  readonly fieldErrors?: ApiError['fieldErrors'];

  constructor(status: number, body: ApiError) {
    super(body.error);
    this.status = status;
    this.fieldErrors = body.fieldErrors;
  }
}

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const isMutating = Boolean(options.method) && options.method !== 'GET';

  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(isMutating ? { 'X-Requested-With': 'app' } : {}),
      ...options.headers,
    },
  });

  const body = (await response.json()) as T | ApiError;

  if (!response.ok) {
    throw new ApiRequestError(response.status, body as ApiError);
  }

  return body as T;
};

export const apiGet = <T>(path: string): Promise<T> => request<T>(path);

export const apiPost = <T>(path: string, data: unknown): Promise<T> =>
  request<T>(path, { method: 'POST', body: JSON.stringify(data) });

export const apiPatch = <T>(path: string, data: unknown): Promise<T> =>
  request<T>(path, { method: 'PATCH', body: JSON.stringify(data) });

export const apiDelete = <T>(path: string): Promise<T> => request<T>(path, { method: 'DELETE' });

// No Content-Type here: the browser sets multipart/form-data with the right
// boundary itself. Setting it manually corrupts the boundary and the server
// fails to parse the body.
export const apiPostForm = async <T>(path: string, form: FormData): Promise<T> => {
  const response = await fetch(`/api${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'X-Requested-With': 'app' },
    body: form,
  });

  const body = (await response.json()) as T | ApiError;

  if (!response.ok) {
    throw new ApiRequestError(response.status, body as ApiError);
  }

  return body as T;
};
