import type { ApiErrorBody, FieldError } from '../../types/api';
import { ErrorCode } from '../../types/api';

/**
 * Domain error thrown by the HTTP client.
 * Feature hooks read `code` and `details` so they never inspect raw status codes.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: FieldError[] | undefined;

  constructor(input: {
    status: number;
    code: string;
    message: string;
    details?: FieldError[];
  }) {
    super(input.message);
    this.name = 'ApiError';
    this.status = input.status;
    this.code = input.code;
    this.details = input.details;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function apiErrorFromBody(status: number, body: unknown): ApiError {
  if (isErrorEnvelope(body)) {
    return new ApiError({
      status,
      code: body.error.code,
      message: body.error.message,
      details: body.error.details,
    });
  }

  return new ApiError({
    status,
    code: ErrorCode.Internal,
    message: 'The server returned an unexpected error.',
  });
}

function isErrorEnvelope(body: unknown): body is ApiErrorBody {
  if (typeof body !== 'object' || body === null || !('error' in body)) {
    return false;
  }

  const error = (body as ApiErrorBody).error;
  return (
    typeof error === 'object' &&
    error !== null &&
    typeof error.code === 'string' &&
    typeof error.message === 'string'
  );
}
