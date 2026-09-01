import type { HttpRequest } from './types';

export function buildQueryString(query: HttpRequest['query']): string {
  if (!query) {
    return '';
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === '') {
      continue;
    }
    params.set(key, String(value));
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

export function queryToRecord(query: HttpRequest['query']): Record<string, string> {
  if (!query) {
    return {};
  }

  const record: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) {
      continue;
    }
    record[key] = String(value);
  }
  return record;
}
