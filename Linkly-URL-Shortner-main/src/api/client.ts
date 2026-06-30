import type { ApiErrorResponse } from '@/types';
import { API_HEADERS } from '@/constants';
import { getRuntimeAuthToken, getRuntimeGuestId } from '@/api/runtimeAuth';

export class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
  }
}

async function parseBody<T>(response: Response): Promise<T> {
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export async function apiRequest<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const authToken = getRuntimeAuthToken();
  const guestId = getRuntimeGuestId();

  const response = await fetch(endpoint, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { [API_HEADERS.authorization]: `Bearer ${authToken}` } : {}),
      ...(guestId ? { [API_HEADERS.guestId]: guestId } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let errorMessage = 'Something went wrong';
    try {
      const body = await parseBody<ApiErrorResponse>(response);
      errorMessage = body.error ?? errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new ApiClientError(errorMessage, response.status);
  }

  return parseBody<T>(response);
}
