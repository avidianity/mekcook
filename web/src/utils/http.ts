import { useUserStore } from '@/stores/user';
import type { ParsedError } from '@/types/http';
import { Http, isException } from '@avidian/http';
import type { Headers } from '@avidian/http/dist/types/types';

const http = new Http({
  baseUrl: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export function withToken(token: string, additional?: Record<string, string>) {
  const headers = new Headers();

  headers.set('Authorization', `Bearer ${token}`);

  if (additional) {
    for (const key in additional) {
      headers.set(key, additional[key]);
    }
  }

  return headers;
}

export function imageUrl(imageId: string) {
  const url = new URL(`${http.options.baseUrl}/file/${imageId}`);
  const store = useUserStore();

  url.searchParams.set('token', store.token!);

  return url.toString();
}

export function parseValidationError<T>(error: T): ParsedError[] {
  if (!isException(error)) {
    return [];
  }

  const response = error.response;

  if (
    !response ||
    response.data.code !== 'VALIDATION_ERROR' ||
    !Array.isArray(response.data.details)
  ) {
    return [];
  }

  return response.data.details.map((detail: { instancePath: string; message: string }) => {
    const key = detail.instancePath.replace(/^\//, '') || 'unknown';
    return {
      key,
      message: detail.message,
    };
  });
}

export default http;
