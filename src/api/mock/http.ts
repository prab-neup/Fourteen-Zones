import type { ApiErrorBody, FieldError } from '../../types/api';
import { ErrorCode } from '../../types/api';
import type { HttpMethod } from '../client/types';
import type { MockScenario } from './scenario';

export type MockRequest = {
  method: HttpMethod;
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
  body: unknown;
  scenario: MockScenario;
};

export type MockSuccess = {
  status: number;
  body: {
    data: unknown;
    meta?: unknown;
  };
};

export type MockFailure = {
  status: number;
  body: ApiErrorBody;
};

export type MockResult = MockSuccess | MockFailure;

export function ok(data: unknown, meta?: unknown, status = 200): MockSuccess {
  return meta === undefined ? { status, body: { data } } : { status, body: { data, meta } };
}

export function created(data: unknown): MockSuccess {
  return { status: 201, body: { data } };
}

export function fail(
  status: number,
  code: string,
  message: string,
  details?: FieldError[],
): MockFailure {
  return {
    status,
    body: {
      error: details ? { code, message, details } : { code, message },
    },
  };
}

export function serverError(): MockFailure {
  return fail(500, ErrorCode.Internal, 'An unexpected server error occurred.');
}

export function notFound(message: string): MockFailure {
  return fail(404, ErrorCode.NotFound, message);
}

export function validationError(details: FieldError[]): MockFailure {
  return fail(422, ErrorCode.Validation, 'Request validation failed', details);
}

export function readString(body: unknown, field: string): string | undefined {
  if (typeof body !== 'object' || body === null) {
    return undefined;
  }

  const value = (body as Record<string, unknown>)[field];
  return typeof value === 'string' ? value : undefined;
}
