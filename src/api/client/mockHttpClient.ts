import type { ApiEnvelope } from '../../types/api';
import { simulateLatency } from '../mock/delay';
import { routeMockRequest } from '../mock/router';
import { getMockScenario, isMockScenario, type MockScenario } from '../mock/scenario';
import { apiErrorFromBody } from './errors';
import { queryToRecord } from './query';
import type { HttpClient, HttpRequest } from './types';

function resolveScenario(headers: Record<string, string> | undefined): MockScenario {
  const header = headers?.['X-Mock-Scenario'];
  if (header && isMockScenario(header)) {
    return header;
  }
  return getMockScenario();
}

/**
 * In-process HTTP client. JSON clone mimics the serialize/parse boundary of
 * a real network so handlers never receive live object identity from callers.
 */
export function createMockHttpClient(): HttpClient {
  async function requestEnvelope<T, M = Record<string, unknown>>(
    req: HttpRequest,
  ): Promise<ApiEnvelope<T, M>> {
    await simulateLatency();

    const wireBody = req.body === undefined ? undefined : JSON.parse(JSON.stringify(req.body));
    const result = routeMockRequest({
      method: req.method,
      path: req.path,
      query: queryToRecord(req.query),
      body: wireBody,
      scenario: resolveScenario(req.headers),
    });

    if (result.status >= 400) {
      throw apiErrorFromBody(result.status, result.body);
    }

    return result.body as ApiEnvelope<T, M>;
  }

  return {
    requestEnvelope,
    async request<T>(req: HttpRequest): Promise<T> {
      const envelope = await requestEnvelope<T>(req);
      return envelope.data;
    },
  };
}
