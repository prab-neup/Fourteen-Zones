import type { ApiEnvelope } from '../../types/api';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type HttpRequest = {
  method: HttpMethod;
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
};

/**
 * Transport interface shared by the mock client and a future fetch client.
 * `request` unwraps `data`. Use `requestEnvelope` when pagination meta is needed.
 */
export type HttpClient = {
  request<T>(req: HttpRequest): Promise<T>;
  requestEnvelope<T, M = Record<string, unknown>>(
    req: HttpRequest,
  ): Promise<ApiEnvelope<T, M>>;
};
