import type { ApiEnvelope } from '../../types/api';
import { ErrorCode } from '../../types/api';
import { apiErrorFromBody } from './errors';
import { buildQueryString } from './query';
import type { HttpClient, HttpRequest } from './types';

/**
 * Real-network implementation used when VITE_API_MODE=http.
 * Same interface as the mock client so feature code does not change.
 */
export function createFetchHttpClient(baseUrl: string): HttpClient {
  async function requestEnvelope<T, M = Record<string, unknown>>(
    req: HttpRequest,
  ): Promise<ApiEnvelope<T, M>> {
    const url = `${baseUrl.replace(/\/$/, '')}${req.path}${buildQueryString(req.query)}`;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...req.headers,
    };

    if (req.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: req.method,
        headers,
        body: req.body === undefined ? undefined : JSON.stringify(req.body),
      });
    } catch {
      throw apiErrorFromBody(0, {
        error: {
          code: ErrorCode.Internal,
          message: 'The request could not be completed.',
        },
      });
    }

    let parsed: unknown = null;
    const text = await response.text();
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        throw apiErrorFromBody(response.status, null);
      }
    }

    if (!response.ok) {
      throw apiErrorFromBody(response.status, parsed);
    }

    return parsed as ApiEnvelope<T, M>;
  }

  return {
    requestEnvelope,
    async request<T>(req: HttpRequest): Promise<T> {
      const envelope = await requestEnvelope<T>(req);
      return envelope.data;
    },
  };
}
