import { createFetchHttpClient } from './fetchHttpClient';
import { createMockHttpClient } from './mockHttpClient';
import type { HttpClient } from './types';

/**
 * Single construction site for the transport. Features import `httpClient`,
 * never a mock or fetch implementation, so the backend can be swapped in env.
 */
export function createHttpClient(): HttpClient {
  const mode = import.meta.env.VITE_API_MODE ?? 'mock';

  if (mode === 'http') {
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
    return createFetchHttpClient(baseUrl);
  }

  return createMockHttpClient();
}

export const httpClient = createHttpClient();
